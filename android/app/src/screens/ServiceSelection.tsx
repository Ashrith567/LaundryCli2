import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/cartContext';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

type Service = {
  id: string;
  title: string;
  desc: string;
  icon: string;
};

const services: Service[] = [
  { id: '1', title: 'Wash Laundry', desc: 'Complete cleaning solution', icon: 'tshirt-crew' },
  { id: '2', title: 'Only Wash', desc: 'Basic washing service', icon: 'washing-machine' },
  { id: '3', title: 'Laundry', desc: 'Professional laundry care', icon: 'iron' },
  { id: '4', title: 'Dry Clean', desc: 'Professional dry cleaning', icon: 'iron' },
  { id: '5', title: 'Steam Iron', desc: 'prof. steaming service', icon: 'hair-dryer' },
];

const ServiceSelection = () => {
  const navigation = useNavigation();
  const { cart, resetCart } = useCart();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const backgroundColor = colors.background;
  const textColor = colors.onBackground;
  const inputBackground = colors.surface;
  const borderColor = colors.outline;
  const iconBorderColor = backgroundColor === '#ffffff' ? '#000000' : '#ffffff';

  const toggleMenu = () => {
    const toValue = menuVisible ? -MENU_WIDTH : 0;
    Animated.timing(translateX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const handleOverlayPress = () => {
    if (menuVisible) {
      toggleMenu();
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout' as never);
  };

  const navigateToService = (service: Service) => {
    if (cart?.serviceId && cart.serviceId !== service.id) {
      Alert.alert(
        'Change Service?',
        `You have items from ${cart.serviceName}. Do you want to replace them with items from ${service.title}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            onPress: () => {
              resetCart();
              navigation.navigate(service.title.replace(/\s+/g, '') as never);
            },
          },
        ]
      );
    } else {
      navigation.navigate(service.title.replace(/\s+/g, '') as never);
    }
  };

  const getTotalItems = () => {
    if (!cart) return 0;
    return Object.values(cart.items).reduce((a, b) => a + b, 0);
  };

  const renderCard = ({ item }: { item: Service }) => (
    <View style={[styles.card, { backgroundColor: inputBackground, borderColor }]}>
      <View style={[styles.iconContainer, { borderColor: iconBorderColor }]}>
        <Icon name={item.icon} size={36} color={textColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
      <Text style={[styles.desc, { color: colors.outline }]}>{item.desc}</Text>
      <Button
        mode="contained"
        buttonColor={colors.primary}
        style={styles.button}
        labelStyle={{ color: colors.background }}
        onPress={() => navigateToService(item)}
      >
        Select Service
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: cart ? 100 : 0, backgroundColor }]}>
      <Appbar.Header style={{ marginTop: 8, marginLeft: 10, backgroundColor }}>
        <Appbar.Action icon="menu" onPress={toggleMenu} color={textColor} />
        <Appbar.Content
          title="CleanCare"
          titleStyle={{
            fontFamily: 'serif',
            fontWeight: 'bold',
            textAlign: 'right',
            marginRight: 10,
            color: textColor,
          }}
        />
      </Appbar.Header>

      <FlatList
        data={services}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={1}
        contentContainerStyle={{
          ...styles.list,
          paddingBottom: cart ? 100 : 20,
        }}
        showsVerticalScrollIndicator={false}
      />

      {cart && (
        <View style={[styles.cartFooter, { backgroundColor: colors.surface, borderTopColor: backgroundColor }]}>
          <View style={styles.cartInfo}>
            <Text style={[styles.cartService, { color: textColor }]}>{cart.serviceName}</Text>
            <Text style={[styles.cartItems, { color: colors.outline }]}>Items Total: {getTotalItems()}</Text>
          </View>
          <View style={styles.cartActions}>
            <TouchableOpacity onPress={resetCart} style={styles.deleteButton}>
              <Icon name="delete" size={24} color={colors.error} />
            </TouchableOpacity>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.checkoutButton}
              labelStyle={{ color: colors.background }}
            >
              Checkout
            </Button>
          </View>
        </View>
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.menuContainer,
                { backgroundColor: inputBackground },
                { transform: [{ translateX }] },
              ]}
            >
              <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity
                  style={[styles.profileSection, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    toggleMenu();
                    navigation.navigate('Profile' as never);
                  }}
                >
                  <View style={styles.profileContent}>
                    <Icon name="account-circle" size={40} color={colors.background} />
                    <Text style={[styles.profileText, { color: colors.background }]}>User Name</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.menuItems}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      navigation.navigate('YourOrders' as never);
                    }}
                  >
                    <Icon name="cart-outline" size={24} color={textColor} />
                    <Text style={[styles.menuItemText, { color: textColor }]}>Your Orders</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      navigation.navigate('Addresses' as never);
                    }}
                  >
                    <Icon name="map-marker-outline" size={24} color={textColor} />
                    <Text style={[styles.menuItemText, { color: textColor }]}>Addresses</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      navigation.navigate('Settings' as never);
                    }}
                  >
                    <Icon name="cog-outline" size={24} color={textColor} />
                    <Text style={[styles.menuItemText, { color: textColor }]}>Settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      navigation.navigate('Help' as never);
                    }}
                  >
                    <Icon name="help-circle-outline" size={24} color={textColor} />
                    <Text style={[styles.menuItemText, { color: textColor }]}>Help</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 10,
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  iconContainer: {
    borderRadius: 50,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 19,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 6,
  },
  button: {
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 22,
  },
  cartFooter: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    elevation: 6,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartInfo: {
    flex: 1,
    marginRight: 16,
  },
  cartService: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItems: {
    fontSize: 14,
    marginTop: 4,
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 12,
  },
  checkoutButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: height,
    padding: 16,
  },
  safeArea: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ServiceSelection;