// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create supabase client only if environment variables are available
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export a function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Log configuration status
console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl ? '✅ Set' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
  configured: isSupabaseConfigured()
});

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  if (!supabase) {
    return { error: { message: 'Supabase not configured. Please set environment variables.' } };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
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
