import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  socialProfile?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  loyaltyTier?: string;
  loyaltyPoints?: number;
  isVip?: boolean;
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
    eventReminders: boolean;
    privacySettings: boolean;
  };
  stats?: {
    eventsAttended: number;
    totalSpent: number;
    reviewsLeft: number;
    favoriteEvents: number;
  };
  status: string;
}

export interface PublicUserContextType {
  user: PublicUser | null;
  register: (data: any) => Promise<void>;
  isLoading: boolean;
  favorites: any[];
  history: any[];
  loyaltyProgram: any;
  notifications: any[];
  getUnreadCount: () => number;
  markNotificationRead: (id: string) => void;
  updatePreferences: (prefs: any) => void;
  updateProfile: (updates: Partial<PublicUser>) => Promise<void>;
  addToFavorites: (eventId: string) => void;
  removeFromFavorites: (eventId: string) => void;
}

const PublicUserContext = createContext<PublicUserContextType | undefined>(undefined);

export const PublicUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loyaltyProgram, setLoyaltyProgram] = useState<any>({
    currentTier: 'Bronze',
    points: 0,
    nextTierPoints: 1000,
    benefits: []
  });

  useEffect(() => {
    // Load user data from localStorage or API
    const loadUserData = () => {
      const storedUser = localStorage.getItem('boujee_public_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      const storedFavorites = localStorage.getItem('boujee_favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      
      const storedHistory = localStorage.getItem('boujee_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      
      const storedNotifications = localStorage.getItem('boujee_notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    };

    loadUserData();
  }, []);

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      // Mock registration logic
      const newUser: PublicUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        name: data.name || data.fullName,
        status: 'active',
        loyaltyTier: 'Bronze',
        loyaltyPoints: 0,
        isVip: false,
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          newsletter: true,
          eventReminders: true,
          privacySettings: false
        },
        stats: {
          eventsAttended: 0,
          totalSpent: 0,
          reviewsLeft: 0,
          favoriteEvents: 0
        },
        socialProfile: {}
      };
      
      setUser(newUser);
      localStorage.setItem('boujee_public_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<PublicUser>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('boujee_public_user', JSON.stringify(updatedUser));
  };

  const updatePreferences = (prefs: any) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...prefs }
    };
    setUser(updatedUser);
    localStorage.setItem('boujee_public_user', JSON.stringify(updatedUser));
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const markNotificationRead = (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('boujee_notifications', JSON.stringify(updatedNotifications));
  };

  const addToFavorites = (eventId: string) => {
    const newFavorites = [...favorites, { eventId, addedAt: new Date().toISOString() }];
    setFavorites(newFavorites);
    localStorage.setItem('boujee_favorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (eventId: string) => {
    const newFavorites = favorites.filter(f => f.eventId !== eventId);
    setFavorites(newFavorites);
    localStorage.setItem('boujee_favorites', JSON.stringify(newFavorites));
  };

  const value: PublicUserContextType = {
    user,
    register,
    isLoading,
    favorites,
    history,
    loyaltyProgram,
    notifications,
    getUnreadCount,
    markNotificationRead,
    updatePreferences,
    updateProfile,
    addToFavorites,
    removeFromFavorites
  };

  return (
    <PublicUserContext.Provider value={value}>
      {children}
    </PublicUserContext.Provider>
  );
};

export const usePublicUser = () => {
  const context = useContext(PublicUserContext);
  if (!context) {
    throw new Error('usePublicUser must be used within a PublicUserProvider');
  }
  return context;
};

export { PublicUserContext };
