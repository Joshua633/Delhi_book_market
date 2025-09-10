// src/screens/buyer/ProductScreen.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../config/supabase';
import { useCart } from '../../contexts/CartContext';

const ProductScreen = ({ route, navigation }) => {
  const { book: initialBook } = route.params;
  const [book, setBook] = useState(initialBook);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the latest stock data when the screen loads
    const fetchBookData = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*, seller:seller_id(name)')
        .eq('id', initialBook.id)
        .single();

      if (error) {
        console.error('Error fetching book data:', error);
      } else {
        setBook(data);
      }
    };
    fetchBookData();
  }, [initialBook.id]);


  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('stock')
        .eq('id', book.id)
        .single();

      if (bookError) throw bookError;
      
      if (bookData.stock < quantity) {
        Alert.alert('Error', `Only ${bookData.stock} items available in stock`);
        return;
      }
      
      // Pass book.id, which should be a UUID string
      await addToCart(book.id, quantity);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add to cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('stock')
        .eq('id', book.id)
        .single();

      if (bookError) throw bookError;
      
      if (bookData.stock < quantity) {
        Alert.alert('Error', `Only ${bookData.stock} items available in stock`);
        return;
      }

      // Pass book.id, which should be a UUID string
      await addToCart(book.id, quantity);
      navigation.navigate('Cart');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add to cart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: book.image_url || 'https://via.placeholder.com/300' }} 
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{book.title}</Text>
        <Text style={styles.productDescription}>{book.description}</Text>
        <Text style={styles.productPrice}>${book.price}</Text>
        <Text style={styles.sellerInfo}>Sold by: {book.seller?.name || 'Unknown'}</Text>
        <Text style={[styles.stockInfo, { color: book.stock > 0 ? colors.success : colors.danger }]}>
          {book.stock > 0 ? `${book.stock} available in stock` : 'Out of Stock'}
        </Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <TouchableOpacity 
            style={[styles.quantityButton, { opacity: book.stock === 0 ? 0.5 : 1 }]}
            onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
            disabled={book.stock === 0}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity 
            style={[styles.quantityButton, { opacity: quantity >= book.stock || book.stock === 0 ? 0.5 : 1 }]}
            onPress={() => setQuantity(prev => Math.min(book.stock, prev + 1))}
            disabled={quantity >= book.stock || book.stock === 0}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.addToCartButton, 
            (book.stock === 0 || loading) && styles.disabledButton
          ]} 
          onPress={handleAddToCart}
          disabled={book.stock === 0 || loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.buyNowButton, 
            (book.stock === 0 || loading) && styles.disabledButton
          ]} 
          onPress={handleBuyNow}
          disabled={book.stock === 0 || loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              {book.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </Text>
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
  productImage: {
    width: '100%',
    height: 350,
    backgroundColor: colors.white,
  },
  productInfo: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productTitle: {
    ...typography.header,
    color: colors.text,
    marginBottom: 5,
  },
  productDescription: {
    ...typography.body,
    color: colors.subtleText,
    marginBottom: 10,
  },
  productPrice: {
    ...typography.title,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 10,
  },
  sellerInfo: {
    ...typography.body,
    color: colors.subtleText,
    marginBottom: 5,
  },
  stockInfo: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    ...typography.subtitle,
    color: colors.text,
    marginRight: 15,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityValue: {
    ...typography.title,
    marginHorizontal: 15,
    color: colors.text,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buyNowButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.buttonText,
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
});

export default ProductScreen;