import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  tier: 'member' | 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  joinDate: string;
  avatar?: string;
  preferences: {
    eventTypes: string[];
    notifications: boolean;
    newsletter: boolean;
  };
}

interface PublicUserContextType {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<PublicUser>) => Promise<boolean>;
  addPoints: (points: number, reason: string) => void;
}

const PublicUserContext = createContext<PublicUserContextType | undefined>(undefined);

export const usePublicUser = () => {
  const context = useContext(PublicUserContext);
  if (context === undefined) {
    throw new Error('usePublicUser must be used within a PublicUserProvider');
  }
  return context;
};

interface PublicUserProviderProps {
  children: ReactNode;
}

export const PublicUserProvider: React.FC<PublicUserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user session on mount
  useEffect(() => {
    const checkStoredSession = () => {
      try {
        const storedUser = localStorage.getItem('publicUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking stored session:', error);
        localStorage.removeItem('publicUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: PublicUser = {
        id: 'user_' + Date.now(),
        name: 'John Doe',
        email: email,
        tier: 'bronze',
        points: 150,
        joinDate: new Date().toISOString(),
        preferences: {
          eventTypes: ['concerts', 'galas'],
          notifications: true,
          newsletter: true
        }
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('publicUser', JSON.stringify(mockUser));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const newUser: PublicUser = {
        id: 'user_' + Date.now(),
        name: userData.name,
        email: userData.email,
        tier: 'member',
        points: 0,
        joinDate: new Date().toISOString(),
        preferences: {
          eventTypes: [],
          notifications: true,
          newsletter: true
        }
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('publicUser', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('publicUser');
  };

  const updateProfile = async (updates: Partial<PublicUser>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('publicUser', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addPoints = (points: number, reason: string) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      points: user.points + points
    };
    
    // Update tier based on points
    if (updatedUser.points >= 1000) updatedUser.tier = 'platinum';
    else if (updatedUser.points >= 500) updatedUser.tier = 'gold';
    else if (updatedUser.points >= 200) updatedUser.tier = 'silver';
    else if (updatedUser.points >= 50) updatedUser.tier = 'bronze';
    
    setUser(updatedUser);
    localStorage.setItem('publicUser', JSON.stringify(updatedUser));
    
    // Show notification (you could integrate with toast system here)
    console.log(`Earned ${points} points for ${reason}!`);
  };

  const value: PublicUserContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    addPoints
  };

  return (
    <PublicUserContext.Provider value={value}>
      {children}
    </PublicUserContext.Provider>
  );
};