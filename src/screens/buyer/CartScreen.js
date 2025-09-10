// src/screens/buyer/CartScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const CartScreen = ({ navigation }) => {
  const { items, loading, updateQuantity, removeFromCart } = useCart();
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    calculateTotal();
  }, [items]);

  const calculateTotal = () => {
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.book.price * item.quantity);
    }, 0);
    setTotal(totalAmount);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Add some items to proceed to checkout.');
      return;
    }
    navigation.navigate('Checkout', { total });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.book.image_url || 'https://via.placeholder.com/100' }} 
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.book.title}</Text>
        <Text style={styles.itemPrice}>${item.book.price}</Text>
        <Text style={styles.sellerName}>Seller: {item.book.seller?.name || 'Unknown'}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove-outline" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color={colors.danger} />
      </TouchableOpacity>
    </View>
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
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={50} color={colors.subtleText} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        }
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  listContent: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    ...typography.title,
    marginBottom: 5,
    color: colors.text,
  },
  itemPrice: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 5,
  },
  sellerName: {
    ...typography.body,
    color: colors.subtleText,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
  },
  quantityButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityValue: {
    marginHorizontal: 15,
    ...typography.subtitle,
    color: colors.text,
  },
  removeButton: {
    padding: 10,
  },
  removeButtonText: {
    color: colors.danger,
    ...typography.body,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalText: {
    ...typography.title,
    marginBottom: 10,
    textAlign: 'right',
    color: colors.text,
  },
  checkoutButton: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: colors.white,
    ...typography.buttonText,
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
    color: colors.subtleText,
    marginTop: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default CartScreen;