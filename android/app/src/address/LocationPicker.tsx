import React, { useState, useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Appbar, Button, Text } from 'react-native-paper';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Define navigator props
type RootStackParamList = {
  LocationPicker: undefined;
  LocationSearch: { initialQuery: string };
  ConfirmLocation: { coords: Region; address: string };
};

Geocoder.init('AIzaSyBUbPOsL9VhLs2kyszlZmQyTTVovT57s1Q');

const LocationPicker = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'LocationPicker'>>();
  const [region, setRegion] = useState<Region>({
    latitude: 17.440697,
    longitude: 78.357469,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [address, setAddress] = useState<string>('Fetching location...');

  useEffect(() => {
    // Ask for location permission on Android
    (async () => {
      if (Platform.OS === 'android') {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );
  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    console.warn('Location permission denied');
    return;
  }
}
      Geolocation.getCurrentPosition(
  ({ coords }) => {
    const r: Region = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(r);
    reverseGeocode(r);
  },
  (err) => {
    console.warn("Failed to get location:", err.message);
    setAddress("Unable to fetch location");
  },
  {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
  }
);
    })();
  }, []);

  const reverseGeocode = async (r: Region) => {
    try {
      const res = await Geocoder.from(r.latitude, r.longitude);
      setAddress(res.results[0].formatted_address);
    } catch (e) {
      console.warn(e);
    }
  };

  const onRegionChangeComplete = (r: Region) => {
    setRegion(r);
    reverseGeocode(r);
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Select Location" />
      </Appbar.Header>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        <Marker coordinate={region} />
      </MapView>

      <View style={styles.bottom}>
        <Text numberOfLines={1}>{address}</Text>
        <View style={styles.btnRow}>
          <Button onPress={() => navigation.navigate('LocationSearch', { initialQuery: address })}>
            Search
          </Button>
          <Button
            mode="contained"
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
};

const styles = StyleSheet.create({
  map: { flex: 1 },
  bottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
  },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});

export default LocationPicker;
