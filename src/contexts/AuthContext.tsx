import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthState, type SignInData, type SignUpData } from '../lib/auth';

interface AuthContextType {
  state: AuthState;
  login: (data: SignInData) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: SignUpData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((state) => {
      console.log('🔄 Auth context state updated:', state.user?.email, state.profile?.role);
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const login = async (data: SignInData): Promise<boolean> => {
    console.log('🔐 AuthContext login attempt:', data.email);
    
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { user, error } = await authService.signIn(data);
    
    if (error) {
      console.log('❌ Login failed:', error);
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return false;
    }
    
    if (user) {
      console.log('✅ Login successful, redirecting...');
      return true;
    }
    
    return false;
  };

  const logout = async (): Promise<void> => {
    await authService.signOut();
  };

  const register = async (data: SignUpData): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { user, error } = await authService.signUp(data);
    
    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return false;
    }
    
    return Boolean(user);
  };

  return (
    <AuthContext.Provider value={{
      state: authState,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
