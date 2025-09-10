// src/screens/auth/LoginScreen.js
import { Ionicons } from '@expo/vector-icons'; // Assuming you have Expo for icons
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // Import Image
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        // Navigation is handled by the AuthContext state change
      } else {
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Replaced Ionicons with Image component for main_icon.png */}
        <Image 
          source={require('../../../assets/images/main_icon.png')} // Adjust path if necessary
          style={styles.mainIcon} 
        />
        <Text style={styles.title}>Delhibook</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="#667788" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8899AA"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#667788" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8899AA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Toggle secureTextEntry
          />
          {/* Eye icon for password visibility toggle */}
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.passwordVisibilityToggle}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#667788" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.registerLinkContainer}
        onPress={navigateToRegister}
      >
        <Text style={styles.registerText}>
          Don't have an account? <Text style={styles.registerLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ---
// ### Stylesheet

// Color Palette
const colors = {
  primary: '#0E4A71',    // A deep, classic blue for primary actions and headings
  secondary: '#3A7CA5',  // A lighter, complementary blue
  background: '#F0F4F8', // A very light gray-blue for the background
  text: '#1C2C38',       // Dark, readable text
  subtleText: '#667788', // Subtle gray for placeholders and secondary text
  white: '#FFFFFF',
  border: '#DDE5EE',     // A light, soft border color
};

// Typography
const typography = {
  header: {
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainIcon: { // Style for the new image icon
    width: 100, // Adjust size as needed
    height: 100, // Adjust size as needed
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    ...typography.header,
    color: colors.primary,
    marginTop: 15,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.subtleText,
    marginTop: 5,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 56,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingRight: 10, // Add padding to make space for the eye icon
  },
  passwordVisibilityToggle: {
    padding: 5, // Make the touch target larger
  },
  loginButton: {
    height: 56,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3, // subtle shadow for elevation effect
  },
  buttonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.7,
  },
  loginButtonText: {
    ...typography.buttonText,
    color: colors.white,
  },
  registerLinkContainer: {
    paddingVertical: 10,
    alignSelf: 'center',
  },
  registerText: {
    ...typography.body,
    color: colors.subtleText,
    textAlign: 'center',
  },
  registerLink: {
    ...typography.link,
    color: colors.secondary,
  },
});

export default LoginScreen;