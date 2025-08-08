import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  // Compatibility methods
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Mock users for development/fallback
const MOCK_USERS = {
  'admin@nexacore-innovations.com': {
    password: 'NexaCore2024!',
    profile: {
      id: 'admin-nexacore',
      email: 'admin@nexacore-innovations.com',
      full_name: 'Nexacore Admin',
      role: 'admin',
      status: 'approved',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'admin@test.com': {
    password: 'TestAdmin2025',
    profile: {
      id: 'test-admin',
      email: 'admin@test.com',
      full_name: 'Test Administrator',
      role: 'admin',
      status: 'approved',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'organizer@test.com': {
    password: 'TestOrganizer2025',
    profile: {
      id: 'test-organizer',
      email: 'organizer@test.com',
      full_name: 'Test Organizer',
      role: 'organizer',
      status: 'approved',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'member@test.com': {
    password: 'TestMember2025',
    profile: {
      id: 'test-member',
      email: 'member@test.com',
      full_name: 'Test Member',
      role: 'member',
      status: 'approved',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Function to restore mock session from localStorage
  const restoreMockSession = () => {
    try {
      const storedUser = localStorage.getItem('boujee_auth_user');
      const storedProfile = localStorage.getItem('boujee_auth_profile');
      
      if (storedUser && storedProfile) {
        const user = JSON.parse(storedUser);
        const profile = JSON.parse(storedProfile);
        
        setUser(user);
        setProfile(profile);
        console.log('✅ Restored mock session for:', user.email);
        return true;
      }
    } catch (error) {
      console.warn('Failed to restore mock session:', error);
      localStorage.removeItem('boujee_auth_user');
      localStorage.removeItem('boujee_auth_profile');
    }
    return false;
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      if (!supabase) {
        console.log('Supabase not configured, checking for mock session');
        restoreMockSession();
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          // No supabase session, try to restore mock session
          restoreMockSession();
        }
      } catch (error) {
        console.error('Error during session check:', error);
        // Fallback to mock session on error
        restoreMockSession();
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes only if supabase is configured
    if (!supabase) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Try Supabase first if configured
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!error) {
          return; // Success - supabase will handle auth state change
        }
        
        console.log('Supabase auth failed, trying mock auth:', error.message);
      } catch (error) {
        console.error('Supabase auth error:', error);
      }
    }

    // Mock authentication fallback
    console.log('🧪 Trying mock authentication for:', email);
    const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
    
    if (mockUser && mockUser.password === password) {
      console.log('✅ Mock authentication successful');
      
      // Create mock user object
      const user = {
        id: mockUser.profile.id,
        email: mockUser.profile.email,
        user_metadata: {
          full_name: mockUser.profile.full_name
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: mockUser.profile.created_at
      } as User;

      setUser(user);
      setProfile(mockUser.profile);

      // Store in localStorage for persistence
      localStorage.setItem('boujee_auth_user', JSON.stringify(user));
      localStorage.setItem('boujee_auth_profile', JSON.stringify(mockUser.profile));
      
      return;
    }

    throw new Error('Invalid email or password');
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase) {
      throw new Error('Authentication service not available. Supabase is not configured.');
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase sign out error:', error);
        }
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    }
    
    // Clear both supabase and mock auth
    setUser(null);
    setProfile(null);
    setSession(null);
    
    // Clear localStorage
    localStorage.removeItem('boujee_auth_user');
    localStorage.removeItem('boujee_auth_profile');
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    // Compatibility aliases
    login: signIn,
    logout: signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
