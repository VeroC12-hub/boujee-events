// Database Types for Supabase
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          venue: string;
          capacity: number;
          price: number;
          category: string;
          status: 'draft' | 'published' | 'cancelled' | 'completed';
          organizer_id: string;
          created_at: string;
          updated_at: string;
          featured: boolean;
          tags: string[];
          image_url?: string;
          max_attendees: number;
          current_attendees: number;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          date: string;
          time: string;
          location: string;
          venue: string;
          capacity: number;
          price: number;
          category: string;
          status?: 'draft' | 'published' | 'cancelled' | 'completed';
          organizer_id: string;
          created_at?: string;
          updated_at?: string;
          featured?: boolean;
          tags?: string[];
          image_url?: string;
          max_attendees: number;
          current_attendees?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          date?: string;
          time?: string;
          location?: string;
          venue?: string;
          capacity?: number;
          price?: number;
          category?: string;
          status?: 'draft' | 'published' | 'cancelled' | 'completed';
          organizer_id?: string;
          created_at?: string;
          updated_at?: string;
          featured?: boolean;
          tags?: string[];
          image_url?: string;
          max_attendees?: number;
          current_attendees?: number;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          phone?: string;
          bio?: string;
          role: 'admin' | 'organizer' | 'member';
          status: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string;
          phone?: string;
          bio?: string;
          role?: 'admin' | 'organizer' | 'member';
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          phone?: string;
          bio?: string;
          role?: 'admin' | 'organizer' | 'member';
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
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
          file_type: 'image' | 'video' | 'document' | 'other';
          is_public: boolean;
          is_archived: boolean; // This was the missing property
          uploaded_by: string;
          created_at: string;
          updated_at: string;
          tags?: string[];
          description?: string;
          thumbnail_url?: string;
          preview_url?: string;
          download_url?: string;
        };
        Insert: {
          id?: string;
          name: string;
          original_name: string;
          mime_type: string;
          file_size: number;
          google_drive_file_id: string;
          file_type: 'image' | 'video' | 'document' | 'other';
          is_public?: boolean;
          is_archived?: boolean;
          uploaded_by: string;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          description?: string;
          thumbnail_url?: string;
          preview_url?: string;
          download_url?: string;
        };
        Update: {
          id?: string;
          name?: string;
          original_name?: string;
          mime_type?: string;
          file_size?: number;
          google_drive_file_id?: string;
          file_type?: 'image' | 'video' | 'document' | 'other';
          is_public?: boolean;
          is_archived?: boolean;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          description?: string;
          thumbnail_url?: string;
          preview_url?: string;
          download_url?: string;
        };
      };
      event_media: {
        Row: {
          id: string;
          event_id: string;
          media_file_id: string;
          display_order: number;
          is_featured: boolean;
          caption?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          media_file_id: string;
          display_order?: number;
          is_featured?: boolean;
          caption?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          media_file_id?: string;
          display_order?: number;
          is_featured?: boolean;
          caption?: string;
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
          title?: string;
          description?: string;
          link_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          media_file_id: string;
          media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
          display_order?: number;
          is_active?: boolean;
          title?: string;
          description?: string;
          link_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          media_file_id?: string;
          media_type?: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
          display_order?: number;
          is_active?: boolean;
          title?: string;
          description?: string;
          link_url?: string;
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
          payment_method?: string;
          payment_intent_id?: string;
          booking_status: 'confirmed' | 'cancelled' | 'pending';
          special_requests?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          booking_number?: string;
          quantity: number;
          total_amount: number;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string;
          payment_intent_id?: string;
          booking_status?: 'confirmed' | 'cancelled' | 'pending';
          special_requests?: string;
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
          payment_method?: string;
          payment_intent_id?: string;
          booking_status?: 'confirmed' | 'cancelled' | 'pending';
          special_requests?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      google_drive_tokens: {
        Row: {
          id: string;
          user_id: string;
          access_token: string;
          refresh_token?: string;
          expires_at: string;
          scope: string;
          token_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          access_token: string;
          refresh_token?: string;
          expires_at: string;
          scope: string;
          token_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          access_token?: string;
          refresh_token?: string;
          expires_at?: string;
          scope?: string;
          token_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      google_drive_folders: {
        Row: {
          id: string;
          folder_id: string;
          folder_name: string;
          parent_folder_id?: string;
          folder_type: 'root' | 'events' | 'event' | 'photos' | 'videos' | 'archives';
          event_id?: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          folder_id: string;
          folder_name: string;
          parent_folder_id?: string;
          folder_type: 'root' | 'events' | 'event' | 'photos' | 'videos' | 'archives';
          event_id?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          folder_id?: string;
          folder_name?: string;
          parent_folder_id?: string;
          folder_type?: 'root' | 'events' | 'event' | 'photos' | 'videos' | 'archives';
          event_id?: string;
          created_by?: string;
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
          is_read: boolean;
          action_url?: string;
          metadata?: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          action_url?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          is_read?: boolean;
          action_url?: string;
          metadata?: Record<string, any>;
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
      event_status: 'draft' | 'published' | 'cancelled' | 'completed';
      user_role: 'admin' | 'organizer' | 'member';
      user_status: 'pending' | 'approved' | 'rejected' | 'suspended';
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
      booking_status: 'confirmed' | 'cancelled' | 'pending';
      file_type: 'image' | 'video' | 'document' | 'other';
      media_type: 'background_video' | 'hero_image' | 'gallery_image' | 'banner';
      notification_type: 'info' | 'success' | 'warning' | 'error';
      folder_type: 'root' | 'events' | 'event' | 'photos' | 'videos' | 'archives';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier use
export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type MediaFile = Database['public']['Tables']['media_files']['Row'];
export type MediaFileInsert = Database['public']['Tables']['media_files']['Insert'];
export type MediaFileUpdate = Database['public']['Tables']['media_files']['Update'];

export type EventMedia = Database['public']['Tables']['event_media']['Row'];
export type EventMediaInsert = Database['public']['Tables']['event_media']['Insert'];
export type EventMediaUpdate = Database['public']['Tables']['event_media']['Update'];

export type HomepageMedia = Database['public']['Tables']['homepage_media']['Row'];
export type HomepageMediaInsert = Database['public']['Tables']['homepage_media']['Insert'];
export type HomepageMediaUpdate = Database['public']['Tables']['homepage_media']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type GoogleDriveToken = Database['public']['Tables']['google_drive_tokens']['Row'];
export type GoogleDriveTokenInsert = Database['public']['Tables']['google_drive_tokens']['Insert'];
export type GoogleDriveTokenUpdate = Database['public']['Tables']['google_drive_tokens']['Update'];

export type GoogleDriveFolder = Database['public']['Tables']['google_drive_folders']['Row'];
export type GoogleDriveFolderInsert = Database['public']['Tables']['google_drive_folders']['Insert'];
export type GoogleDriveFolderUpdate = Database['public']['Tables']['google_drive_folders']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

// Enums for type safety
export type EventStatus = Database['public']['Enums']['event_status'];
export type UserRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type BookingStatus = Database['public']['Enums']['booking_status'];
export type FileType = Database['public']['Enums']['file_type'];
export type MediaType = Database['public']['Enums']['media_type'];
export type NotificationType = Database['public']['Enums']['notification_type'];
export type FolderType = Database['public']['Enums']['folder_type'];

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

export interface UserWithProfile extends User {
  total_bookings?: number;
  total_spent?: number;
  last_booking_date?: string;
}

export interface MediaFileWithEvent extends MediaFile {
  events?: (EventMedia & {
    event: Event;
  })[];
}

export interface BookingWithDetails extends Booking {
  event?: Event;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Query filters
export interface EventFilters {
  status?: EventStatus;
  category?: string;
  date_from?: string;
  date_to?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  featured?: boolean;
  search?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  created_from?: string;
  created_to?: string;
  search?: string;
}

export interface MediaFilters {
  file_type?: FileType;
  is_public?: boolean;
  is_archived?: boolean;
  uploaded_from?: string;
  uploaded_to?: string;
  search?: string;
}

export interface BookingFilters {
  event_id?: string;
  user_id?: string;
  payment_status?: PaymentStatus;
  booking_status?: BookingStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}
