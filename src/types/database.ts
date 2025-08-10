// src/types/database.ts - Complete TypeScript types for Supabase database

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          role: 'admin' | 'organizer' | 'member' | 'viewer';
          status: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          role?: 'admin' | 'organizer' | 'member' | 'viewer';
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          role?: 'admin' | 'organizer' | 'member' | 'viewer';
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          event_time: string;
          venue: string;
          address: string | null;
          capacity: number;
          price: number;
          category: string;
          status: 'active' | 'draft' | 'ended' | 'cancelled';
          organizer_id: string | null;
          featured: boolean;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          event_time: string;
          venue: string;
          address?: string | null;
          capacity?: number;
          price?: number;
          category?: string;
          status?: 'active' | 'draft' | 'ended' | 'cancelled';
          organizer_id?: string | null;
          featured?: boolean;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string;
          venue?: string;
          address?: string | null;
          capacity?: number;
          price?: number;
          category?: string;
          status?: 'active' | 'draft' | 'ended' | 'cancelled';
          organizer_id?: string | null;
          featured?: boolean;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          booking_number: string;
          quantity: number;
          total_amount: number;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          payment_intent_id: string | null;
          booking_status: 'confirmed' | 'cancelled' | 'pending';
          special_requests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          booking_number?: string;
          quantity?: number;
          total_amount: number;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_intent_id?: string | null;
          booking_status?: 'confirmed' | 'cancelled' | 'pending';
          special_requests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          booking_number?: string;
          quantity?: number;
          total_amount?: number;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          payment_intent_id?: string | null;
          booking_status?: 'confirmed' | 'cancelled' | 'pending';
          special_requests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          name: string;
          original_name: string;
          mime_type: string;
          file_size: number;
          google_drive_file_id: string;
          google_drive_folder_id: string | null;
          thumbnail_url: string | null;
          preview_url: string | null;
          download_url: string | null;
          web_view_link: string | null;
          file_type: 'image' | 'video' | 'document' | 'other';
          uploaded_by: string;
          tags: string[] | null;
          description: string | null;
          is_public: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          original_name: string;
          mime_type: string;
          file_size: number;
          google_drive_file_id: string;
          google_drive_folder_id?: string | null;
          thumbnail_url?: string | null;
          preview_url?: string | null;
          download_url?: string | null;
          web_view_link?: string | null;
          file_type: 'image' | 'video' | 'document' | 'other';
          uploaded_by: string;
          tags?: string[] | null;
          description?: string | null;
          is_public?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          original_name?: string;
          mime_type?: string;
          file_size?: number;
          google_drive_file_id?: string;
          google_drive_folder_id?: string | null;
          thumbnail_url?: string | null;
          preview_url?: string | null;
          download_url?: string | null;
          web_view_link?: string | null;
          file_type?: 'image' | 'video' | 'document' | 'other';
          uploaded_by?: string;
          tags?: string[] | null;
          description?: string | null;
          is_public?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_media: {
        Row: {
          id: string;
          event_id: string;
          media_file_id: string;
          display_order: number;
          is_featured: boolean;
          caption: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          media_file_id: string;
          display_order?: number;
          is_featured?: boolean;
          caption?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          media_file_id?: string;
          display_order?: number;
          is_featured?: boolean;
          caption?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      homepage_media: {
        Row: {
          id: string;
          media_file_id: string;
          media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
          display_order: number;
          is_active: boolean;
          title: string | null;
          description: string | null;
          link_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          media_file_id: string;
          media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
          display_order?: number;
          is_active?: boolean;
          title?: string | null;
          description?: string | null;
          link_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          media_file_id?: string;
          media_type?: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
          display_order?: number;
          is_active?: boolean;
          title?: string | null;
          description?: string | null;
          link_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      google_drive_tokens: {
        Row: {
          id: string;
          user_id: string;
          access_token: string;
          refresh_token: string | null;
          token_type: string;
          expires_at: string | null;
          scope: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          access_token: string;
          refresh_token?: string | null;
          token_type?: string;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          token_type?: string;
          expires_at?: string | null;
          scope?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      google_drive_folders: {
        Row: {
          id: string;
          event_id: string | null;
          folder_name: string;
          google_drive_folder_id: string;
          parent_folder_id: string | null;
          folder_type: 'main' | 'event' | 'photos' | 'videos' | 'archive';
          web_view_link: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          folder_name: string;
          google_drive_folder_id: string;
          parent_folder_id?: string | null;
          folder_type: 'main' | 'event' | 'photos' | 'videos' | 'archive';
          web_view_link?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          folder_name?: string;
          google_drive_folder_id?: string;
          parent_folder_id?: string | null;
          folder_type?: 'main' | 'event' | 'photos' | 'videos' | 'archive';
          web_view_link?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          read: boolean;
          action_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          read?: boolean;
          action_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          read?: boolean;
          action_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'organizer' | 'member' | 'viewer';
      user_status: 'pending' | 'approved' | 'rejected' | 'suspended';
      event_status: 'active' | 'draft' | 'ended' | 'cancelled';
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
      booking_status: 'confirmed' | 'cancelled' | 'pending';
      file_type: 'image' | 'video' | 'document' | 'other';
      media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
      notification_type: 'info' | 'success' | 'warning' | 'error';
      folder_type: 'main' | 'event' | 'photos' | 'videos' | 'archive';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper type exports for convenience
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Specific table types
export type Profile = Tables<'profiles'>;
export type Event = Tables<'events'>;
export type Booking = Tables<'bookings'>;
export type MediaFile = Tables<'media_files'>;
export type EventMedia = Tables<'event_media'>;
export type HomepageMedia = Tables<'homepage_media'>;
export type GoogleDriveToken = Tables<'google_drive_tokens'>;
export type GoogleDriveFolder = Tables<'google_drive_folders'>;
export type Notification = Tables<'notifications'>;

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type MediaFileInsert = Database['public']['Tables']['media_files']['Insert'];
export type EventMediaInsert = Database['public']['Tables']['event_media']['Insert'];
export type HomepageMediaInsert = Database['public']['Tables']['homepage_media']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
export type MediaFileUpdate = Database['public']['Tables']['media_files']['Update'];
export type EventMediaUpdate = Database['public']['Tables']['event_media']['Update'];
export type HomepageMediaUpdate = Database['public']['Tables']['homepage_media']['Update'];

// Enum types
export type UserRole = Enums<'user_role'>;
export type UserStatus = Enums<'user_status'>;
export type EventStatus = Enums<'event_status'>;
export type PaymentStatus = Enums<'payment_status'>;
export type BookingStatus = Enums<'booking_status'>;
export type FileType = Enums<'file_type'>;
export type MediaType = Enums<'media_type'>;
export type NotificationType = Enums<'notification_type'>;
export type FolderType = Enums<'folder_type'>;

// Extended types with relationships
export interface EventWithMedia extends Event {
  media_files?: (EventMedia & {
    media_file: MediaFile;
  })[];
}

export interface EventWithBookings extends Event {
  bookings?: Booking[];
  booking_count?: number;
  revenue?: number;
}

export interface ProfileWithStats extends Profile {
  total_bookings?: number;
  total_spent?: number;
  last_booking_date?: string;
}

export interface MediaFileWithEvents extends MediaFile {
  events?: (EventMedia & {
    event: Event;
  })[];
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export default Database;
