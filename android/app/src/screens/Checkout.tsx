import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/cartContext';
import { Appbar, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { useAddress } from '../context/addressContext';

type RootStackParamList = {
  ServiceSelection: undefined;
  Addresses: undefined;
};


const Checkout = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { cart, resetCart, addOrder } = useCart();
  const { colors } = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { currentAddress } = useAddress();

  const backgroundColor = colors.background;
  const textColor = colors.onBackground;
  const inputBackground = colors.surface;
  const borderColor = colors.outline;
  const iconBorderColor = backgroundColor === '#ffffff' ? '#000000' : '#ffffff';

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setShowConfirmation(false);
    });

    return unsubscribe;
  }, [navigation]);

  const handleConfirm = () => {
    if (cart) {

      const totalItems = Object.values(cart.items).reduce((a, b) => a + b, 0);

      const order = {
        id: Date.now().toString(),
        serviceName: cart.serviceName,
        totalItems,
        totalPrice: cart.total,
        placedAt: new Date().toISOString(),
        selectedSlot: cart.selectedSlot,
      };

      addOrder(order);

    }
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      resetCart();
      navigation.navigate('ServiceSelection');
    }, 2000);
  };

  if (!cart) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Appbar.Header style={[styles.header, { backgroundColor: inputBackground }]}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color={textColor} />
          <Appbar.Content title="Checkout" titleStyle={[styles.headerTitle, { color: textColor }]} />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>Your cart is empty</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ServiceSelection')}
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            labelStyle={[styles.backButtonLabel, { color: colors.onPrimary }]}
          >
            Back to Services
          </Button>
        </View>
      </View>
    );
  }

  const getTotalItems = () => {
    return Object.values(cart.items).reduce((a, b) => a + b, 0);
  };

  const getItemPrice = (item: string, count: number, serviceId: string) => {
    if (serviceId === '3') {
      if (item === 'Sarees') return count * 30;
      return count * 10;
    }
    if (item === 'Sarees') return count * 40;
    return count * 25;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#ffffff' ? 'dark-content' : 'light-content'}
      />
      <Appbar.Header style={{ marginTop: 8, backgroundColor }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Laundry" titleStyle={{ fontWeight: 'bold', color: textColor }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.addressSection, { backgroundColor: inputBackground }]}>
          {currentAddress ? (
            <>
              <Text style={[styles.addressLabel, { color: textColor }]}>
                Deliver To:
              </Text>
              <Text style={[styles.addressText, { color: textColor }]}>
                {currentAddress.label}: {currentAddress.line1}, {currentAddress.city}
              </Text>
              <Button onPress={() => navigation.navigate('Addresses')} compact>
                Change
              </Button>
            </>
          ) : (
            <View style={styles.addressRow}>
              <Text style={[styles.addressPrompt, { color: textColor }]}>
                Select or Add Address
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Addresses')}
                compact
                icon="plus"
                contentStyle={styles.addIconContent}
                style={styles.addIconButton} children={undefined} />
            </View>
          )}
        </View>
        <View style={[styles.summaryCard, { backgroundColor: inputBackground }]}>
          <Text style={[styles.serviceName, { color: textColor }]}>{cart.serviceName}</Text>
          <Text style={[styles.itemsTotal, { color: textColor }]}>Items Total: {getTotalItems()}</Text>
          {cart.serviceId === '2' ? (
            <>
              <Text style={[styles.kgsText, { color: textColor }]}>Expected Weight: {cart.expectedKgs} kg</Text>
              <Text style={[styles.priceNote, { color: colors.error }]}>
                Price will be updated after measured during pickup
              </Text>
            </>
          ) : (
            Object.entries(cart.items)
              .filter(([_, count]) => count > 0)
              .map(([item, count]) => (
                <View key={item} style={[styles.itemRow, { backgroundColor: inputBackground }]}>
                  <Text style={[styles.itemText, { color: textColor }]}>
                    {item}: {count}
                  </Text>
                  <Text style={[styles.itemPrice, { color: textColor }]}>
                    ₹{getItemPrice(item, count, cart.serviceId)}
                  </Text>
                </View>
              ))
          )}
        </View>

        <View style={[styles.totalCard, { backgroundColor: inputBackground }]}>
          <Text style={[styles.totalLabel, { color: textColor }]}>
            {cart.serviceId === '2' ? 'Expected Total' : 'Total'}
          </Text>
          <Text style={[styles.totalAmount, { color: textColor }]}>₹{cart.total}</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleConfirm}
          disabled={!currentAddress}
          style={[styles.confirmButton, { backgroundColor: colors.primary }]}
          labelStyle={[styles.confirmButtonLabel, { color: colors.background }]}
        >
          {currentAddress ? 'Confirm Order' : 'Add address to continue'}
        </Button>
      </ScrollView>

      <Modal
        isVisible={showConfirmation}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
      >
        <View style={[styles.modalContainer, { backgroundColor: inputBackground }]}>
          <Icon name="check-circle" size={60} color="#4CAF50" style={styles.modalIcon} />
          <Text style={[styles.confirmationText, { color: '#4CAF50' }]}>Order Confirmed!</Text>
          <Text style={[styles.confirmationSubtext, { color: textColor }]}>
            Your order has been placed successfully.
          </Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemsTotal: {
    fontSize: 16,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  kgsText: {
    fontSize: 16,
    marginBottom: 8,
  },
  priceNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  totalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  confirmButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  backButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confirmationSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  addressSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  addressLabel: { fontWeight: '600', marginBottom: 4 },
  addressText: { marginBottom: 8 },
  addAddressBtn: { alignSelf: 'flex-start' },

  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressPrompt: {
    fontSize: 16,
    fontWeight: '500',
  },
  addIconContent: {
    width: 52,
    height: 42,
    marginLeft: 8,
   
  },
  addIconButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },


});

export default Checkout;