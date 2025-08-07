// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthState, SignInData, SignUpData, UserProfile } from '../lib/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signIn: (data: SignInData) => Promise<{ user: any; error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ user: any; error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: () => boolean;
  getDebugInfo: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((newState) => {
      setAuthState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signOut: authService.signOut.bind(authService),
    refreshProfile: authService.refreshProfile.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    getDebugInfo: authService.getDebugInfo.bind(authService)
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
