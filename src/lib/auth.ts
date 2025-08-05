// src/lib/auth.ts
import { supabase } from "@/lib/supabase"; // Fixed import path

/**
 * Fetches the user's role from Supabase based on user ID
 */
export const getUserRole = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("profiles") // Make sure this table exists and contains a 'role' column
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("❌ Failed to get user role:", error);
    return null;
  }

  return data?.role ?? null;
};

/**
 * Get current user session
 */
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  
  return session?.user ?? null;
};
