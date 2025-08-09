import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService, type UserProfile, type SignInData, type SignUpData } from '../lib/auth';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getSession: () => Promise<Session | null>;
  getProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        setLoading(true);
        const currentSession = await authService.getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          const userProfile = await authService.getProfile(currentSession.user.id);
          setProfile(userProfile);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const unsubscribe = authService.onAuthStateChange((state) => {
      setUser(state.user);
      setProfile(state.profile);
      setSession(state.session);
      setLoading(state.loading);
      setError(state.error);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (data: SignInData) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signIn(data);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setUser(result.user);
      setProfile(result.profile);
      setSession(result.session);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signUp({ 
        email: data.email, 
        password: data.password, 
        fullName: data.fullName,
        role: 'member'
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem('boujee_auth_user');
      localStorage.removeItem('boujee_auth_profile');
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = signOut; // Alias for signOut

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!user) {
        throw new Error('No user signed in');
      }

      // Update profile in authService first
      const updatedProfile = await authService.getProfile(user.id);
      if (updatedProfile) {
        const newProfile = { ...updatedProfile, ...updates };
        setProfile(newProfile);
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSession = async () => {
    return await authService.getSession();
  };

  const getProfile = async () => {
    if (!user) return null;
    return await authService.getProfile(user.id);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    logout,
    updateProfile,
    getSession,
    getProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
