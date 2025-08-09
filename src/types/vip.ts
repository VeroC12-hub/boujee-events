// VIP Management Types
export interface VIPTier {
  id: string;
  name: string;
  description: string;
  price: number;
  maxCapacity: number;
  benefits: string[];
  priority: number;
  color: string;
  icon: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventVIPConfig {
  id: string;
  eventId: string;
  tierName: string;
  tierDescription?: string;
  price: number;
  maxCapacity: number;
  currentBookings: number;
  benefits: string[];
  priority: number;
  color: string;
  icon: string;
  isActive: boolean;
  earlyAccess: boolean;
  exclusiveContent: boolean;
  personalizedService: boolean;
  premiumLocation: boolean;
  giftPackage: boolean;
  tiers?: VIPTier[];
  created_at: string;
  updated_at: string;
}

export interface CreateEventVIPConfigRequest {
  eventId: string;
  tierName: string;
  tierDescription?: string;
  price: number;
  maxCapacity: number;
  benefits: string[];
  priority?: number;
  color?: string;
  icon?: string;
  isActive?: boolean;
  earlyAccess?: boolean;
  exclusiveContent?: boolean;
  personalizedService?: boolean;
  premiumLocation?: boolean;
  giftPackage?: boolean;
  tiers?: VIPTier[];
}

export interface UpdateEventVIPConfigRequest {
  tierName?: string;
  tierDescription?: string;
  price?: number;
  maxCapacity?: number;
  benefits?: string[];
  priority?: number;
  color?: string;
  icon?: string;
  isActive?: boolean;
  earlyAccess?: boolean;
  exclusiveContent?: boolean;
  personalizedService?: boolean;
  premiumLocation?: boolean;
  giftPackage?: boolean;
}

export interface VIPBooking {
  id: string;
  eventId: string;
  userId: string;
  vipConfigId: string;
  bookingNumber: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  specialRequests?: string;
  checkInTime?: string;
  checkOutTime?: string;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  vipConfig?: EventVIPConfig;
}

export interface VIPService {
  id: string;
  name: string;
  description: string;
  category: 'dining' | 'transportation' | 'accommodation' | 'entertainment' | 'concierge' | 'other';
  price?: number;
  isIncluded: boolean;
  isOptional: boolean;
  maxQuantity?: number;
  icon: string;
  image?: string;
  provider?: string;
  contactInfo?: string;
  isActive: boolean;
}

export interface VIPPackage {
  id: string;
  name: string;
  description: string;
  eventId: string;
  tierIds: string[];
  services: VIPService[];
  totalValue: number;
  discountedPrice: number;
  savings: number;
  isLimitedTime: boolean;
  validFrom: string;
  validUntil: string;
  maxBookings?: number;
  currentBookings: number;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface VIPReservation {
  id: string;
  eventId: string;
  vipConfigId: string;
  userId: string;
  reservationType: 'table' | 'seating' | 'area' | 'suite';
  reservationDetails: {
    location: string;
    capacity: number;
    amenities: string[];
    view?: string;
    accessibility?: boolean;
  };
  status: 'reserved' | 'occupied' | 'available' | 'maintenance';
  reservedAt: string;
  expiresAt?: string;
  specialInstructions?: string;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface CreateVIPReservationRequest {
  eventId: string;
  vipConfigId: string;
  userId: string;
  reservationType: 'table' | 'seating' | 'area' | 'suite';
  reservationDetails: {
    location: string;
    capacity: number;
    amenities: string[];
    view?: string;
    accessibility?: boolean;
  };
  specialInstructions?: string;
}

export interface VIPAnalytics {
  eventId: string;
  totalVIPRevenue: number;
  totalVIPBookings: number;
  averageVIPSpend: number;
  conversionRate: number;
  totalReservations: number;
  totalRevenue: number;
  avgReservationValue: number;
  statusBreakdown: {
    [status: string]: number;
  };
  tierBreakdown: {
    [tierId: string]: {
      bookings: number;
      revenue: number;
      occupancyRate: number;
      averageRating: number;
    };
  };
  topServices: {
    serviceId: string;
    serviceName: string;
    bookingCount: number;
    revenue: number;
  }[];
  customerSatisfaction: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      [rating: number]: number;
    };
  };
}

export interface VIPMember {
  id: string;
  userId: string;
  membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  memberSince: string;
  totalSpent: number;
  eventsAttended: number;
  loyaltyPoints: number;
  privileges: string[];
  personalHost?: string;
  preferences: {
    dietary?: string[];
    accessibility?: string[];
    communication?: 'email' | 'phone' | 'text';
    language?: string;
    notifications?: boolean;
  };
}

// Default VIP tiers
export const DEFAULT_VIP_TIERS: VIPTier[] = [
  {
    id: 'vip-gold',
    name: 'Gold VIP',
    description: 'Premium VIP experience with exclusive benefits',
    price: 500,
    maxCapacity: 50,
    benefits: ['Priority entry', 'Premium seating', 'Complimentary drinks', 'VIP lounge access'],
    priority: 1,
    color: 'gold',
    icon: '👑',
    isActive: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'vip-platinum',
    name: 'Platinum VIP',
    description: 'Ultra-premium VIP experience with all amenities',
    price: 1000,
    maxCapacity: 20,
    benefits: ['All Gold benefits', 'Personal concierge', 'Premium dining', 'Meet & greet', 'Exclusive merchandise'],
    priority: 2,
    color: 'platinum',
    icon: '💎',
    isActive: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export type VIPTierLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type ReservationStatus = 'reserved' | 'occupied' | 'available' | 'maintenance';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
