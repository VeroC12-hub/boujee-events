import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.trim() !== '' && 
    supabaseAnonKey.trim() !== '' &&
    supabaseUrl !== 'undefined' &&
    supabaseAnonKey !== 'undefined'
  );
};

// Create supabase client
export const supabase: SupabaseClient | null = (() => {
  try {
    if (isSupabaseConfigured()) {
      return createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      });
    }
    return null;
  } catch (error) {
    console.warn('Supabase initialization failed:', error);
    return null;
  }
})();

// Log configuration status
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Configuration:', {
    configured: isSupabaseConfigured(),
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    environment: import.meta.env.NODE_ENV || 'development'
  });
}

// Legacy exports for compatibility
export const signInWithGoogle = async () => {
  if (!supabase) {
    return { 
      error: { 
        message: 'Supabase not configured' 
      } 
    };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentSession = async () => {
  if (!supabase) {
    return { data: { session: null }, error: null };
  }

  return await supabase.auth.getSession();
};

export const getCurrentUser = async () => {
  if (!supabase) {
    return { data: { user: null }, error: null };
  }

  return await supabase.auth.getUser();
};
