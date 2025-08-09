// Enhanced User Types for Boujee Events

export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'organizer' | 'member' | 'attendee';
  status: 'active' | 'inactive' | 'banned' | 'pending' | 'approved';
  avatar?: string;
  created_at: string;
  updated_at: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
  };
  app_metadata?: {
    role?: string;
    permissions?: string[];
  };
  aud?: string;
  
  // Enhanced profile fields
  stats?: {
    eventsAttended: number;
    eventsCreated: number;
    totalSpent: number;
    avgRating?: number;
  };
  
  preferences?: {
    eventTypes: string[];
    maxPrice: number;
    notifications: boolean;
    newsletter: boolean;
    marketing: boolean;
  };
  
  socialProfile?: {
    bio?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  loyaltyPoints?: number;
  isVip?: boolean;
  joinDate?: string;
  lastLogin?: string;
  eventsCreated?: number;
  eventsAttended?: number;
  totalSpent?: number;
  verified?: boolean;
}

export interface PublicUser {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'organizer' | 'member' | 'attendee';
  joinDate?: string;
  verified?: boolean;
  
  // Public profile fields
  stats?: {
    eventsAttended: number;
    eventsCreated: number;
    totalSpent: number;
    avgRating?: number;
  };
  
  preferences?: {
    eventTypes: string[];
    maxPrice: number;
    notifications: boolean;
    newsletter: boolean;
    marketing: boolean;
  };
  
  socialProfile?: {
    bio?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  loyaltyPoints?: number;
  isVip?: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'organizer' | 'member' | 'attendee';
  password: string;
  full_name?: string;
}

export interface UpdateUserRequest {
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'organizer' | 'member' | 'attendee';
  status?: 'active' | 'inactive' | 'banned' | 'pending' | 'approved';
  avatar?: string;
  preferences?: {
    eventTypes?: string[];
    maxPrice?: number;
    notifications?: boolean;
    newsletter?: boolean;
    marketing?: boolean;
  };
  socialProfile?: {
    bio?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    eventTypes?: string[];
    maxPrice?: number;
    notifications?: boolean;
    newsletter?: boolean;
    marketing?: boolean;
  };
  socialProfile?: {
    bio?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UserStats {
  eventsAttended: number;
  eventsCreated: number;
  totalSpent: number;
  avgRating?: number;
  bookingsCount?: number;
  reviewsCount?: number;
}

export interface UserPreferences {
  eventTypes: string[];
  maxPrice: number;
  notifications: boolean;
  newsletter: boolean;
  marketing: boolean;
  language?: string;
  timezone?: string;
  currency?: string;
}

export interface SocialProfile {
  bio?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  eventReminders: boolean;
  promotions: boolean;
  newsletter: boolean;
  weeklyDigest: boolean;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'event_created' | 'event_attended' | 'booking_made' | 'profile_updated';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserRole {
  id: string;
  name: 'admin' | 'organizer' | 'member' | 'attendee';
  displayName: string;
  description: string;
  permissions: string[];
  canCreateEvents: boolean;
  canManageUsers: boolean;
  canAccessAdmin: boolean;
}

export interface LoyaltyProgram {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  points: number;
  nextTierPoints: number;
  benefits: string[];
  discountPercentage: number;
  earlyAccess: boolean;
  exclusiveEvents: boolean;
}

// Utility types
export type UserRoleType = 'admin' | 'organizer' | 'member' | 'attendee';
export type UserStatusType = 'active' | 'inactive' | 'banned' | 'pending' | 'approved';
export type LoyaltyTierType = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// Default values
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  eventTypes: [],
  maxPrice: 1000,
  notifications: true,
  newsletter: false,
  marketing: false,
  language: 'en',
  timezone: 'UTC',
  currency: 'USD'
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: true,
  push: true,
  sms: false,
  eventReminders: true,
  promotions: false,
  newsletter: false,
  weeklyDigest: true
};

export const USER_ROLES: UserRole[] = [
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access and management',
    permissions: ['*'],
    canCreateEvents: true,
    canManageUsers: true,
    canAccessAdmin: true
  },
  {
    id: 'organizer',
    name: 'organizer',
    displayName: 'Event Organizer',
    description: 'Can create and manage events',
    permissions: ['events:create', 'events:update', 'events:delete', 'events:view'],
    canCreateEvents: true,
    canManageUsers: false,
    canAccessAdmin: false
  },
  {
    id: 'member',
    name: 'member',
    displayName: 'Member',
    description: 'Premium user with additional benefits',
    permissions: ['events:view', 'bookings:create', 'profile:update'],
    canCreateEvents: false,
    canManageUsers: false,
    canAccessAdmin: false
  },
  {
    id: 'attendee',
    name: 'attendee',
    displayName: 'Attendee',
    description: 'Basic user who can attend events',
    permissions: ['events:view', 'bookings:create'],
    canCreateEvents: false,
    canManageUsers: false,
    canAccessAdmin: false
  }
];
