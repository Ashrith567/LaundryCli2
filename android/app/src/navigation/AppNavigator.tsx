import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CartProvider } from '../context/cartContext';
import { AddressProvider } from '../context/addressContext';
import ServiceSelection from '../screens/ServiceSelection';
import WashLaundry from '../screens/WashLaundry';
import OnlyWash from '../screens/OnlyWash';
import Laundry from '../screens/Laundry';
import Checkout from '../screens/Checkout';
import LoginPage from '../screens/LoginPage';
import DryClean from '../screens/DryClean';
import SteamIron from '../screens/SteamIron';
import YourOrders from '../MenuItems/orders/YourOrders';
import Addresses from '../MenuItems/address/Addresses';
import LocationPicker from '../MenuItems/address/LocationPicker';
import LocationSearch from '../MenuItems/address/LocationSearch';
import ConfirmLocation from '../MenuItems/address/ConfirmLocation';
import Profile from '../MenuItems/profile/Profile';

enableScreens();

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <CartProvider>
      <AddressProvider>
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginPage">
            <Stack.Screen name="LoginPage" component={LoginPage} options={{ headerShown: false }} />
            <Stack.Screen name="ServiceSelection" component={ServiceSelection} options={{ headerShown: false }} />
            <Stack.Screen name="WashLaundry" component={WashLaundry} options={{ headerShown: false }} />
            <Stack.Screen name="OnlyWash" component={OnlyWash} options={{ headerShown: false }} />
            <Stack.Screen name="Laundry" component={Laundry} options={{ headerShown: false }} />
            <Stack.Screen name="Checkout" component={Checkout} options={{ headerShown: false }} />
            <Stack.Screen name="DryClean" component={DryClean} options={{ headerShown: false }} />
            <Stack.Screen name="SteamIron" component={SteamIron} options={{ headerShown: false }} />
            <Stack.Screen name="YourOrders" component={YourOrders} options={{ headerShown: false }} />
            <Stack.Screen name="Addresses" component={Addresses} options={{ headerShown: false }} />
            <Stack.Screen name="LocationPicker" component={LocationPicker} options={{ headerShown: false }} />
            <Stack.Screen name="LocationSearch" component={LocationSearch} options={{ headerShown: false }} />
            <Stack.Screen name="ConfirmLocation" component={ConfirmLocation} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AddressProvider>
    </CartProvider>
  );
};

export default AppNavigator;