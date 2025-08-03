// VIP Reservation Types
export interface VIPTier {
  id: string;
  name: string;
  description: string;
  price: number;
  maxReservations: number;
  currentReservations: number;
  perks: string[];
  color: string;
  icon: string;
  priority: number;
}

export interface VIPReservation {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  tierName: string;
  tierId: string;
  reservationDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  specialRequests?: string;
  guestCount: number;
  checkInTime?: string;
  perks: string[];
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface CreateVIPReservationRequest {
  eventId: string;
  tierId: string;
  guestCount: number;
  specialRequests?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface VIPPackage {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  availability: number;
  sold: number;
  perks: VIPPerk[];
  inclusions: string[];
  restrictions: string[];
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  priority: number;
}

export interface VIPPerk {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'access' | 'dining' | 'service' | 'exclusive' | 'comfort';
}
