import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, registerUser, getUserById, verifyAuthentication, User, AuthTokens } from '../lib/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'member' | 'organizer';
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REFRESH_USER'; payload: User };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tokens: null,
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
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
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
    case 'REFRESH_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('authTokens');
        const storedUser = localStorage.getItem('authUser');
        
        if (storedTokens && storedUser) {
          const tokens: AuthTokens = JSON.parse(storedTokens);
          const user: User = JSON.parse(storedUser);
          
          // Verify token is still valid
          try {
            verifyAuthentication(tokens.accessToken);
            
            // Refresh user data from database
            const currentUser = await getUserById(user.id);
            if (currentUser && currentUser.status === 'active') {
              dispatch({ 
                type: 'LOGIN_SUCCESS', 
                payload: { user: currentUser, tokens } 
              });
              return;
            }
          } catch (error) {
            console.log('Stored token invalid, clearing auth');
            localStorage.removeItem('authTokens');
            localStorage.removeItem('authUser');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const loginResponse = await loginUser(email, password);
      
      // Store authentication data
      localStorage.setItem('authTokens', JSON.stringify(loginResponse.tokens));
      localStorage.setItem('authUser', JSON.stringify(loginResponse.user));
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: loginResponse 
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'member' | 'organizer';
  }): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const registerResponse = await registerUser(userData);
      
      // Store authentication data
      localStorage.setItem('authTokens', JSON.stringify(registerResponse.tokens));
      localStorage.setItem('authUser', JSON.stringify(registerResponse.user));
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: registerResponse 
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    // Clear stored authentication data
    localStorage.removeItem('authTokens');
    localStorage.removeItem('authUser');
    
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshAuth = async (): Promise<void> => {
    if (!state.user) return;
    
    try {
      const currentUser = await getUserById(state.user.id);
      if (currentUser) {
        dispatch({ type: 'REFRESH_USER', payload: currentUser });
        localStorage.setItem('authUser', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const contextValue: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;