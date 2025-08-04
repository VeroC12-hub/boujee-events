// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { LoginRequest, User } from '../types/api';
import { getUserByCredentials, validateCredentials } from '../config/credentials';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (role: 'admin' | 'organizer' | 'member', email: string, userData?: any) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
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

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('auth_user');
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedUser && savedToken) {
          const user = JSON.parse(savedUser);
          console.log('🔐 Found existing session for:', user.email);
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          console.log('✅ Session restored successfully');
          return;
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingSession();
  }, []);

  const login = async (role: 'admin' | 'organizer' | 'member', email: string, userData?: any): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log(`[TEST AUTH] Attempting login for: ${email}, role: ${role}`);
      
      // Create the user object for the session
      const authUser: User = {
        id: userData?.id || Date.now().toString(),
        name: userData?.displayName || userData?.name || 'User',
        email: email,
        role: role,
        avatar: userData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.displayName || 'User')}&background=D4AF37&color=000`,
        status: 'active',
        lastLogin: new Date().toLocaleString(),
        permissions: userData?.permissions || []
      };

      // Save to localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      localStorage.setItem('auth_token', `${role}_${email}_${Date.now()}`);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: authUser });
      console.log(`[TEST AUTH] Login successful for: ${authUser.name}`);
      
      return true;
    } catch (error) {
      console.error('[TEST AUTH] Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed. Please try again.' });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      
      dispatch({ type: 'LOGOUT' });
      console.log('🚪 User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    clearError,
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
