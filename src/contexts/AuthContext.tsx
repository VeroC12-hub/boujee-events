// src/contexts/AuthContext.tsx - COMPLETE FULL IMPLEMENTATION (600+ lines)
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  signInWithEmail,
  signUpWithEmail, 
  signOut as supabaseSignOut,
  getCurrentUser,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getDatabaseStatus,
  resetPassword as supabaseResetPassword,
  type UserProfile
} from '../lib/supabase';

// ================== INTERFACES ==================
interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
    avatar_url?: string;
  };
  email_confirmed_at?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

interface AuthError {
  message: string;
  status?: number;
  details?: any;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface SignInResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface SignUpResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface ResetPasswordResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface UpdateProfileResult {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

export interface AuthContextType {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  databaseStatus: any;
  
  // Authentication Methods
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, userData?: any) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
  
  // Profile Methods  
  updateProfile: (updates: Partial<UserProfile>) => Promise<UpdateProfileResult>;
  refreshProfile: () => Promise<void>;
  
  // Utility Methods
  clearError: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isOrganizer: () => boolean;
  isMember: () => boolean;
  hasRole: (role: string) => boolean;
  checkPermission: (permission: string) => boolean;
  
  // Backward Compatibility
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  
  // Debug
  getDebugInfo: () => any;
}

// ================== CONTEXT CREATION ==================
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================== CUSTOM HOOK ==================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ================== PROVIDER PROPS ==================
interface AuthProviderProps {
  children: React.ReactNode;
}

// ================== MAIN PROVIDER COMPONENT ==================
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // ================== STATE ==================
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [databaseStatus] = useState(getDatabaseStatus());

  // ================== INITIALIZATION ==================
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
            avatar_url: currentUser.user_metadata?.avatar_url,
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

  // ================== SIGN IN METHOD ==================
  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Signing in user:', email);
      
      const result = await signInWithEmail(email, password);
      
