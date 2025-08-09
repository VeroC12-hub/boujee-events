// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  full_name: string;
  avatar: string;
  phone?: string;
  bio?: string;
  role: 'admin' | 'organizer' | 'member';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  stats?: {
    eventsAttended: number;
    totalSpent: number;
    eventsCreated?: number;
  };
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    language: string;
    timezone: string;
  };
  loyaltyTier?: string;
  loyaltyPoints?: number;
  isVip?: boolean;
  socialProfile?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  full_name: string;
  avatar: string;
  phone?: string;
  stats?: {
    eventsAttended: number;
    totalSpent: number;
  };
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    language: string;
  };
  loyaltyTier?: string;
  loyaltyPoints?: number;
  isVip?: boolean;
  socialProfile?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface UserStats {
  eventsAttended: number;
  totalSpent: number;
  eventsCreated?: number;
  averageRating?: number;
  favoriteCategory?: string;
}

export interface UserPreferences {
  notifications: boolean;
  marketing: boolean;
  language: string;
  timezone: string;
  currency?: string;
  dateFormat?: string;
}

export interface SocialProfile {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  website?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  full_name: string;
  phone?: string;
  bio?: string;
  role?: 'admin' | 'organizer' | 'member';
}

export interface UpdateUserRequest {
  name?: string;
  full_name?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
  socialProfile?: Partial<SocialProfile>;
}