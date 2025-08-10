// src/lib/supabase.ts - Complete Supabase configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client
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
    })
  : null;

// Database Types (you can expand these based on your schema)
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'organizer' | 'member' | 'viewer';
  avatar_url?: string;
  status?: 'approved' | 'pending' | 'suspended';
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
  capacity: number;
  price: number;
  category: string;
  status: 'active' | 'draft' | 'ended' | 'cancelled';
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  quantity: number;
  amount: number;
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
      error: `Connection test failed: ${error.message}`
    };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }

    return user;

  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }

    return session;

  } catch (error) {
    console.error('Error in getCurrentSession:', error);
    return null;
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data as UserProfile;

  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// Create user profile
export async function createUserProfile(user: any): Promise<UserProfile | null> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return null;
    }

    // Determine default role based on email
    let defaultRole: 'admin' | 'organizer' | 'member' = 'member';
    if (user.email?.includes('admin')) {
      defaultRole = 'admin';
    } else if (user.email?.includes('organizer')) {
      defaultRole = 'organizer';
    }

    const profileData = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      role: defaultRole,
      avatar_url: user.user_metadata?.avatar_url,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    console.log('✅ Profile created:', data);
    return data as UserProfile;
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return null;
  }
}

// === AUTHENTICATION FUNCTIONS ===

export async function signInWithEmail(email: string, password: string) {
  try {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Using mock authentication.' 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signUpWithEmail(email: string, password: string, metadata: any = {}) {
  try {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please check your environment variables.' 
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
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

export async function signOut() {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return { success: true };
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

export async function signInWithGoogle() {
  try {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured' 
      };
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

export async function resetPassword(email: string) {
  try {
    if (!supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured' 
      };
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
    return { success: true };
  }
};

// === INITIALIZATION ===

// Initialize and check connection on import
(async () => {
  if (typeof window !== 'undefined') {
    console.log('🚀 Boujee Events - Initializing Supabase...');
    
    if (isSupabaseConfigured()) {
      const connectionTest = await testConnection();
      
      if (connectionTest.success) {
        console.log('✅ Supabase connection successful!');
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
