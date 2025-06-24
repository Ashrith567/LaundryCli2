import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  LocationSearch: { initialQuery: string };
  LocationPicker: { region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } };
};

const LocationSearch = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LocationSearch'>>();

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Search location to add address" />
      </Appbar.Header>
      <GooglePlacesAutocomplete
        placeholder="Try JP Nagar, Siri Gardenia, etc."
        fetchDetails
        onPress={(data, details = null) => {
          if (details) {
            const { lat, lng } = details.geometry.location;
            navigation.replace('LocationPicker', {
              region: { latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 },
            });
          }
        }}
        query={{ key: 'AIzaSyBUbPOsL9VhLs2kyszlZmQyTTVovT57s1Q', language: 'en' }}
        styles={{ container: { flex: 1 }, textInputContainer: { margin: 16 } }}
      />
    </View>
  );
};

export default LocationSearch;