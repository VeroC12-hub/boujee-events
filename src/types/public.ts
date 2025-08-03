// Public website specific types
export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  image: string;
  category: string;
  price: number;
  attendees: number;
  maxAttendees: number;
  status: 'published' | 'completed';
  isPublished: boolean;
  isFeatured: boolean;
  vipPackages?: PublicVIPPackage[];
}

export interface PublicVIPPackage {
  id: string;
  eventId: string;
  name: string;
  price: number;
  description: string;
  perks: string[];
  available: number;
  total: number;
  tier: 'silver' | 'gold' | 'platinum';
}

export interface PublicVIPBooking {
  id: string;
  eventId: string;
  packageId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  specialRequests?: string;
}

export interface PublicEventFilters {
  category?: string;
  location?: string;
  priceRange?: 'all' | 'under-100' | '100-500' | '500-1000' | 'over-1000';
  dateRange?: 'all' | 'today' | 'this-week' | 'this-month' | 'this-year';
  search?: string;
}

export interface PublicApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}