// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// src/types/auth.ts
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: string;
  status?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  date_of_birth?: string;
  preferences?: any;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

// src/lib/authService.ts
import { supabase } from './supabase';
import { AuthResult, User } from '../types/auth';

class AuthService {
  async signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
      console.log('🚀 Starting signup for:', email);

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create user account'
        };
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Step 2: Create profile in profiles table
      const profileData = {
        id: authData.user.id, // Use the auth user's ID as primary key
        email: email,
        full_name: fullName,
        role: 'member', // Default role
        status: 'active', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        // If profile creation fails, we should clean up the auth user
        // But Supabase handles this automatically in most cases
        return {
          success: false,
          error: `Failed to create user profile: ${profileError.message}`
        };
      }

      console.log('✅ Profile created successfully:', profileResult);

      return {
        success: true,
        user: profileResult as User
      };

    } catch (error: any) {
      console.error('❌ Signup service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during signup'
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🚀 Starting signin for:', email);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Auth signin error:', authError);
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to sign in'
        };
      }

      // Update last_sign_in_at in profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          last_sign_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.warn('⚠️ Failed to update last sign in time:', updateError);
      }

      // Get full profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Failed to fetch profile:', profileError);
        return {
          success: false,
          error: 'Failed to load user profile'
        };
      }

      console.log('✅ Signin successful');

      return {
        success: true,
        user: profile as User
      };

    } catch (error: any) {
      console.error('❌ Signin service error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during signin'
      };
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return null;
      }

      // Get profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
        return null;
      }

      return profile as User;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();

// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResult } from '../types/auth';
import { authService } from '../lib/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, fullName);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// src/App.tsx (Update to include AuthProvider)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
// ... other imports

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* ... other routes */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
