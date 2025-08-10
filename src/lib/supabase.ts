// src/lib/supabase.ts - Complete Supabase configuration with mock auth
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

// === MOCK DATA FOR DEVELOPMENT ===
export const mockProfiles: UserProfile[] = [
  {
    id: 'admin-1',
    email: 'admin@test.com',
    full_name: 'System Administrator',
    role: 'admin',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'organizer-1',
    email: 'organizer@test.com',
    full_name: 'Event Organizer',
    role: 'organizer',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'member-1',
    email: 'member@test.com',
    full_name: 'Premium Member',
    role: 'member',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock authentication for development
export const mockAuth = {
  signIn: async (email: string, password: string) => {
    const profile = mockProfiles.find(p => p.email === email);
    if (profile && password.includes('Test')) {
      return {
        success: true,
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            user_metadata: { full_name: profile.full_name }
          },
          session: { access_token: 'mock-token' }
        }
      };
    }
    return { success: false, error: 'Invalid credentials' };
  },
  
  getCurrentUser: async () => {
    const storedUser = localStorage.getItem('mock-user');
    return storedUser ? JSON.parse(storedUser) : null;
  },
  
  signOut: async () => {
    localStorage.removeItem('mock-user');
    localStorage.removeItem('mock-profile');
    return { success: true };
  }
};

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
      return {
        success: false,
        error: `Database connection failed: ${error.message}`
      };
    }

    return { success: true };

  } catch (error: any) {
    return {
      success: false,
      error: `Database connection failed: ${error.message}`
    };
  }
}

// Get current user profile
export async function getUserProfile(): Promise<UserProfile | null> {
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
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// Create user profile
export async function createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, options?: { full_name?: string }) {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: options?.full_name || email.split('@')[0],
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign out
export async function signOut() {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
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
