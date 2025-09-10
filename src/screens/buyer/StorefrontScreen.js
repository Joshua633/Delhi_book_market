// src/screens/buyer/StorefrontScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const StorefrontScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const { items: cartItems } = useCart();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (query = '') => {
    try {
      setLoading(true);
      let supabaseQuery = supabase
        .from('books')
        .select(`
          *,
          seller:seller_id (name) 
        `)
        .order('created_at', { ascending: false });

      if (query) {
        supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Error fetching books:', error);
        return;
      }

      setBooks(data);
    } catch (error) {
      console.error('Error in fetchBooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBooks(searchQuery);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={() => navigation.navigate('Product', { book: item })}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
        style={styles.bookImage}
        resizeMode="cover"
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookPrice}>${item.price}</Text>
        <Text style={styles.sellerName}>Sold by: {item.seller?.name || 'Unknown'}</Text>
        {item.stock > 0 ? (
          <Text style={styles.inStock}>In Stock</Text>
        ) : (
          <Text style={styles.outOfStock}>Out of Stock</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with navigation */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookstore</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color={colors.primary} />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="receipt-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          placeholderTextColor={colors.subtleText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Books list */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={50} color={colors.subtleText} />
            <Text style={styles.emptyText}>No books found</Text>
          </View>
        }
      />
    </View>
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
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.header,
    color: colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerButton: {
    position: 'relative',
    padding: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 50,
    ...typography.subtitle,
    color: colors.text,
  },
  searchButton: {
    marginLeft: 10,
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  bookCard: {
    flex: 1,
    margin: 5,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: 4,
  },
  bookPrice: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  sellerName: {
    ...typography.body,
    color: colors.subtleText,
    marginBottom: 8,
  },
  inStock: {
    ...typography.body,
    color: colors.success,
  },
  outOfStock: {
    ...typography.body,
    color: colors.danger,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    ...typography.header,
    color: colors.text,
    marginTop: 10,
  },
});

export default StorefrontScreen;