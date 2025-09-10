// src/config/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import 'react-native-get-random-values'

const supabaseUrl = 'https://tslkxbsdjyyzisygcalp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzbGt4YnNkanl5emlzeWdjYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDMyOTcsImV4cCI6MjA3MjkxOTI5N30.MGyB4oB37VxPVKUh84v5EmfeerVcab5RMhG49UPxLhs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})