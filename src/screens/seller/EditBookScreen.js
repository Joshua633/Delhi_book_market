import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabase';

const EditBookScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params;

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setDescription(book.description || '');
      setPrice(book.price.toString());
      setStock(book.stock.toString());
      setImageUrl(book.image_url || '');
    }
  }, [book]);

  const handleUpdateBook = async () => {
    if (!title || !price || !stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          stock: parseInt(stock),
          image_url: imageUrl.trim() || null
        })
        .eq('id', book.id);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Book updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Error updating book:', error);
      Alert.alert('Error', 'Failed to update book. Please try again.');
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
        <Text style={styles.title}>Edit Book</Text>
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
        />

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price"
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
              placeholder="Enter stock quantity"
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
          placeholder="Enter image URL"
          placeholderTextColor={colors.subtleText}
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        {imageUrl ? (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Image Preview:</Text>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.imagePreview}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleUpdateBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color={colors.white} style={styles.icon} />
              <Text style={styles.submitButtonText}>Update Book</Text>
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

export default EditBookScreen;