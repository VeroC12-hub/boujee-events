import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PublicUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  profile?: {
    avatar_url?: string;
    bio?: string;
    phone?: string;
    preferences?: Record<string, any>;
  };
}

export interface PublicUserContextType {
  user: PublicUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  updateProfile: (updates: Partial<PublicUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock users for development
  const mockUsers: PublicUser[] = [
    {
      id: '1',
      email: 'admin@test.com',
      full_name: 'Admin User',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        bio: 'System Administrator',
        phone: '+1 (555) 123-4567'
      }
    },
    {
      id: '2',
      email: 'organizer@test.com',
      full_name: 'Event Organizer',
      role: 'organizer',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b742?w=100',
        bio: 'Professional Event Organizer',
        phone: '+1 (555) 234-5678'
      }
    },
    {
      id: '3',
      email: 'member@test.com',
      full_name: 'Premium Member',
      role: 'member',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        bio: 'VIP Event Enthusiast',
        phone: '+1 (555) 345-6789'
      }
    }
  ];

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication
      const mockUser = mockUsers.find(u => u.email === email);
      
      if (!mockUser) {
        throw new Error('User not found');
      }

      // Mock password validation (in real app, this would be handled server-side)
      const validPasswords: Record<string, string> = {
        'admin@test.com': 'TestAdmin2025',
        'organizer@test.com': 'TestOrganizer2025',
        'member@test.com': 'TestMember2025'
      };

      if (validPasswords[email] !== password) {
        throw new Error('Invalid password');
      }

      setUser(mockUser);
      localStorage.setItem('boujee_user', JSON.stringify(mockUser));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('boujee_user');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser: PublicUser = {
        id: (mockUsers.length + 1).toString(),
        email,
        full_name: fullName,
        role: 'member',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          bio: 'New member',
          preferences: {}
        }
      };

      // Add to mock users (in real app, this would be saved to database)
      mockUsers.push(newUser);
      
      setUser(newUser);
      localStorage.setItem('boujee_user', JSON.stringify(newUser));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<PublicUser>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString()
      };

      setUser(updatedUser);
      localStorage.setItem('boujee_user', JSON.stringify(updatedUser));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    setLoading(true);
    
    try {
      // Simulate API call to refresh user data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedUser = localStorage.getItem('boujee_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setLoading(false);
    }
  };

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedUser = localStorage.getItem('boujee_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Failed to load user from localStorage:', err);
        localStorage.removeItem('boujee_user');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const value: PublicUserContextType = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    updateProfile,
    refreshUser
  };

  return (
    <PublicUserContext.Provider value={value}>
      {children}
    </PublicUserContext.Provider>
  );
};

export default PublicUserContext;
