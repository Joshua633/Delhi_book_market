// src/screens/buyer/CheckoutScreen.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const CheckoutScreen = ({ navigation, route }) => {
  const { total } = route.params;
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    phone_no: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('buyer_addresses')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddress(data[0].id);
        setFormData({
          address: data[0].address,
          phone_no: data[0].phone_no,
        });
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.address || !formData.phone_no) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // 1. First, check stock for all items
      for (const item of items) {
        const { data: book, error: bookError } = await supabase
          .from('books')
          .select('stock')
          .eq('id', item.book.id)
          .single();

        if (bookError) throw bookError;

        if (book.stock < item.quantity) {
          throw new Error(`Not enough stock for ${item.book.title}. Only ${book.stock} available.`);
        }
      }

      // 2. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            buyer_id: user.id,
            total_price: total,
            status: 'Pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Add order items and update stock
      const orderItems = items.map(item => ({
        order_id: order.id,
        book_id: item.book.id,
        seller_id: item.book.seller_id,
        quantity: item.quantity,
        price: item.book.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Update stock for each book using the `decrement_stock` function
      for (const item of items) {
        const { error: updateError } = await supabase
          .rpc('decrement_stock', {
            book_id: item.book.id,
            quantity_to_deduct: item.quantity
          });

        if (updateError) throw updateError;
      }

      // 5. Save address if new
      if (!selectedAddress) {
        const { error: addressError } = await supabase
          .from('buyer_addresses')
          .insert([
            {
              buyer_id: user.id,
              address: formData.address,
              phone_no: formData.phone_no,
            },
          ]);

        if (addressError) throw addressError;
      }

      // 6. Clear the cart
      await clearCart();

      // **FIX:** Navigate first, then show the alert.
      // This prevents the alert from blocking the screen transition.
      const firstItem = items[0];
      if (firstItem) {
        navigation.navigate('ReviewScreen', { book: firstItem.book });
      } else {
        navigation.navigate('OrderHistory');
      }
      
      Alert.alert('Success', 'Order placed successfully!');

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          {addresses.length > 0 && (
            <View style={styles.addressList}>
              {addresses.map(address => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressOption,
                    selectedAddress === address.id && styles.selectedAddressOption
                  ]}
                  onPress={() => {
                    setSelectedAddress(address.id);
                    setFormData({
                      address: address.address,
                      phone_no: address.phone_no,
                    });
                  }}
                >
                  <Text style={styles.addressText}>{address.address}</Text>
                  <Text style={styles.phoneText}>{address.phone_no}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor={colors.subtleText}
            value={formData.address}
            onChangeText={text => setFormData({ ...formData, address: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={colors.subtleText}
            value={formData.phone_no}
            onChangeText={text => setFormData({ ...formData, phone_no: text })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
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
  contentContainer: {
    padding: 20,
  },
  title: {
    ...typography.header,
    color: colors.text,
    marginBottom: 5,
  },
  total: {
    ...typography.title,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: 15,
  },
  addressList: {
    marginBottom: 10,
  },
  addressOption: {
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  selectedAddressOption: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  addressText: {
    ...typography.subtitle,
    color: colors.text,
  },
  phoneText: {
    ...typography.body,
    color: colors.subtleText,
    marginTop: 2,
  },
  input: {
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    ...typography.body,
    color: colors.text,
    marginBottom: 15,
  },
  placeOrderButton: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: colors.subtleText,
    opacity: 0.6,
  },
  placeOrderButtonText: {
    ...typography.buttonText,
    color: colors.white,
  },
});

export default CheckoutScreen;