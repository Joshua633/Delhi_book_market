// src/screens/seller/OrderManagementScreen.js
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      if (!user) return;

      // 1. Get order items for this seller to get order IDs
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('seller_id', user.id);

      if (itemsError) throw itemsError;

      if (!orderItems || orderItems.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = [...new Set(orderItems.map(item => item.order_id))];

      // 2. Get the orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // 3. Get buyer information and order items for each order
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          // Get buyer info
          const { data: buyerData } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', order.buyer_id)
            .single();

          // Get order items for this specific order and seller
          const { data: itemsData } = await supabase
            .from('order_items')
            .select(`
              *,
              books (title, price)
            `)
            .eq('order_id', order.id)
            .eq('seller_id', user.id);

          return {
            ...order,
            buyer: buyerData || { name: 'Unknown', email: '' },
            order_items: itemsData || []
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      Alert.alert('Success', 'Order status updated successfully');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.formCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={[styles.statusTag, styles[`statusTag${item.status}`]]}>
          {item.status}
        </Text>
      </View>

      <Text style={styles.customerInfo}>
        Customer: {item.buyer?.name} ({item.buyer?.email})
      </Text>

      <Text style={styles.orderDate}>
        Date: {new Date(item.created_at).toLocaleDateString()}
      </Text>

      <Text style={styles.totalPrice}>Total: ${item.total_price}</Text>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Items:</Text>
        {item.order_items?.map(orderItem => (
          <View key={orderItem.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{orderItem.books?.title}</Text>
            <Text style={styles.itemDetails}>
              Qty: {orderItem.quantity} × ${orderItem.price}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.statusActions}>
        <Text style={styles.changeStatusText}>Change Status:</Text>
        <View style={styles.statusButtons}>
          {['Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && styles.statusButtonActive
              ]}
              onPress={() => updateOrderStatus(item.id, status)}
            >
              <Text style={[
                styles.statusButtonText,
                item.status === status && styles.statusButtonActiveText
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Management</Text>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>Orders will appear here when customers purchase your books</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchOrders}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.header,
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    ...typography.title,
    color: colors.text,
  },
  statusTag: {
    ...typography.body,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusTagPending: {
    backgroundColor: '#FFE9C4', 
    color: '#8A5300',
  },
  statusTagShipped: {
    backgroundColor: '#C8E6F7',
    color: '#00528A',
  },
  statusTagDelivered: {
    backgroundColor: '#C8F7E4',
    color: '#008A44',
  },
  statusTagCancelled: {
    backgroundColor: '#F7C8D1',
    color: '#8A0028',
  },
  customerInfo: {
    ...typography.subtitle,
    color: colors.subtleText,
    marginBottom: 5,
  },
  orderDate: {
    ...typography.body,
    color: colors.subtleText,
    marginBottom: 5,
  },
  totalPrice: {
    ...typography.title,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 15,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
    marginBottom: 15,
  },
  itemsTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    flexWrap: 'wrap', // Added to allow wrapping
  },
  itemName: {
    ...typography.body,
    color: colors.subtleText,
    flexShrink: 1, // Added to allow text to shrink
    marginRight: 10, // Added for some space
  },
  itemDetails: {
    ...typography.body,
    color: colors.subtleText,
    flexShrink: 0, // Prevents this from shrinking
  },
  statusActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  changeStatusText: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  statusButtonActiveText: {
    color: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...typography.subtitle,
    color: colors.subtleText,
    marginTop: 10,
  },
  emptyText: {
    ...typography.header,
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtext: {
    ...typography.subtitle,
    color: colors.subtleText,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
});

export default OrderManagementScreen;