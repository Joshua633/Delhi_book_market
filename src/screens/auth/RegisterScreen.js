// src/screens/auth/RegisterScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(email, password, name, role);
      
      if (result.success) {
        Alert.alert(
          'Success', 
          'Account created successfully! Please check your email for verification.'
        );
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/images/main_icon.png')}
          style={styles.mainIcon} 
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our community of book lovers</Text>
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={24} color="#667788" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#8899AA"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
        
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
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#8899AA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
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
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={24} color="#667788" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#8899AA"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
            style={styles.passwordVisibilityToggle}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#667788" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>I want to:</Text>
        <View style={styles.roleButtons}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'buyer' && styles.roleButtonActive]}
            onPress={() => setRole('buyer')}
          >
            <Ionicons 
              name="cart-outline" 
              size={24} 
              color={role === 'buyer' ? colors.white : colors.subtleText} 
            />
            <Text style={[styles.roleButtonText, role === 'buyer' && styles.roleButtonTextActive]}>
              Buy Books
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'seller' && styles.roleButtonActive]}
            onPress={() => setRole('seller')}
          >
            <Ionicons 
              name="storefront-outline" 
              size={24} 
              color={role === 'seller' ? colors.white : colors.subtleText} 
            />
            <Text style={[styles.roleButtonText, role === 'seller' && styles.roleButtonTextActive]}>
              Sell Books
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.registerButton, isLoading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLinkContainer}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ---
// ### Stylesheet

const colors = {
  primary: '#0E4A71',    
  secondary: '#3A7CA5',  
  background: '#F0F4F8', 
  text: '#1C2C38',       
  subtleText: '#667788', 
  white: '#FFFFFF',
  border: '#DDE5EE',     
};

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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainIcon: {
    width: 100, 
    height: 100, 
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
    marginBottom: 20,
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
    paddingRight: 10,
  },
  passwordVisibilityToggle: {
    padding: 5,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    ...typography.body,
    marginBottom: 10,
    color: colors.subtleText,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 5,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    ...typography.body,
    marginLeft: 8,
    color: colors.subtleText,
  },
  roleButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  registerButton: {
    height: 56,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.7,
  },
  registerButtonText: {
    ...typography.buttonText,
    color: colors.white,
  },
  backLinkContainer: {
    alignSelf: 'center',
  },
  loginText: {
    ...typography.body,
    color: colors.subtleText,
    textAlign: 'center',
  },
  loginLink: {
    ...typography.link,
    color: colors.secondary,
  },
});

export default RegisterScreen;