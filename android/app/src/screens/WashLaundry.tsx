import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/cartContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'react-native';

// List of clothing items
const clothingItems = ['Shirts', 'Pants', 'Sarees'];

// Define time slot type
type TimeSlot = {
  label: string;
  startHour: number;
  endHour: number;
};

// Available time slots
const timeSlots: TimeSlot[] = [
  { label: '8:00 AM - 10:00 AM', startHour: 8, endHour: 10 },
  { label: '10:00 AM - 12:00 PM', startHour: 10, endHour: 12 },
  { label: '12:00 PM - 2:00 PM', startHour: 12, endHour: 14 },
  { label: '2:00 PM - 4:00 PM', startHour: 14, endHour: 16 },
  { label: '4:00 PM - 6:00 PM', startHour: 16, endHour: 18 },
  { label: '6:00 PM - 8:00 PM', startHour: 18, endHour: 20 },
];

// Define your stack's route names and params
type RootStackParamList = {
  Checkout: undefined;
  // ...other routes
};

const WashLaundry = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { cart, setCart } = useCart();
  const { colors } = useTheme();

  const backgroundColor = colors.background;
  const textColor = colors.onBackground;
  const inputBackground = colors.surface;
  const borderColor = colors.background;

  // Initialize item counts from cart if serviceId matches
  const [counts, setCounts] = useState({
    Shirts: cart?.serviceId === '1' ? cart.items.Shirts || 0 : 0,
    Pants: cart?.serviceId === '1' ? cart.items.Pants || 0 : 0,
    Sarees: cart?.serviceId === '1' ? cart.items.Sarees || 0 : 0,
  });

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [showMinItemsError, setShowMinItemsError] = useState(false);

  // Determine disabled time slots based on current time
  const getDisabledSlots = (): string[] => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return timeSlots
      .filter((slot) => currentMinutes >= slot.endHour * 60 - 30)
      .map((slot) => slot.label);
  };

  // Update disabled slots and select default slot
  useEffect(() => {
    const updateSlots = () => {
      const disabled = getDisabledSlots();
      setDisabledSlots(disabled);

      if (!selectedSlot || disabled.includes(selectedSlot)) {
        const firstAvailable = timeSlots.find((slot) => !disabled.includes(slot.label));
        if (firstAvailable) setSelectedSlot(firstAvailable.label);
      }
    };

    updateSlots();
    const interval = setInterval(updateSlots, 60000);
    return () => clearInterval(interval);
  }, [selectedSlot]);

  // Increment item count
  const increment = (item: string) => {
    setCounts((prev) => ({ ...prev, [item]: prev[item as keyof typeof counts] + 1 }));
    setShowMinItemsError(false);
  };

  // Decrement item count
  const decrement = (item: string) => {
    if (counts[item as keyof typeof counts] > 0) {
      setCounts((prev) => ({ ...prev, [item]: prev[item as keyof typeof counts] - 1 }));
      setShowMinItemsError(false);
    }
  };

  // Calculate total items
  const getTotalItems = () => {
    return Object.values(counts).reduce((a, b) => a + b, 0);
  };

  // Calculate total cost
  const calculateTotal = () => {
    return counts.Shirts * 25 + counts.Pants * 25 + counts.Sarees * 40;
  };

  // Handle proceed to checkout
  const handleProceed = () => {
    const totalItems = getTotalItems();
    if (totalItems < 5) {
      setShowMinItemsError(true);
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Please select a time slot');
      return;
    }

    // Update cart with selected items and slot
    setCart({
      serviceId: '1',
      serviceName: 'Wash Laundry',
      items: counts,
      total: calculateTotal(),
      selectedSlot,
      expectedKgs: 0,
    });

    navigation.navigate('Checkout');
  };

  // Render item row with counter
  const renderItemRow = (item: string) => {
    const count = counts[item as keyof typeof counts];
    const isZero = count === 0;

    return (
      <View key={item} style={[styles.itemRow, { backgroundColor: inputBackground, borderColor }]}>
        <Text style={[styles.itemText, { color: textColor }]}>{item}</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={() => decrement(item)}
            disabled={isZero}
            style={[styles.counterButton]}
          >
            <Text style={[styles.counterSymbol, { color: textColor }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.count, { color: textColor }]}>{count}</Text>
          <TouchableOpacity
            onPress={() => increment(item)}
            style={[styles.counterButton]}
          >
            <Text style={[styles.counterSymbol, { color: textColor }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render time slot button
  const renderTimeSlot = (slot: TimeSlot) => {
    const isSelected = selectedSlot === slot.label;
    const isDisabled = disabledSlots.includes(slot.label);

    return (
      <TouchableOpacity
        key={slot.label}
        style={[styles.slotButton, { backgroundColor: inputBackground, borderColor }, isSelected && { borderColor: '#3f3f3f', borderWidth: 2 },
        isDisabled && styles.slotDisabled]}
        onPress={() => !isDisabled && setSelectedSlot(slot.label)}
        disabled={isDisabled}
      >
        {isSelected ? (
          <Icon name="radiobox-marked" size={24} color={colors.onBackground} />
        ) : (
          <Icon name="radiobox-blank" size={24} color={isDisabled ? '#aaa' : textColor} />
        )}
        <Text style={[styles.slotLabel, { color: isDisabled ? '#aaa' : textColor }]}>{slot.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Status bar */}
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />
      {/* App header */}
      <Appbar.Header style={{ marginTop: 8, backgroundColor }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Wash & Laundry" titleStyle={{ fontWeight: 'bold', color: textColor }} />
      </Appbar.Header>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.content}>
        {clothingItems.map(renderItemRow)}

        {/* Time slot selection */}
        <View style={styles.scheduleContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Available slots for Pickup</Text>
          {timeSlots.map(renderTimeSlot)}
        </View>

        {/* Error message for minimum 5 items */}
        {showMinItemsError && (
          <Text style={[styles.errorText, { color: colors.error }]}>Please select at least 5 items to proceed</Text>
        )}

        {/* Proceed button */}
        <Button
          mode="contained"
          onPress={handleProceed}
          style={[styles.proceedButton, { backgroundColor: colors.primary }]}
          labelStyle={{ color: colors.background, fontSize: 16 }}
        >
          Proceed to Checkout
        </Button>
      </ScrollView>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#F4F5F4',
  },
  disabledButton: {
    backgroundColor: '#eee',
    opacity: 0.6,
  },
  counterSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  scheduleContainer: {
    marginTop: 30,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#111',
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  slotLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  slotDisabled: {
    opacity: 0.6,
  },
  slotSelected: {
    borderColor: '#007bff',
  },
  proceedButton: {
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 12,
    marginBottom: -12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WashLaundry;