      if (result.success && result.user) {
        console.log('✅ Sign in successful:', result.user.email);
        setUser(result.user);
        
        // Set session if available
        if (result.session) {
          setSession(result.session);
        }
        
        // Get user profile
        const userProfile = await getUserProfile(result.user.id);
        if (userProfile) {
          setProfile(userProfile);
          console.log('📋 Profile loaded for signed in user');
        } else {
          // Create profile if it doesn't exist
          const newProfile = {
            id: result.user.id,
            email: result.user.email || '',
            full_name: result.user.user_metadata?.full_name || '',
            role: (result.user.user_metadata?.role as any) || 'member',
            status: 'approved' as const,
            avatar_url: result.user.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const createdProfile = await createUserProfile(newProfile);
          if (createdProfile) {
            setProfile(createdProfile);
            console.log('📋 Profile created for signed in user');
          }
        }
        
        return { 
          success: true, 
          user: result.user, 
          session: result.session,
          needsEmailConfirmation: !result.user.email_confirmed_at
        };
      }
      
      const errorMsg = result.error || 'Sign in failed - no user data received';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      const errorMsg = error.message || 'An unexpected error occurred during sign in';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ================== SIGN UP METHOD ==================
  const signUp = useCallback(async (email: string, password: string, userData: any = {}): Promise<SignUpResult> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Signing up user:', email);
      
      const result = await signUpWithEmail(email, password, userData.full_name);
      
      if (result.success && result.user) {
        console.log('✅ Sign up successful:', result.user.email);
        setUser(result.user);
        
        // Set session if available
        if (result.session) {
          setSession(result.session);
        }
        
        // Create user profile
        const newProfile = {
          id: result.user.id,
          email: result.user.email || '',
          full_name: userData.full_name || '',
          role: userData.role || 'member',
          status: 'approved' as const,
          avatar_url: userData.avatar_url,
          phone: userData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const createdProfile = await createUserProfile(newProfile);
        if (createdProfile) {
          setProfile(createdProfile);
          console.log('👤 Profile created:', createdProfile.role);
        }
        
        return { 
          success: true, 
          user: result.user, 
          session: result.session,
          needsEmailConfirmation: !result.user.email_confirmed_at
        };
      }
      
      const errorMsg = result.error || 'Sign up failed - no user data received';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      const errorMsg = error.message || 'An unexpected error occurred during sign up';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ================== SIGN OUT METHOD ==================
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      await supabaseSignOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      setError(null);
      
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      setError('Sign out failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ================== RESET PASSWORD METHOD ==================
  const resetPassword = useCallback(async (email: string): Promise<ResetPasswordResult> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Resetting password for:', email);
      
      const result = await supabaseResetPassword(email);
      
      if (result.success) {
        console.log('✅ Password reset email sent');
        return { 
          success: true, 
          message: 'Password reset email sent successfully' 
        };
      }
      
      const errorMsg = result.error || 'Failed to send password reset email';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      const errorMsg = error.message || 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ================== UPDATE PROFILE METHOD ==================
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UpdateProfileResult> => {
    try {
      if (!profile || !user) {
        console.log('❌ Cannot update profile: no user or profile');
        const errorMsg = 'User must be signed in to update profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      setLoading(true);
      console.log('📝 Updating profile...');
      
      const updatedProfile = await updateUserProfile(user.id, updates);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        console.log('✅ Profile updated successfully');
        return { success: true, profile: updatedProfile };
      }
      
      const errorMsg = 'Profile update failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      const errorMsg = error.message || 'An unexpected error occurred during profile update';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [profile, user]);

  // ================== REFRESH PROFILE METHOD ==================
  const refreshProfile = useCallback(async (): Promise<void> => {
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
  }, [user]);

  // ================== UTILITY METHODS ==================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return Boolean(user && profile);
  }, [user, profile]);

  const isAdmin = useCallback((): boolean => {
    return profile?.role === 'admin' && profile?.status === 'approved';
  }, [profile]);

  const isOrganizer = useCallback((): boolean => {
    return profile?.role === 'organizer' && profile?.status === 'approved';
  }, [profile]);

  const isMember = useCallback((): boolean => {
    return profile?.role === 'member' && profile?.status === 'approved';
  }, [profile]);

  const hasRole = useCallback((role: string): boolean => {
    return profile?.role === role && profile?.status === 'approved';
  }, [profile]);

  const checkPermission = useCallback((permission: string): boolean => {
    if (!profile || profile.status !== 'approved') return false;
    
    // Admin has all permissions
    if (profile.role === 'admin') return true;
    
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      organizer: ['create_events', 'edit_events', 'view_bookings', 'manage_attendees'],
      member: ['view_events', 'book_events', 'view_profile'],
      attendee: ['view_events', 'book_events']
    };
    
    const userPermissions = rolePermissions[profile.role] || [];
    return userPermissions.includes(permission);
  }, [profile]);

  // ================== BACKWARD COMPATIBILITY METHODS ==================
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const result = await signIn(email, password);
    return { success: result.success, error: result.error };
  }, [signIn]);

  const signup = useCallback(async (email: string, password: string, userData?: any): Promise<{ success: boolean; error?: string }> => {
    const result = await signUp(email, password, userData);
    return { success: result.success, error: result.error };
  }, [signUp]);

  const logout = useCallback(async (): Promise<void> => {
    await signOut();
  }, [signOut]);

  // ================== DEBUG METHOD ==================
  const getDebugInfo = useCallback(() => {
    return {
      hasUser: !!user,
      hasProfile: !!profile,
      hasSession: !!session,
      userEmail: user?.email,
      userRole: profile?.role,
      userStatus: profile?.status,
      isAuthenticated: isAuthenticated(),
      isAdmin: isAdmin(),
      isOrganizer: isOrganizer(),
      isMember: isMember(),
      loading,
      initialized,
      error,
      databaseMode: databaseStatus.mode,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL || !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY || !!import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    };
  }, [user, profile, session, loading, initialized, error, databaseStatus, isAuthenticated, isAdmin, isOrganizer, isMember]);

  // ================== CONTEXT VALUE ==================
  const value: AuthContextType = {
    // State
    user,
    profile,
    session,
    loading,
    initialized,
    error,
    databaseStatus,
    
    // Authentication Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    
    // Profile Methods
    updateProfile,
    refreshProfile,
    
    // Utility Methods
    clearError,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    isMember,
    hasRole,
    checkPermission,
    
    // Backward Compatibility
    login,
    signup,
    logout,
    
    // Debug
    getDebugInfo
  };

  // ================== DEBUG INFO ==================
  useEffect(() => {
    if (initialized && process.env.NODE_ENV === 'development') {
      console.log('🔍 Auth State:', {
        hasUser: !!user,
        hasProfile: !!profile,
        hasSession: !!session,
        userEmail: user?.email,
        userRole: profile?.role,
        userStatus: profile?.status,
        databaseMode: databaseStatus.mode,
        isAuthenticated: isAuthenticated(),
        isAdmin: isAdmin()
      });
    }
  }, [user, profile, session, initialized, databaseStatus, isAuthenticated, isAdmin]);

  // ================== RENDER ==================
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
