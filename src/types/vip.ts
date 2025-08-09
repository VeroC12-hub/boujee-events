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
}

export interface VIPAnalytics {
  eventId: string;
  totalVIPRevenue: number;
  totalVIPBookings: number;
  averageVIPSpend: number;
  conversionRate: number;
  tierPerformance: {
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
  };
  isActive: boolean;
}

// Default VIP tiers configuration
export const DEFAULT_VIP_TIERS: Omit<VIPTier, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'VIP Silver',
    description: 'Premium experience with exclusive perks',
    price: 299,
    maxCapacity: 50,
    benefits: [
      'Priority entry',
      'Complimentary welcome drink',
      'Access to VIP lounge',
      'Reserved seating area',
      'Dedicated staff assistance'
    ],
    priority: 1,
    color: '#C0C0C0',
    icon: '🥈',
    isActive: true
  },
  {
    name: 'VIP Gold',
    description: 'Luxury experience with premium amenities',
    price: 499,
    maxCapacity: 30,
    benefits: [
      'All Silver benefits',
      'Premium bar package',
      'Gourmet dining options',
      'Private networking area',
      'Event photography session',
      'Personalized concierge'
    ],
    priority: 2,
    color: '#FFD700',
    icon: '🥇',
    isActive: true
  },
  {
    name: 'VIP Platinum',
    description: 'Ultra-luxury experience with exclusive access',
    price: 899,
    maxCapacity: 15,
    benefits: [
      'All Gold benefits',
      'Private transportation',
      'Celebrity meet & greet',
      'Exclusive backstage access',
      'Premium gift package',
      'Post-event private party',
      '24/7 personal assistant'
    ],
    priority: 3,
    color: '#E5E4E2',
    icon: '💎',
    isActive: true
  }
];

// Service categories for VIP packages
export const VIP_SERVICE_CATEGORIES = [
  'dining',
  'transportation',
  'accommodation',
  'entertainment',
  'concierge',
  'other'
] as const;

export type VIPServiceCategory = typeof VIP_SERVICE_CATEGORIES[number];

// VIP booking statuses
export const VIP_BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed'
] as const;

export type VIPBookingStatus = typeof VIP_BOOKING_STATUSES[number];

// VIP membership tiers
export const VIP_MEMBERSHIP_TIERS = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond'
] as const;

export type VIPMembershipTier = typeof VIP_MEMBERSHIP_TIERS[number];

// Utility functions
export const getVIPTierColor = (tierName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Bronze': '#CD7F32',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Platinum': '#E5E4E2',
    'Diamond': '#B9F2FF'
  };
  return colorMap[tierName] || '#666666';
};

export const getVIPTierIcon = (tierName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Bronze': '🥉',
    'Silver': '🥈',
    'Gold': '🥇',
    'Platinum': '💍',
    'Diamond': '💎'
  };
  return iconMap[tierName] || '⭐';
};

export const calculateVIPDiscount = (membershipTier: VIPMembershipTier): number => {
  const discountMap: { [key in VIPMembershipTier]: number } = {
    'Bronze': 0.05, // 5%
    'Silver': 0.10, // 10%
    'Gold': 0.15,   // 15%
    'Platinum': 0.20, // 20%
    'Diamond': 0.25   // 25%
  };
  return discountMap[membershipTier];
};

export const getVIPPrivileges = (membershipTier: VIPMembershipTier): string[] => {
  const privilegesMap: { [key in VIPMembershipTier]: string[] } = {
    'Bronze': [
      'Early event notifications',
      'Basic customer support'
    ],
    'Silver': [
      'Priority booking',
      'Enhanced customer support',
      '5% discount on all events'
    ],
    'Gold': [
      'VIP entry at events',
      'Premium customer support',
      '10% discount on all events',
      'Exclusive event invitations'
    ],
    'Platinum': [
      'Backstage access',
      'Dedicated account manager',
      '15% discount on all events',
      'Complimentary upgrades',
      'Annual VIP gift package'
    ],
    'Diamond': [
      'Private event access',
      '24/7 concierge service',
      '20% discount on all events',
      'Personal event planning',
      'Exclusive networking events',
      'Lifetime membership benefits'
    ]
  };
  return privilegesMap[membershipTier];
};
