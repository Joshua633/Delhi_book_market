// src/screens/auth/DashboardScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2 - 10; // 30 padding on each side, 10 margin in between

const DashboardScreen = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    loading: true
  });
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      if (!user) return;
      const { count: booksCount, error: booksError } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .eq('seller_id', user.id);

      const { count: ordersCount, error: ordersError } = await supabase
        .from('order_items')
        .select('*', { count: 'exact' })
        .eq('seller_id', user.id);

      const { data: revenueData, error: revenueError } = await supabase
        .from('order_items')
        .select('price, quantity, orders(status)')
        .eq('seller_id', user.id)
        .eq('orders.status', 'Delivered');

      let totalRevenue = 0;
      if (revenueData) {
        totalRevenue = revenueData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }

      if (booksError || ordersError || revenueError) {
        console.error('Error fetching stats:', booksError || ordersError || revenueError);
        return;
      }

      setStats({
        totalBooks: booksCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue: totalRevenue,
        loading: false
      });
    } catch (error) {
      console.error('Error in fetchDashboardStats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const dashboardActions = [
    { name: 'Manage Books', icon: 'library-outline', screen: 'BookManagement' },
    { name: 'View Orders', icon: 'bag-handle-outline', screen: 'OrderManagement' },
    { name: 'Browse Books', icon: 'search-outline', screen: 'BookListing' },
    { name: 'Sign Out', icon: 'log-out-outline', screen: 'SignOut' },
  ];

  if (stats.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book-outline" size={36} color={colors.secondary} />
          <Text style={styles.statNumber}>{stats.totalBooks}</Text>
          <Text style={styles.statLabel}>Books Listed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={36} color={colors.secondary} />
          <Text style={styles.statNumber}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders Placed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={36} color={colors.secondary} />
          <Text style={styles.statNumber}>${stats.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <View style={styles.actionsHeader}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionsGrid}>
        {dashboardActions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.actionButton,
              action.name === 'Sign Out' && styles.logoutButton
            ]}
            onPress={() => action.name === 'Sign Out' ? signOut() : navigation.navigate(action.screen)}
          >
            <Ionicons 
              name={action.icon} 
              size={32} 
              color={action.name === 'Sign Out' ? colors.white : colors.primary} 
            />
            <Text 
              style={[
                styles.actionButtonText, 
                action.name === 'Sign Out' && styles.actionButtonTextLogout
              ]}
            >
              {action.name}
            </Text>
          </TouchableOpacity>
        ))}
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
    fontSize: 16,
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
    padding: 20,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  welcome: {
    ...typography.header,
    color: colors.primary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  statNumber: {
    ...typography.title,
    color: colors.text,
    marginTop: 10,
  },
  statLabel: {
    ...typography.subtitle,
    color: colors.subtleText,
    marginTop: 5,
    textAlign: 'center',
  },
  actionsHeader: {
    marginBottom: 15,
  },
  actionsTitle: {
    ...typography.title,
    color: colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    width: cardWidth,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1, // To make the card a square
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    ...typography.buttonText,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
  actionButtonTextLogout: {
    color: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    marginTop: 10,
    color: colors.subtleText,
  }
});

export default DashboardScreen;