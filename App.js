// App.js - Enhanced with comprehensive error handling
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Alert, LogBox, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation';

// Ignore specific warnings (optional)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Enhanced error boundary with recovery option
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could log this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.toString()}
          </Text>
          <Button 
            title="Try Again" 
            onPress={this.handleReset}
            style={styles.retryButton}
          />
          <Button 
            title="Report Issue" 
            onPress={() => {
              // Implement error reporting
              Alert.alert(
                "Report Issue",
                "Would you like to report this error?",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  { 
                    text: "Report", 
                    onPress: () => {
                      // Here you would implement your error reporting logic
                      console.log("Error reported:", this.state.error, this.state.errorInfo);
                      Alert.alert("Thank you", "Your report has been submitted.");
                    }
                  }
                ]
              );
            }}
            style={styles.reportButton}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

// Loading component with error handling
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

// Error display component for API or other errors
const ErrorDisplay = ({ error, onRetry }) => {
  if (!error) return null;
  
  return (
    <View style={styles.inlineErrorContainer}>
      <Text style={styles.inlineErrorText}>
        {typeof error === 'string' ? error : 'An error occurred'}
      </Text>
      {onRetry && (
        <Button 
          title="Retry" 
          onPress={onRetry} 
          style={styles.smallButton}
        />
      )}
    </View>
  );
};

// Main App Component with Navigation and error handling
const AppContent = () => {
  const { user, loading, error: authError, refetch } = useAuth();
  const [navigationError, setNavigationError] = React.useState(null);

  // Handle navigation errors
  const handleNavigationError = (error) => {
    console.error('Navigation error:', error);
    setNavigationError(error);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.flexContainer}>
      <ErrorDisplay 
        error={authError} 
        onRetry={refetch} 
      />
      <ErrorDisplay 
        error={navigationError} 
        onRetry={() => setNavigationError(null)}
      />
      
      <NavigationContainer
        onUnhandledAction={(action) => {
          console.warn('Unhandled navigation action:', action);
        }}
        onStateChange={(state) => {
          // Optional: track navigation state changes
        }}
        fallback={<LoadingScreen />}
      >
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
};

// Safe render component to prevent crashes during rendering
const SafeRender = ({ children, fallback }) => {
  try {
    return children;
  } catch (error) {
    console.error('Rendering error:', error);
    return fallback || (
      <View style={styles.errorContainer}>
        <Text>Component rendering failed</Text>
      </View>
    );
  }
};

// Root App Component
const App = () => {
  const [globalError, setGlobalError] = React.useState(null);

  // Global error handler
  React.useEffect(() => {
    // Set up global error handling
    const defaultErrorHandler = ErrorUtils.getGlobalHandler();
    
    const customErrorHandler = (error, isFatal) => {
      console.error('Global error:', error, isFatal);
      setGlobalError(error);
      
      if (isFatal) {
        Alert.alert(
          "Unexpected error occurred",
          "We need to restart the app. Please contact support if this persists.",
          [{ text: "OK", onPress: () => {
            // Restart app or navigate to safe state
          }}]
        );
      }
      
      // Call original handler
      defaultErrorHandler(error, isFatal);
    };
    
    ErrorUtils.setGlobalHandler(customErrorHandler);
    
    return () => {
      ErrorUtils.setGlobalHandler(defaultErrorHandler);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeRender
          fallback={
            <View style={styles.errorContainer}>
              <Text>Application failed to initialize</Text>
            </View>
          }
        >
          {globalError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Application Error</Text>
              <Button 
                title="Restart App" 
                onPress={() => setGlobalError(null)}
              />
            </View>
          ) : (
            <AuthProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </AuthProvider>
          )}
        </SafeRender>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

// Button component with error boundary
const Button = ({ title, onPress, style }) => {
  const handlePress = () => {
    try {
      onPress();
    } catch (error) {
      console.error('Button press error:', error);
      Alert.alert("Error", "An action failed to execute.");
    }
  };

  return (
    <View style={[styles.button, style]}>
      <Text onPress={handlePress} style={styles.buttonText}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  inlineErrorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    alignItems: 'center',
  },
  inlineErrorText: {
    color: '#d32f2f',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  smallButton: {
    padding: 5,
    backgroundColor: '#28a745',
  },
  retryButton: {
    backgroundColor: '#007bff',
  },
  reportButton: {
    backgroundColor: '#6c757d',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

// Higher Order Component for error handling
const withErrorHandling = (WrappedComponent, FallbackComponent) => {
  return (props) => {
    try {
      return <WrappedComponent {...props} />;
    } catch (error) {
      console.error('Component error:', error);
      return FallbackComponent ? (
        <FallbackComponent error={error} />
      ) : (
        <View style={styles.errorContainer}>
          <Text>Component failed to render</Text>
        </View>
      );
    }
  };
};

export default App;