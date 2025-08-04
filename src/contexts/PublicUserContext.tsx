import React, { createContext, useContext, useState, useEffect } from 'react';

// Enhanced User Types for Public Site
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  isVip: boolean;
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  preferences: {
    favoriteCategories: string[];
    priceRange: [number, number];
    notifications: {
      eventReminders: boolean;
      earlyAccess: boolean;
      deals: boolean;
      recommendations: boolean;
    };
  };
  stats: {
    eventsAttended: number;
    totalSpent: number;
    reviewsGiven: number;
    averageRating: number;
  };
  socialProfile: {
    bio?: string;
    isPublic: boolean;
    followers: number;
    following: number;
  };
}

export interface UserHistory {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  date: string;
  ticketType: string;
  amount: number;
  status: 'attended' | 'upcoming' | 'cancelled';
  rating?: number;
  review?: string;
}

export interface UserFavorite {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  addedAt: string;
}

export interface UserReview {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  review: string;
  date: string;
  verified: boolean; // User actually attended the event
  helpfulVotes: number;
  replies?: UserReviewReply[];
}

export interface UserReviewReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  date: string;
  isEventOrganizer?: boolean;
}

export interface LoyaltyProgram {
  currentPoints: number;
  currentTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  pointsToNextTier: number;
  nextTier?: 'Silver' | 'Gold' | 'Platinum';
  tierBenefits: {
    earlyAccess: boolean;
    exclusiveEvents: boolean;
    discountPercentage: number;
    prioritySupport: boolean;
    freeUpgrades: boolean;
    conciergeAccess: boolean;
  };
  history: LoyaltyTransaction[];
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: string;
  eventId?: string;
}

interface PublicUserContextType {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Authentication
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<PublicUser> & { email: string; password: string }) => Promise<void>;
  logout: () => void;
  
  // User Profile
  updateProfile: (updates: Partial<PublicUser>) => Promise<void>;
  updatePreferences: (preferences: Partial<PublicUser['preferences']>) => Promise<void>;
  
  // Favorites
  favorites: UserFavorite[];
  addToFavorites: (eventId: string) => Promise<void>;
  removeFromFavorites: (eventId: string) => Promise<void>;
  isFavorite: (eventId: string) => boolean;
  
  // History
  history: UserHistory[];
  getEventHistory: () => Promise<UserHistory[]>;
  
  // Reviews
  addReview: (eventId: string, rating: number, review: string) => Promise<void>;
  updateReview: (reviewId: string, rating: number, review: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getEventReviews: (eventId: string) => Promise<UserReview[]>;
  
  // Loyalty Program
  loyaltyProgram: LoyaltyProgram | null;
  redeemPoints: (points: number, description: string) => Promise<void>;
  
  // Social Features
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  getUserProfile: (userId: string) => Promise<PublicUser>;
  
  // Notifications
  notifications: UserNotification[];
  markNotificationRead: (notificationId: string) => Promise<void>;
  getUnreadCount: () => number;
}

export interface UserNotification {
  id: string;
  type: 'event_reminder' | 'early_access' | 'deal' | 'recommendation' | 'social' | 'loyalty';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
  imageUrl?: string;
}

const PublicUserContext = createContext<PublicUserContextType | undefined>(undefined);

export const usePublicUser = () => {
  const context = useContext(PublicUserContext);
  if (context === undefined) {
    throw new Error('usePublicUser must be used within a PublicUserProvider');
  }
  return context;
};

// Mock data for development
const mockUser: PublicUser = {
  id: 'user1',
  name: 'Alexandra Chen',
  email: 'alexandra@example.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  joinDate: '2024-01-15',
  isVip: true,
  loyaltyPoints: 2750,
  loyaltyTier: 'Gold',
  preferences: {
    favoriteCategories: ['Luxury Experience', 'Corporate'],
    priceRange: [500, 3000],
    notifications: {
      eventReminders: true,
      earlyAccess: true,
      deals: true,
      recommendations: false
    }
  },
  stats: {
    eventsAttended: 12,
    totalSpent: 18750,
    reviewsGiven: 8,
    averageRating: 4.6
  },
  socialProfile: {
    bio: 'Luxury event enthusiast and CEO of Luxury Brands International. Love discovering unique experiences!',
    isPublic: true,
    followers: 156,
    following: 89
  }
};

