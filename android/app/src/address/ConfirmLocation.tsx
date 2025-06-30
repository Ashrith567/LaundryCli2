import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Button, TextInput, Text, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { useAddress, Address } from '../context/addressContext';
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

  const [label, setLabel] = useState('Home');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const newAddr: Address = { id: Date.now().toString(), label, line1: address, city: '', state: '', zip: '', phone: '', coords };
    addAddress(newAddr);
    selectAddress(newAddr.id);
    navigation.popToTop();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.pop(2)} />
        <Appbar.Content title="Confirm Location" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Deliver Here:</Text>
        <Text numberOfLines={2}>{address}</Text>
        <TextInput
          label="Label"
          value={label}
          onChangeText={setLabel}
          style={styles.input}
        />
        <TextInput
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleSave} style={styles.button}>
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
});

export default ConfirmLocation;
