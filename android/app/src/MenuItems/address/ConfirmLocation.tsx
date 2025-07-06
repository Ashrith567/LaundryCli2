import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Button, TextInput, Text, useTheme, Menu } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { useAddress, Address } from '../../context/addressContext';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  ConfirmLocation: { coords: any; address: string };
};

const ConfirmLocation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ConfirmLocation'>>();
  const { coords, address } = route.params;
  const { addAddress, selectAddress } = useAddress();
  const theme = useTheme();

  // State for label selection and custom input
  const [label, setLabel] = useState('Home');
  const [isCustomLabel, setIsCustomLabel] = useState(false);
  // State for menu visibility
  const [menuVisible, setMenuVisible] = useState(false);
  // State for new fields: building name (required) and flat number (optional)
  const [buildingName, setBuildingName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Function to handle label selection from dropdown
  const handleLabelSelect = (selectedLabel: string) => {
    if (selectedLabel === 'Custom') {
      setIsCustomLabel(true);
      setLabel('');
    } else {
      setIsCustomLabel(false);
      setLabel(selectedLabel);
    }
    setMenuVisible(false);
  };

  // Check if Save button should be disabled (label or building name empty)
  const isSaveDisabled = !label.trim() || !buildingName.trim();

  const handleSave = () => {
    const newAddr: Address = {
      id: Date.now().toString(),
      label,
      line1: address,
      city: '',
      state: '',
      zip: '',
      phone: '',
      coords,
      // Include new fields in the saved address
      buildingName,
      flatNumber,
      notes: undefined
    };
    addAddress(newAddr);
    selectAddress(newAddr.id);
    navigation.popToTop();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.pop(2);
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [navigation])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.pop(2)} />
        <Appbar.Content title="Confirm Location" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Deliver Here:</Text>
        <Text numberOfLines={2}>{address}</Text>

        {/* Dropdown for label selection */}
        <View style={styles.input}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.dropdownButton}
              >
                {isCustomLabel && label ? label : label || 'Select Label'}
              </Button>
            }
          >
            <Menu.Item onPress={() => handleLabelSelect('Home')} title="Home" />
            <Menu.Item onPress={() => handleLabelSelect('Work')} title="Work" />
            <Menu.Item onPress={() => handleLabelSelect('Hostel')} title="Hostel" />
            <Menu.Item onPress={() => handleLabelSelect('Custom')} title="Custom" />
          </Menu>
        </View>

        {/* Custom label input field, shown only when Custom is selected */}
        {isCustomLabel && (
          <TextInput
            label="Custom Label"
            value={label}
            onChangeText={setLabel}
            style={styles.input}
          />
        )}

        {/* New input field for Building Name (required) */}
        <TextInput
          label="Building Name"
          value={buildingName}
          onChangeText={setBuildingName}
          style={styles.input}
        />

        {/* New input field for Flat Number (optional) */}
        <TextInput
          label="Flat Number (optional)"
          value={flatNumber}
          onChangeText={setFlatNumber}
          style={styles.input}
        />

        <TextInput
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
        />

        {/* Save button, disabled if required fields are empty */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          disabled={isSaveDisabled}
        >
          Save & Continue
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginVertical: 8 },
  button: { marginTop: 16 },
  // Style for dropdown button
  dropdownButton: { width: '100%' },
});

export default ConfirmLocation;