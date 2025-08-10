// src/lib/supabase.ts - Full Featured Implementation
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

// === AUTH FUNCTIONS (Required by AuthContext) ===

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) {
    // Enhanced mock authentication for development
    const mockUsers = [
      { 
        email: 'admin@test.com', 
        password: 'TestAdmin2025', 
        role: 'admin', 
        name: 'System Administrator',
        id: 'admin-1'
      },
      { 
        email: 'organizer@test.com', 
        password: 'TestOrganizer2025', 
        role: 'organizer', 
        name: 'Event Organizer',
        id: 'organizer-1'
      },
      { 
        email: 'member@test.com', 
        password: 'TestMember2025', 
        role: 'member', 
        name: 'Premium Member',
        id: 'member-1'
      }
    ];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const mockSession = {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { 
            full_name: user.name, 
            role: user.role 
          }
        },
        session: { 
          access_token: 'mock-token',
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('mock-user', JSON.stringify(mockSession.user));
      localStorage.setItem('mock-profile', JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: user.name,
        role: user.role,
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      console.log(`✅ Mock login successful: ${user.name} (${user.role})`);
      return { data: mockSession, error: null };
    } else {
      console.log('❌ Mock login failed: Invalid credentials');
      return { data: null, error: { message: 'Invalid email or password' } };
    }
  }

  // Real Supabase authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata: any = {}) => {
  if (!supabase) {
    // Mock signup for development
    const mockUser = {
      id: `mock-${Date.now()}`,
      email,
      user_metadata: { 
        full_name: metadata.full_name || '',
        role: metadata.role || 'member'
      }
    };
    
    // Store mock user
    localStorage.setItem('mock-user', JSON.stringify(mockUser));
    localStorage.setItem('mock-profile', JSON.stringify({
      id: mockUser.id,
      email,
      full_name: metadata.full_name || '',
      role: metadata.role || 'member',
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    console.log('✅ Mock signup successful');
    return { 
      data: { 
        user: mockUser, 
        session: { access_token: 'mock-token' } 
      }, 
      error: null 
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    // Mock signout
    localStorage.removeItem('mock-user');
    localStorage.removeItem('mock-profile');
    console.log('✅ Mock logout successful');
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!supabase) {
    // Mock get current user
    const storedUser = localStorage.getItem('mock-user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('📋 Mock user retrieved:', user.email);
      return user;
    }
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) {
    // Mock get profile
    const storedProfile = localStorage.getItem('mock-profile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      console.log('👤 Mock profile retrieved:', profile.role);
      return profile;
    }
    
    // Fallback to mock profiles
    const mockProfile = mockProfiles.find(p => p.id === userId);
    return mockProfile || null;
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
};

export const createUserProfile = async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
  if (!supabase) {
    // Mock create profile
    const fullProfile: UserProfile = {
      id: profile.id || `mock-${Date.now()}`,
      email: profile.email || '',
      full_name: profile.full_name || '',
      role: profile.role || 'member',
      status: profile.status || 'approved',
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...profile
    };
    
    localStorage.setItem('mock-profile', JSON.stringify(fullProfile));
    console.log('✅ Mock profile created');
    return fullProfile;
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
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  if (!supabase) {
    // Mock profile update
    const storedProfile = localStorage.getItem('mock-profile');
    if (storedProfile) {
      const currentProfile = JSON.parse(storedProfile);
      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('mock-profile', JSON.stringify(updatedProfile));
      console.log('✅ Mock profile updated');
      return updatedProfile;
    }
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

// Database status check
export function getDatabaseStatus() {
  return {
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Not configured',
    hasAnonKey: !!supabaseAnonKey,
    client: supabase ? 'Connected' : 'Mock mode',
    mode: supabase ? '🟢 Database Mode' : '🟡 Mock Mode'
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

// Test credentials for easy reference
export const testCredentials = {
  admin: { email: 'admin@test.com', password: 'TestAdmin2025' },
  organizer: { email: 'organizer@test.com', password: 'TestOrganizer2025' },
  member: { email: 'member@test.com', password: 'TestMember2025' }
};

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
