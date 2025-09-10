// src/screens/buyer/ReviewScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
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

const ReviewScreen = ({ route, navigation }) => {
  const { book } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            buyer_id: user.id,
            book_id: book.id,
            rating: rating,
            comment: comment,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Review submitted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons 
            name={i <= rating ? "star" : "star-outline"} 
            size={32} 
            color={i <= rating ? "#ffcc00" : "#ccc"} 
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Review {book.title}</Text>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Your Rating:</Text>
        <View style={styles.starsContainer}>
          {renderStars()}
        </View>
      </View>

      <Text style={styles.label}>Your Review:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
        placeholder="Share your thoughts about this book..."
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewScreen;