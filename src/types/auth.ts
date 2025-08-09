// Authentication Types
import type { User as DatabaseUser } from './database';

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

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  full_name: string;
  avatar: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
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

export interface AuthState {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token?: string;
}

export interface AuthContextType {
  user: PublicUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getSession: () => Promise<any>;
  getProfile: () => Promise<UserProfile | null>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: PublicUser;
  session: any;
  token?: string;
}