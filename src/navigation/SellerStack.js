// src/navigation/SellerStack.js
import { createStackNavigator } from '@react-navigation/stack';
import AddBookScreen from '../screens/seller/AddBookScreen';
import BookDetailScreen from '../screens/seller/BookDetailScreen';
import BookListingScreen from '../screens/seller/BookListingScreen'; // Add this import
import BookManagementScreen from '../screens/seller/BookManagementScreen';
import DashboardScreen from '../screens/seller/DashboardScreen';
import EditBookScreen from '../screens/seller/EditBookScreen';
import OrderManagementScreen from '../screens/seller/OrderManagementScreen';

const Stack = createStackNavigator();

const SellerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007bff',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Delhibook market.in' }}
      />
      <Stack.Screen 
        name="BookManagement" 
        component={BookManagementScreen}
        options={{ title: 'Manage Books' }}
      />
      <Stack.Screen 
        name="AddBook" 
        component={AddBookScreen}
        options={{ title: 'Add New Book' }}
      />
      <Stack.Screen 
        name="EditBook" 
        component={EditBookScreen}
        options={{ title: 'Edit Book' }}
      />
      <Stack.Screen 
        name="BookDetail" 
        component={BookDetailScreen}
        options={{ title: 'Book Details' }}
      />
      <Stack.Screen 
        name="BookListing"  // Make sure this line exists
        component={BookListingScreen}
        options={{ title: 'My Books' }}
      />
      <Stack.Screen 
        name="OrderManagement" 
        component={OrderManagementScreen}
        options={{ title: 'Order Management' }}
      />

    </Stack.Navigator>
  );
};

export default SellerStack;