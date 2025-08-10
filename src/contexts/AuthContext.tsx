// src/contexts/AuthContext.tsx - Complete authentication context with role management
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  isSupabaseConfigured, 
  getUserProfile, 
  createUserProfile,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  signInWithGoogle,
  resetPassword,
  mockAuth,
  mockProfiles,
  type UserProfile
} from '../lib/supabase';

// === TYPES ===
export interface AuthContextType {
  // User and session data
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  
  // Role-based helpers
  hasRole: (roles: string[]) => boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isMember: boolean;
  hasElevatedAccess: boolean;
}

// === CONTEXT CREATION ===
const AuthContext = createContext<AuthContextType | null>(null);

// === HOOK ===
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// === PROVIDER COMPONENT ===
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State management
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === AUTHENTICATION METHODS ===
  
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Attempting sign in for:', email);

      if (!isSupabaseConfigured()) {
        // Mock authentication for development
        console.log('⚠️ Using mock authentication');
        const result = await mockAuth.signIn(email, password);
        
        if (result.success && result.data) {
          const mockProfile = mockProfiles.find(p => p.email === email);
          if (mockProfile) {
            setUser(result.data.user as SupabaseUser);
            setProfile(mockProfile);
            setSession(result.data.session as Session);
            
            // Store in localStorage for persistence
            localStorage.setItem('mock-user', JSON.stringify(result.data.user));
            localStorage.setItem('mock-profile', JSON.stringify(mockProfile));
            
            console.log('✅ Mock sign in successful:', mockProfile.role);
            return { success: true };
          }
        }
        
        setError(result.error || 'Invalid credentials');
        return { success: false, error: result.error || 'Invalid credentials' };
      }

      // Real Supabase authentication
      const result = await signInWithEmail(email, password);
      
      if (!result.success) {
        setError(result.error || 'Sign in failed');
        return { success: false, error: result.error };
      }

      // User profile will be loaded by auth state change listener
      console.log('✅ Real sign in successful');
      return { success: true };

    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed';
      setError(errorMessage);
      console.error('❌ Sign in error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('📝 Attempting sign up for:', email);

      if (!isSupabaseConfigured()) {
        // Mock sign up for development
        console.log('⚠️ Using mock sign up');
        
        // Create mock user
        const newMockProfile: UserProfile = {
          id: `mock-${Date.now()}`,
          email,
          full_name: fullName || email.split('@')[0],
          role: email.includes('admin') ? 'admin' : email.includes('organizer') ? 'organizer' : 'member',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setProfile(newMockProfile);
        setUser({
          id: newMockProfile.id,
          email: newMockProfile.email,
          user_metadata: { full_name: newMockProfile.full_name }
        } as SupabaseUser);

        localStorage.setItem('mock-profile', JSON.stringify(newMockProfile));
        
        console.log('✅ Mock sign up successful');
        return { success: true };
      }

      // Real Supabase sign up
      const result = await signUpWithEmail(email, password, { full_name: fullName });
      
      if (!result.success) {
        setError(result.error || 'Sign up failed');
        return { success: false, error: result.error };
      }

      console.log('✅ Real sign up successful');
      return { success: true };

    } catch (error: any) {
      const errorMessage = error.message || 'Sign up failed';
      setError(errorMessage);
      console.error('❌ Sign up error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      
      if (!isSupabaseConfigured()) {
        // Mock sign out
        localStorage.removeItem('mock-user');
        localStorage.removeItem('mock-profile');
        setUser(null);
        setProfile(null);
        setSession(null);
        console.log('✅ Mock sign out successful');
        return;
      }

      // Real Supabase sign out
      const result = await supabaseSignOut();
      if (!result.success) {
        console.error('❌ Sign out error:', result.error);
      } else {
        console.log('✅ Real sign out successful');
      }

      // Clear state regardless
      setUser(null);
      setProfile(null);
      setSession(null);
      setError(null);

    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      setError(error.message);
    }
  };

  const signInWithGoogleAuth = async () => {
    try {
      setError(null);
      
      if (!isSupabaseConfigured()) {
        return { success: false, error: 'Google sign-in requires Supabase configuration' };
      }

      const result = await signInWithGoogle();
      
      if (!result.success) {
        setError(result.error || 'Google sign in failed');
        return { success: false, error: result.error };
      }

      return { success: true };

    } catch (error: any) {
      const errorMessage = error.message || 'Google sign in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPasswordAuth = async (email: string) => {
    try {
      setError(null);
      
      if (!isSupabaseConfigured()) {
        return { success: false, error: 'Password reset requires Supabase configuration' };
      }

      const result = await resetPassword(email);
      
      if (!result.success) {
        setError(result.error || 'Password reset failed');
        return { success: false, error: result.error };
      }

      return { success: true };

    } catch (error: any) {
      const errorMessage = error.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      
      if (!user || !profile) {
        return { success: false, error: 'No user logged in' };
      }

      if (!isSupabaseConfigured()) {
        // Mock profile update
        const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
        setProfile(updatedProfile);
        localStorage.setItem('mock-profile', JSON.stringify(updatedProfile));
        return { success: true };
      }

      // Real Supabase profile update
      const { data, error } = await supabase!
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setProfile(data as UserProfile);
      return { success: true };

    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) return;

      if (!isSupabaseConfigured()) {
        // Mock refresh
        const storedProfile = localStorage.getItem('mock-profile');
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
        return;
      }

      // Real Supabase refresh
      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError(error.message);
    }
  };

  // === ROLE-BASED HELPERS ===
  
  const hasRole = (roles: string[]): boolean => {
    return profile?.role ? roles.includes(profile.role) : false;
  };

  const isAdmin = profile?.role === 'admin';
  const isOrganizer = profile?.role === 'organizer';
  const isMember = profile?.role === 'member';
  const hasElevatedAccess = isAdmin || isOrganizer;

  // === INITIALIZATION EFFECT ===
  
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log('🔐 Initializing authentication...');

        if (!isSupabaseConfigured()) {
          // Mock initialization
          console.log('⚠️ Using mock authentication mode');
          
          const storedUser = localStorage.getItem('mock-user');
          const storedProfile = localStorage.getItem('mock-profile');
          
          if (storedUser && storedProfile && mounted) {
            setUser(JSON.parse(storedUser));
            setProfile(JSON.parse(storedProfile));
            console.log('✅ Mock user restored from localStorage');
          }
          return;
        }

        // Real Supabase initialization
        const { data: { session } } = await supabase!.auth.getSession();
        
        if (session?.user && mounted) {
          setUser(session.user);
          setSession(session);
          
          // Get or create user profile
          let userProfile = await getUserProfile(session.user.id);
          
          if (!userProfile) {
            console.log('Creating new user profile...');
            userProfile = await createUserProfile(session.user);
          }
          
          if (userProfile && mounted) {
            setProfile(userProfile);
            console.log('✅ User authenticated:', userProfile.email, '- Role:', userProfile.role);
          }
        } else {
          console.log('❌ No authenticated user found');
        }

      } catch (error: any) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener (only for real Supabase)
    let authListener: any = null;
    
    if (isSupabaseConfigured() && supabase) {
      authListener = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Get or create profile
          let userProfile = await getUserProfile(session.user.id);
          
          if (!userProfile) {
            userProfile = await createUserProfile(session.user);
          }
          
          if (userProfile) {
            setProfile(userProfile);
            console.log('✅ Auth state updated:', userProfile.email, '- Role:', userProfile.role);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSession(null);
          setError(null);
          console.log('❌ User signed out');
        }
      });
    }

    // Cleanup function
    return () => {
      mounted = false;
      if (authListener && authListener.data) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  // === CONTEXT VALUE ===
  
  const value: AuthContextType = {
    // User and session data
    user,
    profile,
    session,
    
    // Loading and error states
    loading,
    error,
    
    // Authentication methods
    signIn,
    signUp,
    signOut,
    signInWithGoogle: signInWithGoogleAuth,
    resetPassword: resetPasswordAuth,
    
    // Profile management
    updateProfile,
    refreshUser,
    
    // Role-based helpers
    hasRole,
    isAdmin,
    isOrganizer,
    isMember,
    hasElevatedAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// === DEFAULT EXPORT ===
export default AuthProvider;
