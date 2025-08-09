import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, PublicUser, UpdateProfileRequest } from '../types/user';
import { authService } from '../lib/auth';

export interface AuthContextType {
  user: User | PublicUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user?: User; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user?: User; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: UpdateProfileRequest) => Promise<{ user?: User | PublicUser; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.signIn(email, password);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const result = await authService.signUp(email, password, fullName);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      return await authService.resetPassword(email);
    } catch (error: any) {
      return { error: error.message };
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
      }
      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) return;
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
