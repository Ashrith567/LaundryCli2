import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, FlatList } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'
import { BackHandler } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '@env';

type RootStackParamList = {
  LocationSearch: { initialQuery: string };
  LocationPicker: { region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } };
};

type RecentLocation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

const LocationSearch = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LocationSearch'>>();
  const initialQuery = route.params?.initialQuery || '';
  const [selectedLocation, setSelectedLocation] = useState<RecentLocation | null>(null);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [searchText, setSearchText] = useState('');

  // Load recent locations
  useEffect(() => {
    const loadRecent = async () => {
      const saved = await AsyncStorage.getItem('recentLocations');
      if (saved) setRecentLocations(JSON.parse(saved));
    };
    loadRecent();
  }, []);

  const handleLocationSelect = (data: any, details: any = null) => {
    if (details) {
      const location = {
        id: details.place_id,
        name: details.formatted_address,
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng
      };
      setSelectedLocation(location);
      
      // Update recent locations
      const updated = [location, ...recentLocations.filter(l => l.id !== details.place_id)].slice(0, 5);
      setRecentLocations(updated);
      AsyncStorage.setItem('recentLocations', JSON.stringify(updated));
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      navigation.replace('LocationPicker', {
        region: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
      });
    }
  };

  useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          navigation.pop(2);
          return true; // prevent default back behavior
        };
  
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
        return () => {
          backHandler.remove();
        };
      }, [navigation])
    );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.pop(2)} />
        <Appbar.Content title="Search location" />
      </Appbar.Header>

      <GooglePlacesAutocomplete
        placeholder="Try sbn boys hostel, etc."
        fetchDetails
        enablePoweredByContainer={false}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
        }}
        textInputProps={{
          defaultValue: initialQuery,
          onChangeText: (text) => setSearchText(text),
        }}
        onPress={handleLocationSelect}
        debounce={200}
        timeout={5000}
        minLength={2}
        nearbyPlacesAPI="GooglePlacesSearch"
        predefinedPlaces={[]}
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
  styles={{
    container: { flex: 1 },
    textInputContainer: { margin: 16 },
    listView: { backgroundColor: 'white' },
  }}
  keyboardShouldPersistTaps="handled"
/>

      {!searchText && recentLocations.length > 0 && (
        <FlatList
          data={recentLocations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}
              onPress={() => {
                setSelectedLocation(item);
                setSearchText(item.name);
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedLocation && (
        <Button 
          mode="contained" 
          onPress={handleConfirm}
          style={{ margin: 16 }}
        >
          Confirm Location
        </Button>
      )}
    </View>
  );
};

export default LocationSearch;