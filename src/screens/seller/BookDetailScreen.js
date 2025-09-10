import { useRoute } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const BookDetailScreen = () => {
  const route = useRoute();
  const { book } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {book.image_url ? (
          <Image 
            source={{ uri: book.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <Text style={styles.title}>{book.title}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>${book.price}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stock:</Text>
          <Text style={styles.detailValue}>{book.stock} available</Text>
        </View>

        {book.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Added on:</Text>
          <Text style={styles.detailValue}>
            {new Date(book.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  detailValue: {
    fontSize: 16,
    color: '#495057',
  },
  descriptionSection: {
    marginTop: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  description: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginTop: 8,
  },
});

export default BookDetailScreen;