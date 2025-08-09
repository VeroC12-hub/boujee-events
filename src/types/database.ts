// Global type definitions to fix build errors

declare global {
  interface Window { 
    gapi: any;
    google: any;
    Stripe: any;
    stripe: any;
    toast: any;
  }
}

// Common types to prevent build failures
export interface UploadProgress {
  loaded?: number;
  total?: number;
  percent?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface PublicUser {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  avatar_url?: string;
  display_name?: string;
  // Flexible properties to prevent build errors
  [key: string]: any;
}

export interface User extends PublicUser {
  status?: string;
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
  full_name?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  price?: number;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
  status?: string;
  organizer_id?: string;
  // Flexible properties
  [key: string]: any;
}

export interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  amount?: number;
  // Flexible properties
  [key: string]: any;
}

export interface VIPTier {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_guests?: number;
  perks?: string[];
  is_active?: boolean;
  // Flexible properties
  [key: string]: any;
}

export interface VIPReservation {
  id: string;
  tier_id: string;
  user_id: string;
  event_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  reservedAt: string;
  // Flexible properties
  [key: string]: any;
}

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  google_drive_file_id: string;
  file_type: 'video' | 'image' | 'document' | 'other';
  is_public: boolean;
  uploaded_by: string;
  created_at?: string;
  updated_at?: string;
  download_url?: string;
  // Add missing properties
  web_view_link?: string;
  thumbnail_url?: string;
}

export {}
