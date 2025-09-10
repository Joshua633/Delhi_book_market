import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabase';

const BookListingScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // This effect will run once when the component mounts to load the initial list of books.
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (search = '', pageNum = 0) => {
    if (loading && pageNum !== 0) {
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from('books')
        .select('*, users(name)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      query = query.range(pageNum * 50, (pageNum + 1) * 50 - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching books:', error);
        return;
      }

      setBooks(prevBooks => pageNum === 0 ? data : [...prevBooks, ...data]);
      setHasMore(data.length === 50);
      setPage(pageNum);
    } catch (error) {
      console.error('Error in fetchBooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchBooks(searchQuery, page + 1);
    }
  };
  
  // This function is now responsible for triggering the search
  const handleSearchButtonPress = () => {
    fetchBooks(searchQuery, 0);
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookItem}>
      {item.image_url ? (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.bookImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="image-outline" size={30} color={colors.subtleText} />
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>By {item.users?.name || 'Unknown Seller'}</Text>
        <Text style={styles.bookPrice}>${item.price}</Text>
        <Text style={styles.bookStock}>Available: {item.stock}</Text>
        {item.description && (
          <Text style={styles.bookDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading && page === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Books</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          placeholderTextColor={colors.subtleText}
          value={searchQuery}
          onChangeText={setSearchQuery} // Only updates state
          onSubmitEditing={handleSearchButtonPress}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchButtonPress}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No books found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'No books available yet'}
            </Text>
          </View>
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.footerLoader} />
          ) : null
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    ...typography.subtitle,
    color: colors.text,
  },
  searchButton: {
    padding: 8,
    marginLeft: 10,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookItem: {
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  placeholderImage: {
    width: 80,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: 4,
  },
  bookAuthor: {
    ...typography.subtitle,
    color: colors.subtleText,
    marginBottom: 4,
  },
  bookPrice: {
    ...typography.title,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookStock: {
    ...typography.body,
    color: colors.subtleText,
    marginBottom: 4,
  },
  bookDescription: {
    ...typography.body,
    color: colors.subtleText,
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  footerLoader: {
    marginVertical: 20,
  },
});

export default BookListingScreen;