const mockFavorites: UserFavorite[] = [
  {
    id: 'fav1',
    eventId: '1',
    eventTitle: 'Midnight in Paradise',
    eventImage: 'https://images.unsplash.com/photo-1551818255-e6e10975cd67?w=800',
    eventDate: '2025-12-31',
    addedAt: '2024-12-01'
  }
];

const mockHistory: UserHistory[] = [
  {
    id: 'hist1',
    eventId: 'past1',
    eventTitle: 'Sunset Yacht Gala Monaco',
    eventImage: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800',
    date: '2024-09-15',
    ticketType: 'VIP Access',
    amount: 750,
    status: 'attended',
    rating: 5,
    review: 'Absolutely incredible experience! The service was impeccable and the views were breathtaking.'
  },
  {
    id: 'hist2',
    eventId: '2',
    eventTitle: 'Golden Hour Festival',
    eventImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    date: '2025-03-20',
    ticketType: 'Festival Pass',
    amount: 450,
    status: 'upcoming'
  }
];

const mockLoyaltyProgram: LoyaltyProgram = {
  currentPoints: 2750,
  currentTier: 'Gold',
  pointsToNextTier: 1250,
  nextTier: 'Platinum',
  tierBenefits: {
    earlyAccess: true,
    exclusiveEvents: true,
    discountPercentage: 15,
    prioritySupport: true,
    freeUpgrades: true,
    conciergeAccess: false
  },
  history: [
    {
      id: 'loyal1',
      type: 'earned',
      points: 750,
      description: 'Attended Sunset Yacht Gala Monaco',
      date: '2024-09-15',
      eventId: 'past1'
    },
    {
      id: 'loyal2',
      type: 'redeemed',
      points: -500,
      description: 'VIP Upgrade Redemption',
      date: '2024-10-01'
    }
  ]
};

const mockNotifications: UserNotification[] = [
  {
    id: 'notif1',
    type: 'event_reminder',
    title: 'Event Reminder',
    message: 'Golden Hour Festival starts in 2 days! Don\'t forget to prepare.',
    date: '2025-03-18',
    isRead: false,
    actionUrl: '/events/2',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
  },
  {
    id: 'notif2',
    type: 'loyalty',
    title: 'Points Earned!',
    message: 'You earned 150 loyalty points! Only 1,250 points until Platinum tier.',
    date: '2025-03-15',
    isRead: false
  }
];

