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
}

// Mock users for development fallback
const MOCK_USERS = {
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

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Try to restore from localStorage first
        const storedUser = localStorage.getItem('boujee_auth_user');
        const storedProfile = localStorage.getItem('boujee_auth_profile');
        
        if (storedUser && storedProfile && mounted) {
          const parsedUser = JSON.parse(storedUser);
          const parsedProfile = JSON.parse(storedProfile);
          setUser(parsedUser);
          setProfile(parsedProfile);
          setLoading(false);
          return;
        }

        // Try Supabase if available
        if (supabase && mounted) {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && mounted) {
            setSession(session);
            setUser(session.user);
            
            // Try to fetch profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileData && mounted) {
              setProfile(profileData);
            }
          }
        }
      } catch (error) {
        console.warn('Auth init error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Supabase auth listener
    let authListener: any = null;
    if (supabase) {
      authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
          localStorage.removeItem('boujee_auth_user');
          localStorage.removeItem('boujee_auth_profile');
        }
        
        setLoading(false);
      });
    }

    return () => {
      mounted = false;
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Try Supabase first
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          setLoading(false);
          return; // Success - auth listener will handle the rest
        }
      }

      // Fallback to mock auth
      const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
      
      if (mockUser && mockUser.password === password) {
        const user = {
          id: mockUser.profile.id,
          email: mockUser.profile.email,
          user_metadata: { full_name: mockUser.profile.full_name },
          app_metadata: {},
          aud: 'authenticated',
          created_at: mockUser.profile.created_at
        } as User;

        setUser(user);
        setProfile(mockUser.profile);

        localStorage.setItem('boujee_auth_user', JSON.stringify(user));
        localStorage.setItem('boujee_auth_profile', JSON.stringify(mockUser.profile));
        
        setLoading(false);
        return;
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase) {
      throw new Error('Sign up requires Supabase configuration');
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('boujee_auth_user');
    localStorage.removeItem('boujee_auth_profile');
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
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
