import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the user interface
export interface User {
  email: string;
  role: 'admin' | 'organizer' | 'member';
  displayName?: string;
  permissions?: string[];
  avatar?: string;
  status?: string;
  lastLogin?: string;
}

// Define the auth state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// Define the auth context interface
export interface AuthContextType {
  authState: AuthState;
  login: (role: string, email: string, userData?: any) => void;
  logout: () => void;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props interface for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setAuthState({
          isAuthenticated: true,
          user: userData,
          loading: false
        });
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Login function
  const login = (role: string, email: string, userData?: any) => {
    const user: User = {
      email,
      role: role as 'admin' | 'organizer' | 'member',
      displayName: userData?.displayName || role.charAt(0).toUpperCase() + role.slice(1),
      permissions: userData?.permissions || [],
      avatar: userData?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      status: 'Active',
      lastLogin: new Date().toISOString()
    };

    setAuthState({
      isAuthenticated: true,
      user,
      loading: false
    });

    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Logout function
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    localStorage.removeItem('user');
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    loading: authState.loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context as default
export default AuthContext;
