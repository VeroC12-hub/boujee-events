import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, // or your redirect page
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
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    return { error };
  }

  return { message: "Logged out successfully" };
};
