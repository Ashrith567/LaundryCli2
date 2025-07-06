import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Button, Card, RadioButton, Text, useTheme } from 'react-native-paper';
import { useAddress } from '../../context/addressContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = { Addresses: undefined; LocationPicker: undefined };

const Addresses = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Addresses'>>();
  const { addresses = [], currentAddress, selectAddress } = useAddress();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Your Addresses" />
        <Appbar.Action icon="plus" onPress={() => navigation.navigate('LocationPicker')} />
      </Appbar.Header>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={addresses.length === 0 ? styles.empty : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Button mode="outlined" onPress={() => navigation.navigate('LocationPicker')} icon="plus">
              Add new address
            </Button>
          </View>
        }
        renderItem={({ item }) => {
          const selected = currentAddress?.id === item.id;
          // Construct full address string with optional fields
          const addressDetails = [
            item.buildingName,
            item.flatNumber ? `Flat ${item.flatNumber}` : null,
            item.line1,
            item.city,
            item.state,
            item.zip,
            item.notes ? `Notes: ${item.notes}` : null,
          ].filter(Boolean).join(', ');

          return (
            <Card style={styles.card} onPress={() => selectAddress(item.id)}>
              <Card.Content style={styles.cardContent}>
                <RadioButton.Android value={item.id} status={selected ? 'checked' : 'unchecked'} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  {/* Updated to display label and full address details */}
                  <Card.Title title={item.label} subtitle={addressDetails} subtitleNumberOfLines={3} />
                </View>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { margin: 16, borderRadius: 8 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
});

export default Addresses;