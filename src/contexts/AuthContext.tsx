// Enhanced Authentication Context with JWT support
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, type AuthResult, type LoginCredentials, type RegisterData } from '../services/auth-browser';
import type { User } from '../types/database';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Omit<User, 'password'> | null;
  token: string | null;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: Omit<User, 'password'>; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check localStorage for token
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        // Verify token is still valid
        const verification = await authService.verifyToken(storedToken);
        
        if (verification.valid && verification.user) {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: verification.user,
              token: storedToken
            }
          });
          return;
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await authService.login(credentials);
      
      if (result.success && result.token && result.user) {
        // Store auth data
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.user,
            token: result.token.token
          }
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: result.message });
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const register = async (data: RegisterData): Promise<AuthResult> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const result = await authService.register(data);
      
      if (result.success && result.token && result.user) {
        // Store auth data
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.user,
            token: result.token.token
          }
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: result.message });
      }
      
      return result;
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear stored auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      if (!state.token) return;
      
      const result = await authService.refreshToken(state.token);
      
      if (result.success && result.token && result.user) {
        localStorage.setItem('auth_token', result.token.token);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.user,
            token: result.token.token
          }
        });
      } else {
        // Refresh failed, logout user
        await logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
    try {
      if (!state.user) {
        return { success: false, message: 'User not authenticated' };
      }
      
      const result = await authService.changePassword(state.user.id, currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Failed to change password' };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return authService.hasPermission(state.user, permission);
  };

  // Auto-refresh token before expiration
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      const interval = setInterval(() => {
        refreshToken();
      }, 30 * 60 * 1000); // Refresh every 30 minutes

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.token]);

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    refreshToken,
    changePassword,
    clearError,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Legacy compatibility wrapper for existing components
export const useLegacyAuth = () => {
  const auth = useAuth();
  
  return {
    state: auth.state,
    clearError: auth.clearError,
    logout: auth.logout,
    // Legacy login method that maps to new auth system
    login: async (role: 'admin' | 'organizer' | 'member', email: string, userData?: Record<string, unknown>) => {
      // For emergency admin access during development
      if (role === 'admin' && email === 'admin@boujeeevents.com') {
        try {
          // Try to login first, if no user exists, create one
          const loginResult = await auth.login({
            email,
            password: 'admin123'
          });
          
          if (!loginResult.success) {
            // User doesn't exist, create admin user
            const registerResult = await auth.register({
              email,
              name: userData?.name as string || 'Admin User',
              password: 'admin123',
              role: 'member' // Will be updated to admin
            });
            
            if (registerResult.success && registerResult.user) {
              // In a real system, this would be done through proper admin creation
              // For now, we'll update the user in localStorage
              const updatedUser = { ...registerResult.user, role: 'admin' as const };
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            }
            
            return registerResult.success;
          }
          
          return loginResult.success;
        } catch (error) {
          console.error('Legacy admin login error:', error);
          return false;
        }
      }
      
      // For other cases, return false to require proper credentials
      console.warn('Legacy login called with non-admin credentials. Use proper login form.');
      return false;
    }
  };
};