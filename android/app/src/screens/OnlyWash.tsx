import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/cartContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'react-native';

const clothingItems: string[] = ['Shirts', 'Pants', 'Sarees', 'Towels', 'Bedsheets', 'Blankets', 'Pillow Covers'];

interface TimeSlot {
  label: string;
  startHour: number;
  endHour: number;
}

const timeSlots: TimeSlot[] = [
  { label: '8:00 AM - 10:00 AM', startHour: 8, endHour: 10 },
  { label: '10:00 AM - 12:00 PM', startHour: 10, endHour: 12 },
  { label: '12:00 PM - 2:00 PM', startHour: 12, endHour: 14 },
  { label: '2:00 PM - 4:00 PM', startHour: 14, endHour: 16 },
  { label: '4:00 PM - 6:00 PM', startHour: 16, endHour: 18 },
  { label: '6:00 PM - 8:00 PM', startHour: 18, endHour: 20 },
];

type RootStackParamList = {
  Checkout: undefined;
};

interface CartItems {
  Shirts: number;
  Pants: number;
  Sarees: number;
  Towels: number;
  Bedsheets: number;
  Blankets: number;
  'Pillow Covers': number;
  [key: string]: number;
}

const OnlyWash: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { cart, setCart } = useCart();
  const { colors } = useTheme();

  const backgroundColor = colors.background;
  const textColor = colors.onBackground;
  const inputBackground = colors.surface;
  const borderColor = colors.background;

  const [counts, setCounts] = useState<CartItems>({
    Shirts: cart?.serviceId === '2' ? cart.items.Shirts || 0 : 0,
    Pants: cart?.serviceId === '2' ? cart.items.Pants || 0 : 0,
    Sarees: cart?.serviceId === '2' ? cart.items.Sarees || 0 : 0,
    Towels: cart?.serviceId === '2' ? cart.items.Towels || 0 : 0,
    Bedsheets: cart?.serviceId === '2' ? cart.items.Bedsheets || 0 : 0,
    Blankets: cart?.serviceId === '2' ? cart.items.Blankets || 0 : 0,
    'Pillow Covers': cart?.serviceId === '2' ? cart.items['Pillow Covers'] || 0 : 0,
  });

  const [expectedKgs, setExpectedKgs] = useState<number>(cart?.serviceId === '2' ? cart.expectedKgs || 1 : 1);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [showError, setShowError] = useState<boolean>(false);

  const getDisabledSlots = (): string[] => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return timeSlots
      .filter((slot) => currentMinutes >= slot.endHour * 60 - 30)
      .map((slot) => slot.label);
  };

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

  const increment = (item: keyof CartItems) => {
    setCounts((prev) => ({ ...prev, [item]: prev[item] + 1 }));
    setShowError(false);
  };

  const decrement = (item: keyof CartItems) => {
    if (counts[item] > 0) {
      setCounts((prev) => ({ ...prev, [item]: prev[item] - 1 }));
      setShowError(false);
    }
  };

  const incrementKgs = () => {
    setExpectedKgs((prev) => prev + 1);
  };

  const decrementKgs = () => {
    if (expectedKgs > 1) {
      setExpectedKgs((prev) => prev - 1);
    }
  };

  const getTotalItems = (): number => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  };

  const calculateTotal = (): number => {
    return expectedKgs * 69;
  };

  const handleProceed = () => {
    const totalItems = getTotalItems();
    if (totalItems < 1) {
      setShowError(true);
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Please select a time slot');
      return;
    }

    setCart({
      serviceId: '2',
      serviceName: 'Only Wash',
      items: counts,
      total: calculateTotal(),
      selectedSlot,
      expectedKgs,
    });

    navigation.navigate('Checkout');
  };

  const renderItemRow = (item: keyof CartItems) => {
    const count = counts[item];
    const isZero = count === 0;

    return (
      <View key={item} style={[styles.itemRow, { backgroundColor: inputBackground, borderColor }]}>
        <Text style={[styles.itemText, { color: textColor }]}>{item}</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={() => decrement(item)}
            disabled={isZero}
            style={[styles.counterButton, isZero ? styles.disabledButton : styles.activeButton,]}
          >
            <Text style={[styles.counterSymbol, { color: textColor }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.count, { color: textColor }]}>{count}</Text>
          <TouchableOpacity
            onPress={() => increment(item)}
            style={[styles.counterButton, styles.activeButton,]}
          >
            <Text style={[styles.counterSymbol, { color: textColor }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderKgsSelector = () => {
    return (
      <View style={[styles.kgsContainer, { backgroundColor: inputBackground, borderColor: textColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Expected Weight (kg)</Text>
        <View style={styles.kgsRow}>
          <TouchableOpacity
            onPress={decrementKgs}
            disabled={expectedKgs <= 1}
            style={[styles.counterButton, expectedKgs <= 1 ? styles.disabledButton : styles.activeButton,]}
          >
            <Text style={[styles.counterSymbol, { color: textColor }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.kgsText, { color: textColor }]}>{expectedKgs} kg</Text>
          <TouchableOpacity
            onPress={incrementKgs}
            style={[styles.counterButton, styles.activeButton,]}
          >
            <Text style={[styles.counterSymbol, { color: textColor }]}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.kgsPrice, { color: textColor }]}>₹69 per kg</Text>
        <Text style={[styles.kgsPriceMessage, { color: colors.error }]}>Selected items should weigh at least 1kg</Text>
      </View>
    );
  };

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
        <Icon
          name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
          size={24}
          color={isSelected ? colors.primary : isDisabled ? '#aaa' : textColor}
        />
        <Text style={[styles.slotLabel, { color: isDisabled ? '#aaa' : textColor }]}>{slot.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />
      <Appbar.Header style={{ marginTop: 8, backgroundColor }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Only Wash" titleStyle={{ fontWeight: 'bold', color: textColor }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {clothingItems.map((item) => renderItemRow(item as keyof CartItems))}
        <Text style={[styles.itemNote, { color: colors.error }]}>
          Note: Providing exact items count ensures no items are missed during delivery.
        </Text>

        {renderKgsSelector()}

        <View style={styles.scheduleContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Available slots for Pickup</Text>
          {timeSlots.map(renderTimeSlot)}
        </View>

        {showError && (
          <Text style={[styles.errorText, { color: colors.error }]}>Please select at least 1 item to continue</Text>
        )}

        <Button
          mode="contained"
          onPress={handleProceed}
          style={[styles.proceedButton, { backgroundColor: colors.primary }]}
          labelStyle={[styles.proceedButtonLabel, { color: colors.background }]}
        >
          Proceed to Checkout
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
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
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
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
  activeButton: {},
  disabledButton: {
    opacity: 0.6,
  },
  counterSymbol: {
    fontSize: 20,
    fontWeight: '600',
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemNote: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  kgsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
  },
  kgsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  kgsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  kgsPrice: {
    fontSize: 16,
    textAlign: 'center',
  },
  kgsPriceMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  scheduleContainer: {
    marginTop: 30,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
  },
  slotLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  slotDisabled: {
    opacity: 0.6,
  },
  slotSelected: {
    borderWidth: 2,
  },
  proceedButton: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 30,
    paddingVertical: 8,
  },
  proceedButtonLabel: {
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    marginBottom: -12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OnlyWash;