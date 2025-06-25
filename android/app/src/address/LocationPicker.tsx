import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Appbar, Button, Text } from 'react-native-paper';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  LocationPicker: undefined;
  LocationSearch: { initialQuery: string };
  ConfirmLocation: { coords: Region; address: string };
};

Geocoder.init('AIzaSyBUbPOsL9VhLs2kyszlZmQyTTVovT57s1Q'); // Replace with your actual key

const DEFAULT_REGION: Region = {
  latitude: 17.440697,
  longitude: 78.357469,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

const { width, height } = Dimensions.get('window');

const LocationPicker = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'LocationPicker'>>();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [address, setAddress] = useState<string>('Fetching location...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locationFetchFailed, setLocationFetchFailed] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show your position on the map.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  }, []);

  const getCurrentLocation = useCallback(() => {
    return new Promise<Region>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        ({ coords }) => {
          const currentRegion: Region = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          resolve(currentRegion);
        },
        (error) => {
          console.warn('GPS error:', error.message, error.code);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // Increased timeout for better reliability
          maximumAge: 10000,
        }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (region: Region) => {
    try {
      setIsLoading(true);
      setLocationFetchFailed(false);
      const res = await Geocoder.from({
        latitude: region.latitude,
        longitude: region.longitude,
      });
      const newAddress = res.results[0]?.formatted_address || 'No address found';
      setAddress(newAddress);
      console.log('Geocoding success:', newAddress, region);
    } catch (error: any) {
      console.warn('Geocoding error:', error?.message || error);
      setAddress('Failed to fetch address');
      setLocationFetchFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInitialLocation = useCallback(async () => {
    setIsLoading(true);
    setLocationFetchFailed(false);
    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        const newRegion = await getCurrentLocation();
        setRegion(newRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
        await reverseGeocode(newRegion);
      } else {
        setRegion(DEFAULT_REGION);
        setAddress('Location permission denied');
        setLocationFetchFailed(true);
      }
    } catch {
      setRegion(DEFAULT_REGION);
      setAddress('Failed to fetch location');
      setLocationFetchFailed(true);
      await reverseGeocode(DEFAULT_REGION);
    } finally {
      setIsLoading(false);
    }
  }, [requestLocationPermission, getCurrentLocation, reverseGeocode]);

  useFocusEffect(
    useCallback(() => {
      fetchInitialLocation();
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [fetchInitialLocation])
  );

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      // Ensure region is updated only if it differs significantly
      if (
        Math.abs(newRegion.latitude - region.latitude) > 0.0001 ||
        Math.abs(newRegion.longitude - region.longitude) > 0.0001 ||
        Math.abs(newRegion.latitudeDelta - region.latitudeDelta) > 0.0001 ||
        Math.abs(newRegion.longitudeDelta - region.longitudeDelta) > 0.0001
      ) {
        setRegion(newRegion);
        console.log('Region updated:', newRegion);
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          reverseGeocode(newRegion);
        }, 2000); // Reduced debounce for faster response
      }
    },
    [region, reverseGeocode]
  );

const styles = StyleSheet.create({
  markerFixed: {
    position: 'absolute',
    top: height / 2 - 32,
    left: width / 2 - 16,
    zIndex: 10,
  },
  markerText: {
    fontSize: 32,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

  return (
  <View style={StyleSheet.absoluteFill}>
    {/* Appbar at the top */}
    <Appbar.Header>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <Appbar.Content title="Select Location" />
    </Appbar.Header>

    {/* Map section below the Appbar */}
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        followsUserLocation={false}
      />

      {/* Center marker */}
      <View pointerEvents="none" style={styles.markerFixed}>
        <Text style={styles.markerText}>📍</Text>
      </View>
    </View>

    {/* Bottom address + buttons */}
    <View style={styles.bottom}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {isLoading && <ActivityIndicator size="small" style={{ marginRight: 8 }} />}
        <Text numberOfLines={1} style={{ flex: 1 }}>{address}</Text>
      </View>

      <View style={styles.btnRow}>
        <Button onPress={() => navigation.navigate('LocationSearch', { initialQuery: address })}>
          Search
        </Button>
        <Button
          mode="contained"
          disabled={isLoading || locationFetchFailed}
          onPress={() =>
            navigation.navigate('ConfirmLocation', {
              coords: region,
              address,
            })
          }
        >
          Confirm Location
        </Button>
      </View>
    </View>
  </View>
);
}
export default LocationPicker;