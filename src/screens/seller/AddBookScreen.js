import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

const AddBookScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleAddBook = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to add books');
      return;
    }

    setLoading(true);
    try {
      console.log('Adding book with data:', {
        seller_id: user.id,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: imageUrl.trim() || null
      });

      const { data, error } = await supabase
        .from('books')
        .insert([{
          seller_id: user.id,
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          stock: parseInt(stock),
          image_url: imageUrl.trim() || null
        }])
        .select();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        
        // Handle specific error cases
        if (error.code === '23505') {
          Alert.alert('Error', 'A book with this title already exists');
        } else if (error.code === '23514') {
          Alert.alert('Error', 'Invalid data. Please check your inputs');
        } else {
          throw error;
        }
        return;
      }

      if (data && data.length > 0) {
        Alert.alert('Success', 'Book added successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        throw new Error('No data returned from server');
      }

    } catch (error) {
      console.error('Error adding book:', error);
      
      // More specific error messages
      if (error.message.includes('network')) {
        Alert.alert('Error', 'Network error. Please check your connection');
      } else if (error.message.includes('permission')) {
        Alert.alert('Error', 'You do not have permission to add books');
      } else {
        Alert.alert('Error', `Failed to add book: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Book</Text>
        <View style={{width: 24}} /> 
      </View>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Book Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter book title"
          placeholderTextColor={colors.subtleText}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter book description"
          placeholderTextColor={colors.subtleText}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.subtleText}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.subtleText}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor={colors.subtleText}
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
        />

        {imageUrl ? (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Image Preview:</Text>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.imagePreview}
              resizeMode="contain"
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleAddBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color={colors.white} style={styles.icon} />
              <Text style={styles.submitButtonText}>Add Book</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  danger: '#DC3545',
  success: '#28A745',
};

const typography = {
  header: {
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  title: {
    ...typography.header,
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.white,
    margin: 20,
    marginTop: 30,
    padding: 25,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 8,
    marginTop: 5,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    ...typography.subtitle,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  halfInputContainer: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    ...typography.subtitle,
    color: colors.subtleText,
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.subtleText,
  },
  submitButtonText: {
    ...typography.buttonText,
    color: colors.white,
  },
  icon: {
    marginRight: 10,
  },
});

export default AddBookScreen;