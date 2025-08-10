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
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get current user profile
export async function getCurrentUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (!supabase) {
      // Return mock profile for development
      return mockProfiles.find(p => p.id === userId) || null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
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

// Create user profile
export async function createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    if (!supabase) {
      // Mock profile creation
      const newProfile: UserProfile = {
        id: profile.id || `mock-${Date.now()}`,
        email: profile.email || '',
        full_name: profile.full_name || '',
        role: profile.role || 'member',
        status: profile.status || 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...profile
      };
      return newProfile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
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

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    if (!supabase) {
      // Mock profile update
      console.log('Mock: Updated profile for user', userId, updates);
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
}

// Database status check
export function getDatabaseStatus() {
  return {
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Not configured',
    hasAnonKey: !!supabaseAnonKey,
    client: supabase ? 'Connected' : 'Mock mode'
  };
}

// Initialize database (for development)
export async function initializeDatabase() {
  if (!supabase) {
    console.log('🔧 Database initialized in mock mode');
    console.log('📝 Test credentials available:');
    console.log('   Admin: admin@test.com / TestAdmin2025');
    console.log('   Organizer: organizer@test.com / TestOrganizer2025');
    console.log('   Member: member@test.com / TestMember2025');
    return { success: true, mode: 'mock' };
  }

  try {
    const { success, error } = await testConnection();
    
    if (success) {
      console.log('✅ Database connected successfully');
      return { success: true, mode: 'connected' };
    } else {
      console.warn('⚠️ Database connection failed:', error);
      console.log('🔄 Falling back to mock mode');
      return { success: false, error, mode: 'mock' };
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return { success: false, error, mode: 'mock' };
  }
}

// Auto-initialize on import
(async () => {
  if (typeof window !== 'undefined') {
    const status = await initializeDatabase();
    
    if (!status.success && status.mode === 'mock') {
      if (supabaseUrl && supabaseAnonKey) {
        console.log('📋 Supabase configured but connection failed');
        console.log('1. Check your Supabase project is running');
        console.log('2. Verify your environment variables');
        console.log('3. Ensure database schema is applied');
        console.log('4. Check Row Level Security policies');
      } else {
        console.warn('⚠️ Supabase not configured - using mock authentication');
        console.log('📝 To enable real authentication:');
        console.log('1. Add VITE_SUPABASE_URL to your .env.local');
        console.log('2. Add VITE_SUPABASE_ANON_KEY to your .env.local');
        console.log('3. Apply the database schema');
        console.log('4. Restart your development server');
      }
    }
  }
})();

export default supabase;
