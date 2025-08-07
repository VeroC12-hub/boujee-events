import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  authService, 
  getCurrentUser, 
  getCurrentProfile, 
  signIn as authSignIn, 
  signUp as authSignUp, 
  signOut as authSignOut,
  refreshProfile,
  isAdmin,
  getCurrentUserRole,
  getAuthDebugInfo,
  type AuthState, 
  type SignInData, 
  type SignUpData, 
  type UserProfile 
} from '../lib/auth';

// Extended interface for context
interface AuthContextType extends AuthState {
  signIn: (data: SignInData) => Promise<{ user: any; error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ user: any; error: string | null }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  login: (data: SignInData) => Promise<boolean>; // Add login method
  refreshProfile: () => Promise<void>;
  isAdmin: () => Promise<boolean>;
  isAdminSync: () => boolean;
  getCurrentUserRole: () => Promise<string>;
  getDebugInfo: () => any;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize with proper default state to prevent undefined errors
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  });

  // Initialize auth state listener
  useEffect(() => {
    console.log('🔧 AuthProvider: Setting up auth state listener');
    
    // Ensure authService exists before using it
    if (!authService) {
      console.error('❌ AuthService not available');
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Authentication service not available' 
      }));
      return;
    }

    const unsubscribe = authService.onAuthStateChange((newState) => {
      console.log('📢 AuthProvider: State updated', {
        hasUser: !!newState.user,
        userEmail: newState.user?.email,
        hasProfile: !!newState.profile,
        userRole: newState.profile?.role,
        loading: newState.loading,
        error: newState.error
      });
      
      // Ensure newState has all required properties
      setState({
        user: newState.user || null,
        profile: newState.profile || null,
        session: newState.session || null,
        loading: newState.loading ?? false,
        error: newState.error || null
      });
    });

    return () => {
      console.log('🔧 AuthProvider: Cleaning up auth state listener');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Wrapper functions with error handling
  const handleSignIn = useCallback(async (data: SignInData) => {
    console.log('🔐 AuthProvider: Sign in attempt');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authSignIn(data);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
      } else {
        setState(prev => ({ ...prev, loading: false, error: null }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { user: null, error: errorMessage };
    }
  }, []);

  // Add login method that returns boolean for compatibility
  const handleLogin = useCallback(async (data: SignInData): Promise<boolean> => {
    const result = await handleSignIn(data);
    return !result.error && !!result.user;
  }, [handleSignIn]);

  const handleSignUp = useCallback(async (data: SignUpData) => {
    console.log('📝 AuthProvider: Sign up attempt');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await authSignUp(data);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
      } else {
        setState(prev => ({ ...prev, loading: false, error: null }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { user: null, error: errorMessage };
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    console.log('👋 AuthProvider: Sign out');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authSignOut();
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  const handleRefreshProfile = useCallback(async () => {
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, []);

  const handleIsAdmin = useCallback(async () => {
    try {
      return await isAdmin();
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  }, []);

  const handleIsAdminSync = useCallback(() => {
    try {
      return state.profile?.role === 'admin';
    } catch (error) {
      console.error('Failed to check admin status sync:', error);
      return false;
    }
  }, [state.profile]);

  const handleGetCurrentUserRole = useCallback(async () => {
    try {
      return await getCurrentUserRole();
    } catch (error) {
      console.error('Failed to get user role:', error);
      return 'member';
    }
  }, []);

  const handleGetDebugInfo = useCallback(() => {
    try {
      return getAuthDebugInfo();
    } catch (error) {
      console.error('Failed to get debug info:', error);
      return {};
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    logout: handleSignOut, // Alias
    login: handleLogin, // Add login method
    refreshProfile: handleRefreshProfile,
    isAdmin: handleIsAdmin,
    isAdminSync: handleIsAdminSync,
    getCurrentUserRole: handleGetCurrentUserRole,
    getDebugInfo: handleGetDebugInfo,
    clearError,
    setLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
