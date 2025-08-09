// ===========================================================================
// PRODUCTION SUPABASE CLIENT
// File: src/lib/supabase.ts
// Replace your existing supabase.ts with this file
// ===========================================================================

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
export const isSupabaseConfigured = (): boolean => {
  const isConfigured = !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.trim() !== '' && 
    supabaseAnonKey.trim() !== '' &&
    supabaseUrl !== 'undefined' &&
    supabaseAnonKey !== 'undefined' &&
    supabaseUrl.startsWith('https://')
  );

  console.log('🔧 Supabase Configuration Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValid: supabaseUrl?.startsWith('https://'),
    configured: isConfigured
  });

  return isConfigured;
};

// Create Supabase client
export const supabase: SupabaseClient = (() => {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase not configured properly');
    console.log('Please check your .env.local file:');
    console.log('- VITE_SUPABASE_URL should start with https://');
    console.log('- VITE_SUPABASE_ANON_KEY should be a valid JWT token');
    
    // Return a dummy client to prevent crashes
    return createClient('https://dummy.supabase.co', 'dummy-key');
  }

  try {
    const client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'boujee-events@1.0.0'
        }
      }
    });

    console.log('✅ Supabase client initialized successfully');
    return client;

  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    throw error;
  }
})();

// ===========================================================================
// DATABASE TYPES
// ===========================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          role: 'admin' | 'organizer' | 'member';
          status: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at: string;
          updated_at: string;
          last_login: string | null;
          loyalty_points: number;
          loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
          is_vip: boolean;
          preferences: any;
          social_profiles: any;
          events_created: number;
          events_attended: number;
          total_spent: number;
          metadata: any;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          short_description: string | null;
          date: string;
          time: string;
          end_date: string | null;
          end_time: string | null;
          timezone: string;
          location: string;
          venue: string;
          address: string | null;
          city: string | null;
          country: string;
          capacity: number;
          max_attendees: number;
          current_attendees: number;
          price: number;
          currency: string;
          category: string;
          tags: string[];
          status: 'draft' | 'published' | 'cancelled' | 'completed' | 'postponed';
          featured: boolean;
          is_private: boolean;
          requires_approval: boolean;
          image_url: string | null;
          banner_url: string | null;
          gallery_images: string[];
          organizer_id: string;
          co_organizers: string[];
          created_at: string;
          updated_at: string;
          published_at: string | null;
          metadata: any;
          custom_fields: any;
          slug: string | null;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'no_show';
          quantity: number;
          unit_price: number;
          total_amount: number;
          currency: string;
          payment_method: string | null;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_id: string | null;
          stripe_payment_intent_id: string | null;
          attendee_name: string;
          attendee_email: string;
          attendee_phone: string | null;
          special_requests: string | null;
          booked_at: string;
          confirmed_at: string | null;
          cancelled_at: string | null;
          refunded_at: string | null;
          booking_reference: string;
          qr_code: string | null;
          metadata: any;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'booked_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
    };
  };
}

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

// Test database connection
export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase not configured. Please check your environment variables.'
      };
    }

    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
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
export async function getCurrentUser(): Promise<User | null> {
  try {
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
export async function getCurrentSession(): Promise<Session | null> {
  try {
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

// ===========================================================================
// AUTHENTICATION FUNCTIONS
// ===========================================================================

export async function signInWithEmail(email: string, password: string) {
  try {
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

// ===========================================================================
// INITIALIZATION CHECK
// ===========================================================================

// Initialize and check connection on import
(async () => {
  if (typeof window !== 'undefined') {
    console.log('🚀 Boujee Events - Initializing Supabase...');
    
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
  }
})();

export default supabase;
