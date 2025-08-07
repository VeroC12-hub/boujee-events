// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.trim() && supabaseAnonKey.trim());
};

// Create supabase client
export const supabase: SupabaseClient | null = isSupabaseConfigured() 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null;

// Log configuration status
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Configuration Status:', {
    configured: isSupabaseConfigured(),
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    environment: import.meta.env.NODE_ENV || 'development'
  });
}

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  if (!supabase) {
    return { 
      error: { 
        message: 'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel environment variables.' 
      } 
    };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  if (error) {
    console.error("Google login error:", error.message);
    return { error };
  }
  
  return { data };
};

/**
 * Sign out
 */
export const signOut = async () => {
  if (!supabase) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Logout error:", error.message);
    return { error };
  }
  
  return { message: "Logged out successfully" };
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  if (!supabase) {
    return { data: { session: null }, error: null };
  }

  return await supabase.auth.getSession();
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  if (!supabase) {
    return { data: { user: null }, error: null };
  }

  return await supabase.auth.getUser();
};
