import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, PublicUser, UpdateProfileRequest } from '../types/user';
import { authService } from '../lib/auth';

export interface AuthContextType {
  user: User | PublicUser | null;
  profile: User | PublicUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user?: User; error?: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: UpdateProfileRequest) => Promise<{ user?: User | PublicUser; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | PublicUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Get session if available
          const currentSession = await authService.getSession();
          setSession(currentSession);
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((authUser: SupabaseUser | null) => {
      if (authUser) {
        // Convert Supabase user to our User type
        const convertedUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
          full_name: authUser.user_metadata?.full_name || '',
          phone: authUser.user_metadata?.phone || '',
          role: (authUser.app_metadata?.role as any) || 'member',
          status: 'active',
          avatar: authUser.user_metadata?.avatar_url || '',
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || authUser.created_at,
          user_metadata: authUser.user_metadata,
          app_metadata: authUser.app_metadata,
          aud: authUser.aud
        };
        setUser(convertedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.signIn(email, password);
      
      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }

      if (result.user) {
        const convertedUser: User = {
          id: result.user.id,
          email: result.user.email || '',
          name: result.user.user_metadata?.full_name || '',
          full_name: result.user.user_metadata?.full_name || '',
          phone: result.user.user_metadata?.phone || '',
          role: (result.user.app_metadata?.role as any) || 'member',
          status: 'active',
          avatar: result.user.user_metadata?.avatar_url || '',
          created_at: result.user.created_at,
          updated_at: result.user.updated_at || result.user.created_at,
          user_metadata: result.user.user_metadata,
          app_metadata: result.user.app_metadata,
          aud: result.user.aud
        };
        setUser(convertedUser);
        return { user: convertedUser };
      }

      return {};
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.signUp(email, password, fullName);
      
      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }

      if (result.user) {
        const convertedUser: User = {
          id: result.user.id,
          email: result.user.email || '',
          name: fullName,
          full_name: fullName,
          phone: '',
          role: 'member',
          status: 'active',
          avatar: '',
          created_at: result.user.created_at,
          updated_at: result.user.updated_at || result.user.created_at,
          user_metadata: { full_name: fullName },
          app_metadata: { role: 'member' },
          aud: result.user.aud
        };
        setUser(convertedUser);
        return { user: convertedUser };
      }

      return {};
    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (error: any) {
      setError(error.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = signOut; // Alias for signOut

  const resetPassword = async (email: string) => {
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error: any) {
      return { error: error.message || 'Reset password failed' };
    }
  };

  const updateProfile = async (updates: UpdateProfileRequest) => {
    try {
      if (!user) {
        return { error: 'No user logged in' };
      }

      const result = await authService.updateProfile(user.id, updates);
      if (result.user) {
        setUser(result.user);
        return { user: result.user };
      }
      return { error: result.error || 'Update failed' };
    } catch (error: any) {
      return { error: error.message || 'Update profile failed' };
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) return;
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    profile: user, // profile is same as user in this context
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    logout,
    resetPassword,
    updateProfile,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