export const PublicUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [history, setHistory] = useState<UserHistory[]>([]);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('publicUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setFavorites(mockFavorites);
      setHistory(mockHistory);
      setLoyaltyProgram(mockLoyaltyProgram);
      setNotifications(mockNotifications);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'alexandra@example.com' && password === 'password123') {
        setUser(mockUser);
        setIsAuthenticated(true);
        setFavorites(mockFavorites);
        setHistory(mockHistory);
        setLoyaltyProgram(mockLoyaltyProgram);
        setNotifications(mockNotifications);
        localStorage.setItem('publicUser', JSON.stringify(mockUser));
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<PublicUser> & { email: string; password: string }) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: PublicUser = {
        id: 'new_user_' + Date.now(),
        name: userData.name || 'New User',
        email: userData.email,
        avatar: userData.avatar,
        joinDate: new Date().toISOString().split('T')[0],
        isVip: false,
        loyaltyPoints: 100, // Welcome bonus
        loyaltyTier: 'Bronze',
        preferences: {
          favoriteCategories: [],
          priceRange: [0, 1000],
          notifications: {
            eventReminders: true,
            earlyAccess: true,
            deals: true,
            recommendations: true
          }
        },
        stats: {
          eventsAttended: 0,
          totalSpent: 0,
          reviewsGiven: 0,
          averageRating: 0
        },
        socialProfile: {
          bio: '',
          isPublic: false,
          followers: 0,
          following: 0
        }
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      setFavorites([]);
      setHistory([]);
      setLoyaltyProgram({
        currentPoints: 100,
        currentTier: 'Bronze',
        pointsToNextTier: 400,
        nextTier: 'Silver',
        tierBenefits: {
          earlyAccess: false,
          exclusiveEvents: false,
          discountPercentage: 5,
          prioritySupport: false,
          freeUpgrades: false,
          conciergeAccess: false
        },
        history: [
          {
            id: 'welcome',
            type: 'earned',
            points: 100,
            description: 'Welcome bonus',
            date: new Date().toISOString().split('T')[0]
          }
        ]
      });
      setNotifications([]);
      localStorage.setItem('publicUser', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setFavorites([]);
    setHistory([]);
    setLoyaltyProgram(null);
    setNotifications([]);
    localStorage.removeItem('publicUser');
  };

  const updateProfile = async (updates: Partial<PublicUser>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('publicUser', JSON.stringify(updatedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<PublicUser['preferences']>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences }
    };
    setUser(updatedUser);
    localStorage.setItem('publicUser', JSON.stringify(updatedUser));
  };

  const addToFavorites = async (eventId: string) => {
    // In a real app, this would make an API call
    const favorite: UserFavorite = {
      id: 'fav_' + Date.now(),
      eventId,
      eventTitle: 'Event Title', // Would fetch from API
      eventImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      eventDate: '2025-12-31',
      addedAt: new Date().toISOString()
    };
    setFavorites(prev => [...prev, favorite]);
  };

  const removeFromFavorites = async (eventId: string) => {
    setFavorites(prev => prev.filter(fav => fav.eventId !== eventId));
  };

  const isFavorite = (eventId: string) => {
    return favorites.some(fav => fav.eventId === eventId);
  };

  const getEventHistory = async () => {
    return history;
  };

  const addReview = async (eventId: string, rating: number, review: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Update user stats
    if (user) {
      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          reviewsGiven: user.stats.reviewsGiven + 1
        }
      };
      setUser(updatedUser);
      localStorage.setItem('publicUser', JSON.stringify(updatedUser));
    }
  };

  const updateReview = async (reviewId: string, rating: number, review: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const deleteReview = async (reviewId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const getEventReviews = async (eventId: string): Promise<UserReview[]> => {
    // Mock reviews
    return [
      {
        id: 'review1',
        eventId,
        userId: 'user1',
        userName: 'Alexandra Chen',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        rating: 5,
        review: 'Absolutely incredible experience! The service was impeccable.',
        date: '2024-09-16',
        verified: true,
        helpfulVotes: 12,
        replies: [
          {
            id: 'reply1',
            userId: 'org1',
            userName: 'Event Organizer',
            message: 'Thank you for the wonderful review! We\'re thrilled you enjoyed it.',
            date: '2024-09-17',
            isEventOrganizer: true
          }
        ]
      }
    ];
  };

  const redeemPoints = async (points: number, description: string) => {
    if (!loyaltyProgram || loyaltyProgram.currentPoints < points) {
      throw new Error('Insufficient points');
    }
    
    const transaction: LoyaltyTransaction = {
      id: 'redeem_' + Date.now(),
      type: 'redeemed',
      points: -points,
      description,
      date: new Date().toISOString().split('T')[0]
    };
    
    setLoyaltyProgram(prev => prev ? {
      ...prev,
      currentPoints: prev.currentPoints - points,
      history: [...prev.history, transaction]
    } : null);
  };

  const followUser = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const unfollowUser = async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const getUserProfile = async (userId: string): Promise<PublicUser> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUser;
  };

  const markNotificationRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.isRead).length;
  };

  const value: PublicUserContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    history,
    getEventHistory,
    addReview,
    updateReview,
    deleteReview,
    getEventReviews,
    loyaltyProgram,
    redeemPoints,
    followUser,
    unfollowUser,
    getUserProfile,
    notifications,
    markNotificationRead,
    getUnreadCount
  };

  return (
    <PublicUserContext.Provider value={value}>
      {children}
    </PublicUserContext.Provider>
  );
};