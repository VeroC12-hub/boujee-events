// src/lib/supabase.ts - Complete Supabase configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client with proper configuration
export const supabase = isSupabaseConfigured() 
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        headers: {
          'x-my-custom-header': 'boujee-events',
        },
      },
    })
  : null;

// Database Types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  role: 'admin' | 'organizer' | 'member' | 'viewer';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time: string;
  venue: string;
  address?: string;
  capacity: number;
  price: number;
  category: string;
  status: 'active' | 'draft' | 'ended' | 'cancelled';
  organizer_id: string;
  featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  booking_number: string;
  quantity: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_intent_id?: string;
  booking_status: 'confirmed' | 'cancelled' | 'pending';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  google_drive_file_id: string;
  google_drive_folder_id?: string;
  thumbnail_url?: string;
  preview_url?: string;
  download_url?: string;
  web_view_link?: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  uploaded_by: string;
  tags?: string[];
  description?: string;
  is_public: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// === HELPER FUNCTIONS ===

// Test database connection
export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase not configured. Please check your environment variables.'
      };
    }

    // Simple test query to check connection
    const { data, error } = await supabase!
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: `Database connection failed: ${error.message}`
      };
    }

    return {
      success: true
    };

  } catch (error: any) {
    console.error('Supabase connection test error:', error);
    return {
      success: false,
      error: `Database connection failed: ${error.message}`
    };
  }
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
}

// Create or update user profile
export async function upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertUserProfile:', error);
    return null;
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, full_name?: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name || email,
      },
    },
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get session
export async function getSession() {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Subscribe to auth changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// Initialize Supabase and test connection
(async () => {
  if (typeof window !== 'undefined') {
    console.log('🚀 Boujee Events - Initializing Supabase...');
    
    if (isSupabaseConfigured()) {
      const connectionTest = await testConnection();
      if (connectionTest.success) {
        console.log('✅ Supabase connection successful');
      } else {
        console.error('❌ Supabase connection failed:', connectionTest.error);
        console.log('📝 Setup instructions:');
        console.log('1. Create a Supabase project at https://supabase.com');
        console.log('2. Update your .env.local file with the correct credentials');
        console.log('3. Run the database schema in your Supabase SQL editor');
        console.log('4. Restart your development server');
      }
    } else {
      console.warn('⚠️ Supabase not configured - using mock authentication');
      console.log('📝 To enable real authentication:');
      console.log('1. Add VITE_SUPABASE_URL to your .env.local');
      console.log('2. Add VITE_SUPABASE_ANON_KEY to your .env.local');
      console.log('3. Restart your development server');
    }
  }
})();

export default supabase;
