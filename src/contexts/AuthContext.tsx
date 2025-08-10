// src/contexts/AuthContext.tsx - QUICK FIX VERSION
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

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  databaseStatus: any;
  error?: string;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Create and export the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context so useAuth.ts can import it
export { AuthContext };

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
  const [error, setError] = useState<string>('');
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
        
        const userProfile = await getUserProfile(currentUser.id);
        if (userProfile) {
          console.log('📋 Profile loaded:', userProfile.role);
          setProfile(userProfile);
        } else {
          console.log('📝 Creating new profile...');
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
      setError('Authentication initialization failed');
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('✅ Authentication initialized');
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError('');
      console.log('🔐 Signing in user:', email);
      
      const result = await signInWithEmail(email, password);
      
      if (result.success && result.user) {
        console.log('✅ Login successful:', result.user.email);
        setUser(result.user);
        
        const userProfile = await getUserProfile(result.user.id);
        if (userProfile) {
          setProfile(userProfile);
          console.log('📋 Profile loaded for signed in user');
        }
        
        return { success: true };
      }
      
      const errorMsg = result.error || 'Login failed - no user data received';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMsg = 'An unexpected error occurred during login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError('');
      console.log('📝 Signing up user:', email);
      
      const result = await signUpWithEmail(email, password, userData?.full_name);
      
      if (result.success && result.user) {
        console.log('✅ Signup successful:', result.user.email);
        setUser(result.user);
        
        const newProfile = {
          id: result.user.id,
          email: result.user.email || '',
          full_name: userData?.full_name || '',
          role: 'member' as const,
          status: 'approved' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const createdProfile = await createUserProfile(newProfile);
        if (createdProfile) {
          setProfile(createdProfile);
          console.log('📋 Profile created for new user');
        }
        
        return { success: true };
      }
      
      const errorMsg = result.error || 'Signup failed - no user data received';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error) {
      console.error('❌ Signup error:', error);
      const errorMsg = 'An unexpected error occurred during signup';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
      setError('');
      
      console.log('✅ Signout successful');
    } catch (error) {
      console.error('❌ Signout error:', error);
      setError('Signout failed');
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

  // Backward compatibility aliases
  const login = signIn;
  const signup = signUp;
  const logout = signOut;

  const value: AuthContextType = {
    user,
    profile,
    loading,
    initialized,
    databaseStatus,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    login,
    signup,
    logout
  };

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
