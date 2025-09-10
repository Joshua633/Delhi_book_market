// src/screens/seller/BookManagementScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Error boundary for this specific screen
const withBookManagementErrorBoundary = (WrappedComponent) => {
  return (props) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    try {
      if (hasError) {
        return (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
            <Text style={styles.errorText}>Failed to load book management</Text>
            <Text style={styles.errorDetails}>{error?.message || 'Unknown error'}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setHasError(false)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return <WrappedComponent {...props} />;
    } catch (err) {
      console.error('BookManagementScreen error:', err);
      setError(err);
      setHasError(true);
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setHasError(false)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };
};

const BookManagementScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      
      const fetchData = async () => {
        if (!isActive) return;
        await fetchBooks(searchQuery, 0);
      };
      
      fetchData();
      
      return () => {
        isActive = false;
      };
    }, [user?.id]) // Only re-run if user ID changes
  );

  const fetchBooks = async (search = '', pageNum = 0) => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('books')
        .select('*', { count: 'exact' })
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      query = query.range(pageNum * 25, (pageNum + 1) * 25 - 1);

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) {
        throw new Error(`Database error: ${supabaseError.message}`);
      }

      setBooks(prevBooks => pageNum === 0 ? data : [...prevBooks, ...data]);
      setHasMore(data.length === 25);
      setPage(pageNum);
    } catch (err) {
      console.error('Error in fetchBooks:', err);
      setError(err.message || 'Failed to fetch books');
      
      // Only show alert for initial load, not for pagination
      if (pageNum === 0) {
        Alert.alert('Error', 'Failed to load books. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    try {
      Keyboard.dismiss();
      fetchBooks(searchQuery, 0);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed');
      Alert.alert('Error', 'Search operation failed');
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchBooks(searchQuery, page + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks(searchQuery, 0);
  };

  const deleteBook = async (bookId) => {
    try {
      Alert.alert(
        'Delete Book',
        'Are you sure you want to delete this book? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const { error: deleteError } = await supabase
                  .from('books')
                  .delete()
                  .eq('id', bookId);

                if (deleteError) {
                  throw new Error(deleteError.message);
                }

                Alert.alert('Success', 'Book deleted successfully');
                fetchBooks(searchQuery, 0);
              } catch (err) {
                console.error('Error deleting book:', err);
                Alert.alert(
                  'Error', 
                  err.message || 'Failed to delete book. Please try again.'
                );
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error in deleteBook:', err);
      Alert.alert('Error', 'Failed to initiate delete operation');
    }
  };

  const navigateToDetail = (item) => {
    try {
      navigation.navigate('BookDetail', { book: item });
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Error', 'Cannot navigate to book details');
    }
  };

  const navigateToEdit = (item) => {
    try {
      navigation.navigate('EditBook', { book: item });
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Error', 'Cannot navigate to edit screen');
    }
  };

  const navigateToAdd = () => {
    try {
      navigation.navigate('AddBook');
    } catch (err) {
      console.error('Navigation error:', err);
      Alert.alert('Error', 'Cannot navigate to add book screen');
    }
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookItemCard}
      onPress={() => navigateToDetail(item)}
    >
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookDescription} numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>
      </View>
      
      <View style={styles.bookActions}>
        <View style={styles.bookDetails}>
          <Text style={styles.bookPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.bookStock}>Stock: {item.stock || 0}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, styles.editButton]}
            onPress={() => navigateToEdit(item)}
          >
            <Ionicons name="create-outline" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => deleteBook(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (loading && page > 0) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.footerText}>Loading more books...</Text>
        </View>
      );
    }
    
    if (books.length > 0 && !hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>You've reached the end of your book list.</Text>
        </View>
      );
    }
    
    return null;
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your books...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.emptyText}>Failed to load books</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchBooks(searchQuery, 0)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (books.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={80} color={colors.subtleText} style={{ opacity: 0.3 }}/>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No books found' : 'No books listed yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Add your first book to get started.'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.addFirstBookButton}
              onPress={navigateToAdd}
            >
              <Text style={styles.addFirstBookButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>My Books</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={navigateToAdd}
          disabled={loading}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={32} 
            color={loading ? colors.subtleText : colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={24} color={colors.subtleText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your books..."
            placeholderTextColor={colors.subtleText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!loading}
          />
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, loading && styles.disabledButton]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Ionicons 
            name="arrow-forward-circle" 
            size={32} 
            color={loading ? colors.subtleText : colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

// Colors and styles (same as before, with additions)
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
  warning: '#FFC107',
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
    fontSize: 14,
    fontWeight: '600',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  addButton: {
    padding: 5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
    marginBottom: 0,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    ...typography.subtitle,
    color: colors.text,
  },
  searchButton: {
    height: 56,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexGrow: 1,
  },
  bookItemCard: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookInfo: {
    marginBottom: 15,
  },
  bookTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: 5,
  },
  bookDescription: {
    ...typography.body,
    color: colors.subtleText,
    fontStyle: 'italic',
  },
  bookActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 15,
  },
  bookPrice: {
    ...typography.subtitle,
    color: colors.success,
    fontWeight: '600',
  },
  bookStock: {
    ...typography.body,
    color: colors.subtleText,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  editButton: {
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    ...typography.subtitle,
    marginTop: 10,
    color: colors.subtleText,
  },
  emptyText: {
    ...typography.title,
    color: colors.subtleText,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.subtitle,
    color: colors.subtleText,
    marginTop: 5,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.subtleText,
    marginTop: 5,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.title,
    color: colors.danger,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    ...typography.body,
    color: colors.subtleText,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    ...typography.buttonText,
    color: colors.white,
  },
  addFirstBookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addFirstBookButtonText: {
    ...typography.buttonText,
    color: colors.white,
  },
});

// Export with error boundary
export default withBookManagementErrorBoundary(BookManagementScreen);