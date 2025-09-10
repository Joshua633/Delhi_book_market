// src/contexts/CartContext.js
import { createContext, useContext, useEffect, useReducer } from 'react';
import { supabase } from '../config/supabase';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { items: action.payload, loading: false };
    case 'ADD_ITEM':
      return { 
        ...state, 
        items: [...state.items, action.payload] 
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_CART':
      return { items: [], loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [], 
    loading: true 
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          quantity,
          books (
            id,
            title,
            price,
            image_url,
            seller_id
          )
        `)
        .eq('buyer_id', user.id);

      if (error) throw error;

      const cartItems = data.map(item => ({
        id: item.id,
        quantity: item.quantity,
        book: item.books
      }));

      // No change needed here, as the id should already be a string from the database.
      // But it is good practice to confirm this
      dispatch({ type: 'SET_CART', payload: cartItems });
    } catch (error) {
      console.error('Error fetching cart items:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const checkStock = async (bookId, quantity) => {
    try {
      const { data: book, error } = await supabase
        .from('books')
        .select('stock')
        .eq('id', bookId)
        .single();
  
      if (error) throw error;
      return book.stock >= quantity;
    } catch (error) {
      console.error('Error checking stock:', error);
      return false;
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const hasSufficientStock = await checkStock(bookId, quantity);
      if (!hasSufficientStock) {
        throw new Error('Not enough stock available');
      }

      const { data, error } = await supabase
        .from('cart')
        .upsert(
          { 
            buyer_id: user.id, 
            book_id: bookId, 
            quantity 
          },
          { 
            onConflict: 'buyer_id,book_id',
            ignoreDuplicates: false
          }
        )
        .select(`
          id,
          quantity,
          books (
            id,
            title,
            price,
            image_url,
            seller_id
          )
        `)
        .single();

      if (error) throw error;

      const newItem = {
        id: data.id,
        quantity: data.quantity,
        book: data.books
      };

      dispatch({ type: 'ADD_ITEM', payload: newItem });
      return newItem;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: cartItem, error: cartError } = await supabase
        .from('cart')
        .select('book_id')
        .eq('id', itemId)
        .single();
  
      if (cartError) throw cartError;
  
      const hasSufficientStock = await checkStock(cartItem.book_id, newQuantity);
      if (!hasSufficientStock) {
        throw new Error('Not enough stock available');
      }

      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .select(`
          id,
          quantity,
          books (
            id,
            title,
            price,
            image_url,
            seller_id
          )
        `)
        .single();

      if (error) throw error;

      const updatedItem = {
        id: data.id,
        quantity: data.quantity,
        book: data.books
      };

      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
      return updatedItem;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('buyer_id', user.id);

      if (error) throw error;

      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const value = {
    items: state.items,
    loading: state.loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;