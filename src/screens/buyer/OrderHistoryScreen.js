// src/screens/buyer/OrderHistoryScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

const OrderHistoryScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        books (
                            title,
                            image_url
                        )
                    )
                `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return colors.success;
            case 'Cancelled':
                return colors.danger;
            default:
                return colors.primary;
        }
    };

    const renderOrderItem = ({ item }) => {
        // Fix: Safely handle item.id to prevent TypeError
        const orderIdDisplay = typeof item.id === 'string' ? item.id.substring(0, 8) : item.id;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetails', { order: item })}
            >
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{orderIdDisplay}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                <Text style={styles.orderDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.orderTotal}>Total: ${item.total_price.toFixed(2)}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order History</Text>
            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={50} color={colors.subtleText} />
                        <Text style={styles.emptyText}>No orders found</Text>
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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 20,
    },
    title: {
        ...typography.header,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    orderCard: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
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
        marginBottom: 8,
    },
    orderId: {
        ...typography.title,
        color: colors.text,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.white,
    },
    orderDate: {
        ...typography.body,
        color: colors.subtleText,
        marginBottom: 8,
    },
    orderTotal: {
        ...typography.subtitle,
        color: colors.primary,
        fontWeight: '700',
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

export default OrderHistoryScreen;