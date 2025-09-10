// src/navigation/BuyerStack.js
import { createStackNavigator } from '@react-navigation/stack';
import CartScreen from '../screens/buyer/CartScreen';
import CheckoutScreen from '../screens/buyer/CheckoutScreen';
import OrderHistoryScreen from '../screens/buyer/OrderHistoryScreen';
import ProductScreen from '../screens/buyer/ProductScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';
import ReviewScreen from '../screens/buyer/ReviewScreen';
import StorefrontScreen from '../screens/buyer/StorefrontScreen';

const Stack = createStackNavigator();

const BuyerStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Storefront" 
        component={StorefrontScreen}
        options={{ title: 'DelhiBook' }}
      />
      <Stack.Screen 
        name="Product" 
        component={ProductScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
        options={{ title: 'Order History' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="Review" 
        component={ReviewScreen}
        options={{ title: 'Write a Review' }}
      />
    </Stack.Navigator>
  );
};

export default BuyerStack;