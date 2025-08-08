import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/auth';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any stored sessions first
    const clearOldSessions = () => {
      localStorage.removeItem('boujee_auth_user');
      localStorage.removeItem('boujee_auth_profile');
    };
    
    clearOldSessions();
    checkSession();

    const unsubscribe = authService.onAuthStateChange((state) => {
      setUser(state.user);
      setProfile(state.profile);
      setSession(state.session);
      setError(state.error);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      // Don't auto-restore session
      setUser(null);
      setProfile(null);
      setSession(null);
      setLoading(false);
    } catch (error) {
      console.error('Session check failed:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signIn({ email, password });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.user) {
        throw new Error('Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signUp({ 
        email, 
        password, 
        fullName,
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

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut
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
