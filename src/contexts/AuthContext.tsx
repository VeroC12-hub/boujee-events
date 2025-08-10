// src/contexts/AuthContext.tsx - Full Featured Implementation
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmail,
  signUpWithEmail, 
  signOut as supabaseSignOut,
  getCurrentUser,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getDatabaseStatus,
  type UserProfile
} from '../lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  databaseStatus: any;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [databaseStatus] = useState(getDatabaseStatus());

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log('🔄 Initializing authentication...');
      
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        console.log('👤 User found:', currentUser.email);
        setUser(currentUser);
        
        // Get user profile
        const userProfile = await getUserProfile(currentUser.id);
        if (userProfile) {
          console.log('📋 Profile loaded:', userProfile.role);
          setProfile(userProfile);
        } else {
          console.log('📝 Creating new profile...');
          // Create profile if it doesn't exist
          const newProfile = {
            id: currentUser.id,
            email: currentUser.email || '',
            full_name: currentUser.user_metadata?.full_name || '',
            role: (currentUser.user_metadata?.role as any) || 'member',
            status: 'approved' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const createdProfile = await createUserProfile(newProfile);
          if (createdProfile) {
            setProfile(createdProfile);
            console.log('✅ Profile created successfully');
          }
        }
      } else {
        console.log('👤 No user session found');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('✅ Authentication initialized');
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.log('❌ Login failed:', error.message);
        return { success: false, error: error.message };
      }
      
      if (data?.user) {
        console.log('✅ Login successful');
        setUser(data.user);
        
        // Get or create user profile
        let userProfile = await getUserProfile(data.user.id);
        
        if (!userProfile) {
          console.log('📝 Creating user profile...');
          const newProfile = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: data.user.user_metadata?.full_name || '',
            role: (data.user.user_metadata?.role as any) || 'member',
            status: 'approved' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          userProfile = await createUserProfile(newProfile);
        }
        
        if (userProfile) {
          setProfile(userProfile);
          console.log('👤 Profile loaded:', userProfile.role);
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Login failed - no user data received' };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'An unexpected error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: any = {}): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('📝 Attempting signup for:', email);
      
      const { data, error } = await signUpWithEmail(email, password, userData);
      
      if (error) {
        console.log('❌ Signup failed:', error.message);
        return { success: false, error: error.message };
      }
      
      if (data?.user) {
        console.log('✅ Signup successful');
        setUser(data.user);
        
        // Create user profile
        const newProfile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: userData.full_name || '',
          role: userData.role || 'member',
          status: 'approved' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const createdProfile = await createUserProfile(newProfile);
        if (createdProfile) {
          setProfile(createdProfile);
          console.log('👤 Profile created:', createdProfile.role);
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Signup failed - no user data received' };
    } catch (error) {
      console.error('❌ Signup error:', error);
      return { success: false, error: 'An unexpected error occurred during signup' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Logging out...');
      
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!profile || !user) {
        console.log('❌ Cannot update profile: no user or profile');
        return false;
      }
      
      console.log('📝 Updating profile...');
      
      const updatedProfile = await updateUserProfile(user.id, updates);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        console.log('✅ Profile updated successfully');
        return true;
      }
      
      console.log('❌ Profile update failed');
      return false;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return false;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing profile...');
      const freshProfile = await getUserProfile(user.id);
      if (freshProfile) {
        setProfile(freshProfile);
        console.log('✅ Profile refreshed');
      }
    } catch (error) {
      console.error('❌ Profile refresh error:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    initialized,
    databaseStatus,
    login,
    signup,
    logout,
    updateProfile,
    refreshProfile
  };

  // Debug info in development
  useEffect(() => {
    if (initialized && process.env.NODE_ENV === 'development') {
      console.log('🔍 Auth State:', {
        hasUser: !!user,
        hasProfile: !!profile,
        userEmail: user?.email,
        userRole: profile?.role,
        databaseMode: databaseStatus.mode
      });
    }
  }, [user, profile, initialized, databaseStatus]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
