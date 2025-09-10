// src/contexts/AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        // Set loading to true when auth state changes
        setLoading(true);
        
        if (session?.user) {
          console.log('User session found, fetching profile');
          
          try {
            const userData = await fetchUserProfile(session.user.id, false);
            console.log('User profile fetched:', userData);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
          }
        } else {
          console.log('No user session');
          setUser(null);
        }
        
        // Always set loading to false after processing
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId, createIfNotFound = false) => {
    try {
      // First, get the auth user to get the email
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser || !authUser.email) {
        console.log('No auth user or email found');
        return null;
      }

      console.log('Looking for user with email:', authUser.email);

      // Always search by email instead of ID to handle ID mismatches
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found by email:', authUser.email);
          
          if (!createIfNotFound) {
            console.log('Not creating profile because createIfNotFound is false');
            return null;
          }
          
          // If not found by email and allowed to create, create a new profile
          console.log('No profile found, creating one...');
          return await createUserProfile(userId);
        }
        console.error('Error fetching user profile by email:', error);
        return null;
      }
      
      console.log('User found by email:', data);

      // Clean up the role field
      if (data && data.role) {
        data.role = data.role.trim().toLowerCase();
      }
      
      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const createUserProfile = async (userId) => {
    try {
      // Get auth user info to create profile
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('No auth user found');
      }

      console.log('Creating profile for user:', authUser.email);

      // Check if user already exists with this email (double-check)
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .limit(1);

      if (checkError) {
        console.error('Error checking existing users:', checkError);
      }

      // If user already exists, return the existing user
      if (existingUsers && existingUsers.length > 0) {
        console.log('User already exists in database:', existingUsers[0]);
        
        // Clean up the role field
        if (existingUsers[0].role) {
          existingUsers[0].role = existingUsers[0].role.trim().toLowerCase();
        }
        
        return existingUsers[0];
      }

      // Create new user with role from auth metadata
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id: userId, 
          email: authUser.email,
          name: authUser.user_metadata?.name || 'User',
          role: authUser.user_metadata?.role || 'buyer',
          password_hash: 'supabase_auth_managed'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        
        // If duplicate error, fetch existing user
        if (insertError.code === '23505') {
          console.log('Duplicate key error, fetching existing user...');
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email)
            .single();
          
          if (existingUser) {
            console.log('Found existing user after duplicate error:', existingUser);
            
            // Clean up the role field
            if (existingUser.role) {
              existingUser.role = existingUser.role.trim().toLowerCase();
            }
            
            return existingUser;
          }
        }
        
        throw insertError;
      }

      console.log('User profile created successfully:', newUser);
      
      // Clean up the role field
      if (newUser.role) {
        newUser.role = newUser.role.trim().toLowerCase();
      }
      
      return newUser;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const signUp = async (email, password, name, role) => {
    try {
      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          }
        }
      });

      if (authError) {
        if (authError.message.includes('seconds')) {
          const waitTime = parseInt(authError.message.match(/\d+/)[0]);
          throw new Error(`Please wait ${waitTime} seconds before trying again`);
        }
        
        // Check if user already exists
        if (authError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        
        throw authError;
      }

      console.log('Auth user created:', authData.user.id);

      // Wait a moment for the auth system to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create user profile - this is the ONLY place where we allow profile creation
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ 
          id: authData.user.id, 
          email, 
          name, 
          role,
          password_hash: 'supabase_auth_managed'
        }]);

      if (profileError) {
        if (profileError.code === '23505') {
          // User already exists in database
          throw new Error('This email is already registered. Please sign in instead.');
        }
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Get the newly created user
      const userData = await fetchUserProfile(authData.user.id, false);
      setUser(userData);
      
      return { success: true, userId: authData.user.id };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          // Check if user exists in our database but auth failed
          const { data: users } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .limit(1);
          
          if (users && users.length > 0) {
            throw new Error('Invalid password. Please check your credentials.');
          } else {
            throw new Error('No account found with this email. Please sign up first.');
          }
        }
        throw error;
      }

      // Get the authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Fetch user profile - but DON'T create if not found
      const userData = await fetchUserProfile(authUser.id, false);
      
      if (!userData) {
        // User doesn't exist in our database - this shouldn't happen for registered users
        await supabase.auth.signOut(); // Sign out since profile doesn't exist
        throw new Error('No user profile found. Please sign up first.');
      }
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getCurrentUser = async () => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second timeout

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        clearTimeout(timeout);
        return;
      }

      const userData = await fetchUserProfile(authUser.id, false);
      setUser(userData);
    } catch (error) {
      console.error('Error getting current user:', error);
      setUser(null);
    } finally {
      setLoading(false);
      clearTimeout(timeout);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        return await fetchUserProfile(authUser.id, false);
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  const clearAuthData = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      console.log('Auth data cleared successfully');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    clearAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};