import { 
  VIPTier, 
  VIPReservation, 
  CreateVIPReservationRequest, 
  VIPPackage,
  VIPPerk 
} from '../types/vip';
import { ApiResponse } from '../types/api';

// Mock VIP data
let mockVIPTiers: VIPTier[] = [
  {
    id: 'vip-platinum',
    name: 'Platinum VIP',
    description: 'Ultimate luxury experience with exclusive access and premium services',
    price: 500,
    maxReservations: 20,
    currentReservations: 8,
    perks: [
      'Private entrance & exit',
      'Dedicated VIP lounge access',
      'Premium open bar',
      'Gourmet dinner service',
      'Personal concierge',
      'VIP parking',
      'Meet & greet with performers',
      'Exclusive merchandise package'
    ],
    color: 'platinum',
    icon: '👑',
    priority: 1
  },
  {
    id: 'vip-gold',
    name: 'Gold VIP',
    description: 'Premium experience with enhanced amenities and priority access',
    price: 300,
    maxReservations: 50,
    currentReservations: 23,
    perks: [
      'VIP entrance',
      'VIP seating area',
      'Complimentary drinks',
      'Premium appetizers',
      'Priority customer service',
      'Reserved parking',
      'VIP restroom access'
    ],
    color: 'gold',
    icon: '⭐',
    priority: 2
  },
  {
    id: 'vip-silver',
    name: 'Silver VIP',
    description: 'Enhanced experience with special perks and priority treatment',
    price: 150,
    maxReservations: 100,
    currentReservations: 67,
    perks: [
      'Priority entrance',
      'Reserved seating',
      'Welcome drink',
      'Event program',
      'Fast-track registration',
      'VIP customer support'
    ],
    color: 'silver',
    icon: '🎖️',
    priority: 3
  }
];

let mockVIPReservations: VIPReservation[] = [
  {
    id: 'vip-res-001',
    eventId: '1',
    eventTitle: 'Tech Conference 2025',
    userId: '1',
    userName: 'VeroC12-hub',
    userEmail: 'veroc12@example.com',
    tierName: 'Platinum VIP',
    tierId: 'vip-platinum',
    reservationDate: '2025-08-15',
    status: 'confirmed',
    totalAmount: 1000,
    specialRequests: 'Dietary restrictions: Vegetarian meals please',
    guestCount: 2,
    perks: mockVIPTiers[0].perks,
    paymentStatus: 'paid',
    createdAt: '2025-08-03T04:51:57Z',
    updatedAt: '2025-08-03T04:51:57Z'
  },
  {
    id: 'vip-res-002',
    eventId: '2',
    eventTitle: 'Summer Music Festival',
    userId: '2',
    userName: 'John Smith',
    userEmail: 'john.smith@example.com',
    tierName: 'Gold VIP',
    tierId: 'vip-gold',
    reservationDate: '2025-08-20',
    status: 'pending',
    totalAmount: 600,
    guestCount: 2,
    perks: mockVIPTiers[1].perks,
    paymentStatus: 'pending',
    createdAt: '2025-08-02T14:30:00Z',
    updatedAt: '2025-08-02T14:30:00Z'
  }
];

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

class VIPService {
  private async apiResponse<T>(data: T, success: boolean = true, message?: string): Promise<ApiResponse<T>> {
    await delay();
    return {
      success,
      data: success ? data : undefined,
      message,
      error: success ? undefined : message,
      timestamp: new Date().toISOString()
    };
  }

  // VIP Tiers Management
  async getVIPTiers(): Promise<ApiResponse<VIPTier[]>> {
    return this.apiResponse(mockVIPTiers);
  }

  async getVIPTierById(id: string): Promise<ApiResponse<VIPTier>> {
    const tier = mockVIPTiers.find(t => t.id === id);
    if (!tier) {
      return this.apiResponse(null as any, false, 'VIP tier not found');
    }
    return this.apiResponse(tier);
  }

  async updateVIPTier(id: string, updates: Partial<VIPTier>): Promise<ApiResponse<VIPTier>> {
    const tierIndex = mockVIPTiers.findIndex(t => t.id === id);
    if (tierIndex === -1) {
      return this.apiResponse(null as any, false, 'VIP tier not found');
    }

    mockVIPTiers[tierIndex] = { ...mockVIPTiers[tierIndex], ...updates };
    return this.apiResponse(mockVIPTiers[tierIndex], true, 'VIP tier updated successfully');
  }

