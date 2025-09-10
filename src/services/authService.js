// src/services/authService.js
import { supabase } from '../config/supabase';

export const authService = {
  // Sign up a new user
  signUp: async (email, password, name, role) => {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Add user to users table
    const { data, error: profileError } = await supabase
      .from('users')
      .insert([{ id: user.id, email, name, role }]);
    
    if (profileError) throw profileError;
    
    return user;
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });
    
    if (error) throw error;
    return user;
  },

  // Sign out current user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    const user = supabase.auth.user();
    if (!user) return null;
    
    // Get user profile from users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },
};