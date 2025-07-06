import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/cartContext';
import { Appbar, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Define your stack's route names and params
type RootStackParamList = {
  ServiceSelection: undefined;
  YourOrders: undefined;
  // ...other routes
};

// Define the Order type to match cartContext
type Order = {
  id: string;
  serviceName: string;
  totalItems: number;
  totalPrice: number;
  placedAt: string;
  selectedSlot: string;
  status: 'ordered' | 'picked_up' | 'in_progress' | 'delivered' | 'cancelled';
};

const { width } = Dimensions.get('window');

const YourOrders = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { orders } = useCart();
  const { colors } = useTheme();

  const backgroundColor = colors.background;
  const textColor = colors.onBackground;
  const inputBackground = colors.surface;

  // Format the date/time of the order
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const statusSteps = {
    ordered: 0,
    picked_up: 1,
    in_progress: 2,
    delivered: 3,
    cancelled: 4,
  };

  const stepLabels = ['Ordered', 'Picked Up', 'In Progress', 'Delivered', 'Cancelled'];

  const getStatusColor = (status: keyof typeof statusSteps) => {
    switch (status) {
      case 'ordered':
        return '#B5750C'; // orange
      case 'picked_up':
        return '#9752A2'; // purple
      case 'in_progress':
        return '#B3AB52'; // yellow
      case 'delivered':
        return '#5BBF5F'; // green
        case 'cancelled':
        return '#D84D50'; // red
      default:
        return '#aaa';
    }
  };

  // Render an empty state if there are no orders
  if (orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Appbar.Header style={[styles.header, { backgroundColor }]}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color={textColor} />
          <Appbar.Content title="Your Orders" titleStyle={[styles.headerTitle, { color: textColor }]} />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>You have no orders yet.</Text>
        </View>
      </View>
    );
  }

  // Render each order as a card
  const renderOrder = ({ item }: { item: Order }) => {
  const currentStatus = item.status ?? 'ordered'; // default fallback

  return (
    <View style={[styles.orderCard, { backgroundColor: inputBackground }]}>
      {/* Header Row: Service Name + Status Badge */}
      <View style={styles.cardHeader}>
        <Text style={[styles.serviceName, { color: textColor }]}>{item.serviceName}</Text>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
          <Text style={styles.statusText}>{stepLabels[statusSteps[currentStatus]]}</Text>
        </View>
      </View>

      <Text style={[styles.orderDetail, { color: textColor }]}>Items Total: {item.totalItems}</Text>
      <Text style={[styles.orderDetail, { color: textColor }]}>Total: ₹{item.totalPrice}</Text>
      <Text style={[styles.orderDetail, { color: textColor }]}>Pickup Slot: {item.selectedSlot}</Text>
      <Text style={[styles.orderDate, { color: colors.outline }]}>Placed on: {formatDate(item.placedAt)}</Text>
    </View>
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
        <Appbar.Content title="Your Orders" titleStyle={{ fontWeight: 'bold', color: textColor }} />
      </Appbar.Header>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    width: width - 32, // Account for padding
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderDetail: {
    fontSize: 16,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    marginTop: 8,
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
    textAlign: 'center',
  },

  cardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
},
statusText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
},

});

export default YourOrders;