  // VIP Reservations Management
  async getVIPReservations(eventId?: string): Promise<ApiResponse<VIPReservation[]>> {
    let reservations = mockVIPReservations;
    if (eventId) {
      reservations = reservations.filter(r => r.eventId === eventId);
    }
    return this.apiResponse(reservations);
  }

  async getVIPReservationById(id: string): Promise<ApiResponse<VIPReservation>> {
    const reservation = mockVIPReservations.find(r => r.id === id);
    if (!reservation) {
      return this.apiResponse(null as any, false, 'VIP reservation not found');
    }
    return this.apiResponse(reservation);
  }

  async createVIPReservation(reservationData: CreateVIPReservationRequest): Promise<ApiResponse<VIPReservation>> {
    const tier = mockVIPTiers.find(t => t.id === reservationData.tierId);
    if (!tier) {
      return this.apiResponse(null as any, false, 'VIP tier not found');
    }

    if (tier.currentReservations >= tier.maxReservations) {
      return this.apiResponse(null as any, false, 'VIP tier is fully booked');
    }

    const newReservation: VIPReservation = {
      id: `vip-res-${Date.now()}`,
      eventId: reservationData.eventId,
      eventTitle: 'Event Title', // This would come from event service
      userId: 'current-user-id',
      userName: reservationData.contactInfo.name,
      userEmail: reservationData.contactInfo.email,
      tierName: tier.name,
      tierId: tier.id,
      reservationDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      totalAmount: tier.price * reservationData.guestCount,
      specialRequests: reservationData.specialRequests,
      guestCount: reservationData.guestCount,
      perks: tier.perks,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockVIPReservations.push(newReservation);
    
    // Update tier availability
    tier.currentReservations += 1;

    return this.apiResponse(newReservation, true, 'VIP reservation created successfully');
  }

  async updateVIPReservation(id: string, updates: Partial<VIPReservation>): Promise<ApiResponse<VIPReservation>> {
    const reservationIndex = mockVIPReservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return this.apiResponse(null as any, false, 'VIP reservation not found');
    }

    mockVIPReservations[reservationIndex] = { 
      ...mockVIPReservations[reservationIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.apiResponse(mockVIPReservations[reservationIndex], true, 'VIP reservation updated successfully');
  }

  async cancelVIPReservation(id: string): Promise<ApiResponse<null>> {
    const reservationIndex = mockVIPReservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return this.apiResponse(null, false, 'VIP reservation not found');
    }

    const reservation = mockVIPReservations[reservationIndex];
    
    // Update reservation status
    mockVIPReservations[reservationIndex] = {
      ...reservation,
      status: 'cancelled',
      paymentStatus: 'refunded',
      updatedAt: new Date().toISOString()
    };

    // Update tier availability
    const tier = mockVIPTiers.find(t => t.id === reservation.tierId);
    if (tier) {
      tier.currentReservations = Math.max(0, tier.currentReservations - 1);
    }

    return this.apiResponse(null, true, 'VIP reservation cancelled successfully');
  }

  // VIP Analytics
  async getVIPAnalytics(eventId?: string): Promise<ApiResponse<any>> {
    let reservations = mockVIPReservations;
    if (eventId) {
      reservations = reservations.filter(r => r.eventId === eventId);
    }

    const analytics = {
      totalReservations: reservations.length,
      totalRevenue: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
      avgReservationValue: reservations.length > 0 
        ? reservations.reduce((sum, r) => sum + r.totalAmount, 0) / reservations.length 
        : 0,
      statusBreakdown: {
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        completed: reservations.filter(r => r.status === 'completed').length
      },
      tierBreakdown: mockVIPTiers.map(tier => ({
        tierName: tier.name,
        reservations: reservations.filter(r => r.tierId === tier.id).length,
        revenue: reservations
          .filter(r => r.tierId === tier.id)
          .reduce((sum, r) => sum + r.totalAmount, 0),
        availability: tier.maxReservations - tier.currentReservations
      })),
      paymentStatus: {
        paid: reservations.filter(r => r.paymentStatus === 'paid').length,
        pending: reservations.filter(r => r.paymentStatus === 'pending').length,
        refunded: reservations.filter(r => r.paymentStatus === 'refunded').length
      }
    };

    return this.apiResponse(analytics);
  }
}

export const vipService = new VIPService();
export default vipService;
