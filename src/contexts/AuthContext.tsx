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
  login: (credentials: LoginRequest) => Promise<boolean>;
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
  isLoading: true, // Start with loading true to check existing session
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
          
          // Validate the session is still valid
          if (validateCredentials(user.email, savedToken)) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
            console.log('✅ Session restored successfully');
            return;
          } else {
            console.log('❌ Session expired, clearing storage');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
          }
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

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      // Validate credentials
      const user = getUserByCredentials(credentials.email, credentials.password);
      
      if (!user) {
        console.log('❌ Invalid credentials');
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid email or password' });
        return false;
      }

      // Transform to expected User format
      const authUser: User = {
        id: user.id,
        name: user.displayName,
        email: user.email,
        role: user.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=D4AF37&color=000`,
        status: user.isActive ? 'active' : 'inactive',
        lastLogin: new Date().toLocaleString(),
        permissions: user.permissions
      };

      // Save to localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      localStorage.setItem('auth_token', credentials.password); // In real app, use JWT
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: authUser });
      console.log('✅ Login successful for:', user.displayName);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Login failed. Please try again.' });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear localStorage
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
