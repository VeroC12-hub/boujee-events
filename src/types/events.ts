// src/types/events.ts
export interface Event {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  event_date: string;
  event_time: string;
  end_date?: string;
  end_time?: string;
  timezone: string;
  location: string;
  venue: string;
  address?: string;
  city?: string;
  country: string;
  capacity: number;
  max_attendees: number;
  current_attendees: number;
  booked: number;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  status?: 'active' | 'draft' | 'ended' | 'cancelled';
  featured: boolean;
  is_private: boolean;
  requires_approval: boolean;
  image_url?: string;
  banner_url?: string;
  gallery_images: string[];
  organizer_id: string;
  co_organizers: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  metadata: Record<string, any>;
}

export interface CreateEventData {
  title: string;
  description: string;
  short_description?: string;
  event_date: string;
  event_time: string;
  end_date?: string;
  end_time?: string;
  timezone?: string;
  location: string;
  venue: string;
  address?: string;
  city?: string;
  country?: string;
  capacity: number;
  max_attendees: number;
  price: number;
  currency?: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  is_private?: boolean;
  requires_approval?: boolean;
  image_url?: string;
  banner_url?: string;
  gallery_images?: string[];
  co_organizers?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  status?: Event['status'];
  published_at?: string;
}

// Event Categories for luxury events
export const EVENT_CATEGORIES = [
  'Wine & Dining',
  'Cultural & Arts',
  'Exclusive Sports',
  'Private Parties',
  'Luxury Travel',
  'Business & Networking',
  'Fashion & Lifestyle',
  'Wellness & Spa',
  'Charity & Gala',
  'VIP Experience'
] as const;

// Event Status with colors and labels
export const EVENT_STATUS = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-500',
    description: 'Event being created'
  },
  published: {
    label: 'Published',
    color: 'bg-green-500',
    description: 'Live and bookable'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500',
    description: 'Event cancelled'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-500',
    description: 'Event finished'
  }
} as const;

// Common event tags
export const SUGGESTED_TAGS = [
  'Exclusive', 'VIP', 'Limited', 'Premium', 'Luxury',
  'Networking', 'Social', 'Corporate', 'Private',
  'International', 'Charity', 'Formal', 'Casual',
  'Indoor', 'Outdoor', 'Virtual', 'Hybrid'
];

// Default timezones
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
];

// Form validation schemas
export const eventFormSchema = {
  title: {
    required: 'Event title is required',
    minLength: { value: 3, message: 'Title must be at least 3 characters' },
    maxLength: { value: 100, message: 'Title must be less than 100 characters' }
  },
  description: {
    required: 'Event description is required',
    minLength: { value: 10, message: 'Description must be at least 10 characters' }
  },
  event_date: {
    required: 'Event date is required'
  },
  event_time: {
    required: 'Event time is required'
  },
  location: {
    required: 'Event location is required'
  },
  venue: {
    required: 'Venue name is required'
  },
  capacity: {
    required: 'Event capacity is required',
    min: { value: 1, message: 'Capacity must be at least 1' },
    max: { value: 10000, message: 'Capacity cannot exceed 10,000' }
  },
  max_attendees: {
    required: 'Maximum attendees is required',
    min: { value: 1, message: 'Must allow at least 1 attendee' }
  },
  price: {
    required: 'Event price is required',
    min: { value: 0, message: 'Price cannot be negative' }
  },
  category: {
    required: 'Event category is required'
  }
};
