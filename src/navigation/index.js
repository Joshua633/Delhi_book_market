// src/navigation/index.js
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import BuyerStack from './BuyerStack';
import SellerStack from './SellerStack';

const Stack = createStackNavigator();

// Enhanced loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007bff" />
    <Text style={styles.loadingText}>Loading your bookstore experience...</Text>
  </View>
);

// Error screen for better error handling
const ErrorScreen = ({ error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
    <Text style={styles.errorMessage}>{error?.message || 'Unknown error occurred'}</Text>
    <Text style={styles.errorHint}>Please restart the app or check your connection</Text>
  </View>
);

const AppNavigator = () => {
  const { user, loading, error } = useAuth();

  console.log('Navigation - User:', user ? `${user.name} (${user.role})` : 'Not logged in');
  console.log('Navigation - Loading:', loading);

  // Show error screen if there's an authentication error
  if (error) {
    return <ErrorScreen error={error} />;
  }

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: true
      }}
    >
      {user ? (
        // User is logged in - show appropriate stack based on role
        user.role === 'seller' ? (
          <Stack.Screen 
            name="SellerApp" 
            component={SellerStack}
            options={{ title: 'Seller Dashboard' }}
          />
        ) : (
          <Stack.Screen 
            name="BuyerApp" 
            component={BuyerStack}
            options={{ title: 'Bookstore' }}
          />
        )
      ) : (
        // User is not logged in - show auth screens
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              title: 'Sign In',
              animationTypeForReplace: user ? 'pop' : 'push'
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AppNavigator;