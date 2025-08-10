// src/contexts/AuthContext.tsx - REAL SUPABASE AUTHENTICATION
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Types
interface UserProfile {
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

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  databaseStatus: any;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Create and export the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [databaseStatus] = useState({ mode: '🟢 Database Mode' });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
      setInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setProfile(data);
      console.log('✅ Profile loaded:', data.email, data.role);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Signing in:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Sign in successful:', data.user.email);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      const errorMsg = error.message || 'An unexpected error occurred during sign in';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any = {}): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Signing up:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || '',
            role: userData.role || 'member'
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Sign up successful:', data.user.email);
        return { success: true };
      }

      return { success: false, error: 'Sign up failed' };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      const errorMsg = error.message || 'An unexpected error occurred during sign up';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }

      setUser(null);
      setProfile(null);
      setSession(null);
      setError(null);
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      setError('Sign out failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!user) {
        console.log('❌ Cannot update profile: no user');
        return false;
      }

      setLoading(true);
      console.log('📝 Updating profile...');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        return false;
      }

      setProfile(data);
      console.log('✅ Profile updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // Backward compatibility aliases
  const login = signIn;
  const signup = signUp;
  const logout = signOut;

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    initialized,
    error,
    databaseStatus,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
