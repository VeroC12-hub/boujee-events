import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
    
    const unsubscribe = authService.onAuthStateChange((newState) => {
      console.log('📢 AuthProvider: State updated', {
        hasUser: !!newState.user,
        userEmail: newState.user?.email,
        hasProfile: !!newState.profile,
        userRole: newState.profile?.role,
        loading: newState.loading,
        error: newState.error
      });
      
      setState(newState);
    });

    return () => {
      console.log('🔧 AuthProvider: Cleaning up auth state listener');
      unsubscribe();
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
    console.log('🚪 AuthProvider: Sign out');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authSignOut();
      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const handleRefreshProfile = useCallback(async () => {
    console.log('🔄 AuthProvider: Refreshing profile');
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await refreshProfile();
      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile refresh failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const handleIsAdmin = useCallback(async () => {
    try {
      return await isAdmin();
    } catch (error) {
      console.warn('Admin check failed:', error);
      return false;
    }
  }, []);

  const handleIsAdminSync = useCallback(() => {
    return authService.isAdminSync();
  }, []);

  const handleGetCurrentUserRole = useCallback(async () => {
    try {
      return await getCurrentUserRole();
    } catch (error) {
      console.warn('Role check failed:', error);
      return 'member';
    }
  }, []);

  const handleGetDebugInfo = useCallback(() => {
    return {
      ...getAuthDebugInfo(),
      contextState: {
        hasUser: !!state.user,
        hasProfile: !!state.profile,
        loading: state.loading,
        error: state.error
      }
    };
  }, [state]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // Context value
  const value: AuthContextType = {
    // State
    ...state,
    
    // Actions
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    logout: handleSignOut, // Alias
    refreshProfile: handleRefreshProfile,
    isAdmin: handleIsAdmin,
    isAdminSync: handleIsAdminSync,
    getCurrentUserRole: handleGetCurrentUserRole,
    getDebugInfo: handleGetDebugInfo,
    clearError,
    setLoading
  };

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🐛 AuthProvider Debug Info:', handleGetDebugInfo());
    }
  }, [state, handleGetDebugInfo]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Additional utility hooks
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthProfile = () => {
  const { profile } = useAuth();
  return profile;
};

export const useAuthLoading = () => {
  const { loading } = useAuth();
  return loading;
};

export const useAuthError = () => {
  const { error, clearError } = useAuth();
  return { error, clearError };
};

export const useIsAdmin = () => {
  const { isAdminSync } = useAuth();
  return isAdminSync();
};

export const useUserRole = () => {
  const { profile } = useAuth();
  return profile?.role || 'member';
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: 'admin' | 'organizer' | 'member'
) => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { user, profile, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!user || !profile) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">You need to be signed in to view this page.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }
    
    if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Insufficient Permissions</h1>
            <p className="text-gray-300 mb-6">
              You don't have the required permissions to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
  
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithAuthComponent;
};

export default AuthContext;
