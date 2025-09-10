import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import CartScreen from '../screens/buyer/CartScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';
import OrderHistoryScreen from '../screens/buyer/OrderHistoryScreen';
import ProductScreen from '../screens/buyer/ProductScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';
import ReviewScreen from '../screens/buyer/ReviewScreen'; // <-- 1. IMPORT
import StorefrontScreen from '../screens/buyer/StorefrontScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const CartStack = createStackNavigator();
const OrdersStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Storefront" component={StorefrontScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Product" component={ProductScreen} />
      <HomeStack.Screen name="ReviewScreen" component={ReviewScreen} />
      <HomeStack.Screen name="MyReviewsScreen" component={MyReviewsScreen} />
    </HomeStack.Navigator>
  );
};

const CartStackNavigator = () => {
  return (
    <CartStack.Navigator>
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
      <CartStack.Screen name="ReviewScreen" component={ReviewScreen} /> 
    </CartStack.Navigator>
  );
};

const OrdersStackNavigator = () => {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    </OrdersStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
};

const BuyerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Cart" component={CartStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Orders" component={OrdersStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default BuyerTabNavigator;