// src/config/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-get-random-values'

const supabaseUrl = 'https://url.supabase.co'
const supabaseAnonKey = 'anon_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
