import { 
  TicketType, 
  EventTicketConfiguration, 
  TicketReservation, 
  CreateTicketReservationRequest,
  UpdateEventTicketsRequest,
  TicketItem
} from '../types/ticketing';
import { ApiResponse } from '../types/api';

// Mock event ticket configurations
let eventTicketConfigs: EventTicketConfiguration[] = [
  {
    id: 'ticket-config-1',
    eventId: '1',
    eventTitle: 'Tech Conference 2025',
    eventDate: '2025-08-15',
    eventLocation: 'San Francisco Convention Center',
    ticketingEnabled: true,
    regularTickets: [
      {
        id: 'regular-early',
        name: 'Early Bird',
        description: 'Limited time special pricing for early registrants',
        category: 'regular',
        price: 99,
        maxQuantity: 100,
        currentSold: 45,
        isActive: true,
        benefits: ['Conference access', 'Welcome kit', 'Lunch included', 'Networking sessions'],
        color: 'blue',
        icon: '🐦',
        priority: 1,
        earlyBirdDeadline: '2025-08-10'
      },
      {
        id: 'regular-standard',
        name: 'Standard',
        description: 'Regular conference access with all standard benefits',
        category: 'regular',
        price: 149,
        maxQuantity: 300,
        currentSold: 89,
        isActive: true,
        benefits: ['Conference access', 'Welcome kit', 'Lunch included', 'Networking sessions'],
        color: 'gray',
        icon: '🎫',
        priority: 2
      },
      {
        id: 'regular-student',
        name: 'Student',
        description: 'Special pricing for students with valid ID',
        category: 'regular',
        price: 75,
        maxQuantity: 50,
        currentSold: 23,
        isActive: true,
        benefits: ['Conference access', 'Welcome kit', 'Lunch included'],
        restrictions: ['Valid student ID required', 'Limited sessions'],
        color: 'green',
        icon: '🎓',
        priority: 3
      }
    ],
    vipPackages: [
      {
        id: 'vip-platinum',
        name: 'Platinum VIP Experience',
        description: 'Ultimate luxury conference experience with exclusive access',
        category: 'vip',
        price: 750,
        maxQuantity: 15,
        currentSold: 8,
        isActive: true,
        benefits: [
          'All standard conference access',
          'Private networking dinner with speakers',
          'VIP lounge with premium refreshments',
          'Priority Q&A sessions',
          'Exclusive tech demos',
          'Premium swag bag worth $200',
          'Personal concierge service',
          'VIP parking'
        ],
        color: 'platinum',
        icon: '👑',
        priority: 1,
        groupDiscounts: [
          { minQuantity: 3, discountPercent: 10, description: '10% off for 3+ tickets' },
          { minQuantity: 5, discountPercent: 15, description: '15% off for 5+ tickets' }
        ]
      },
      {
        id: 'vip-gold',
        name: 'Gold VIP Experience',
        description: 'Premium conference experience with enhanced amenities',
        category: 'vip',
        price: 450,
        maxQuantity: 30,
        currentSold: 18,
        isActive: true,
        benefits: [
          'All standard conference access',
          'VIP seating area',
          'Complimentary drinks and appetizers',
          'Priority customer service',
          'Reserved parking',
          'VIP restroom access',
          'Premium networking hour'
        ],
        color: 'gold',
        icon: '⭐',
        priority: 2,
        earlyBirdPrice: 400,
        earlyBirdDeadline: '2025-08-10'
      },
      {
        id: 'vip-silver',
        name: 'Silver VIP Experience',
        description: 'Enhanced conference experience with special perks',
        category: 'vip',
        price: 250,
        maxQuantity: 50,
        currentSold: 32,
        isActive: true,
        benefits: [
          'All standard conference access',
          'Priority entrance',
          'Reserved seating section',
          'Welcome drink',
          'Event program and materials',
          'Fast-track registration',
          'VIP customer support'
        ],
        color: 'silver',
        icon: '🎖️',
        priority: 3
      }
    ],
    salesStartDate: '2025-08-01T00:00:00Z',
    salesEndDate: '2025-08-14T23:59:59Z',
    maxTicketsPerOrder: 10,
    refundPolicy: 'Full refund available until 7 days before event',
    terms: 'By purchasing tickets, you agree to our terms and conditions',
    createdAt: '2025-08-03T05:19:31Z',
    updatedAt: '2025-08-03T05:19:31Z'
  }
];

let ticketReservations: TicketReservation[] = [
  {
    id: 'reservation-001',
    eventId: '1',
    eventTitle: 'Tech Conference 2025',
    userId: '1',
    userName: 'VeroC12-hub',
    userEmail: 'veroc12@example.com',
    userPhone: '+1-555-0123',
    tickets: [
      {
        ticketTypeId: 'vip-platinum',
        ticketTypeName: 'Platinum VIP Experience',
        category: 'vip',
        quantity: 2,
        unitPrice: 750,
        totalPrice: 1500,
        benefits: [
          'All standard conference access',
          'Private networking dinner with speakers',
          'VIP lounge with premium refreshments',
          'Priority Q&A sessions',
          'Exclusive tech demos',
          'Premium swag bag worth $200',
          'Personal concierge service',
          'VIP parking'
        ],
        guestNames: ['VeroC12-hub', 'Guest Name']
      }
    ],
    totalAmount: 1500,
    totalQuantity: 2,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    reservationCode: 'TC2025-VIP-001',
    createdAt: '2025-08-03T05:19:31Z',
    updatedAt: '2025-08-03T05:19:31Z'
  }
];

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

class TicketingService {
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

  private generateReservationCode(eventTitle: string, isVIP: boolean): string {
    const prefix = eventTitle.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
    const vipSuffix = isVIP ? '-VIP' : '';
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}${vipSuffix}-${random}`;
  }

  // Get event ticket configuration
  async getEventTickets(eventId: string): Promise<ApiResponse<EventTicketConfiguration>> {
    const config = eventTicketConfigs.find(c => c.eventId === eventId);
    if (!config) {
      return this.apiResponse(null as any, false, 'Ticket configuration not found for this event');
    }
    return this.apiResponse(config);
  }

  // Create/Update event ticket configuration
  async updateEventTickets(eventId: string, updates: UpdateEventTicketsRequest): Promise<ApiResponse<EventTicketConfiguration>> {
    const configIndex = eventTicketConfigs.findIndex(c => c.eventId === eventId);
    
    if (configIndex === -1) {
      // Create new configuration
      const newConfig: EventTicketConfiguration = {
        id: `ticket-config-${Date.now()}`,
        eventId,
        eventTitle: 'Event Title', // This would come from event service
        eventDate: '2025-08-15',
        eventLocation: 'Event Location',
        ticketingEnabled: true,
        regularTickets: updates.regularTickets.map((ticket, index) => ({
          ...ticket,
          id: `regular-${Date.now()}-${index}`,
          currentSold: 0
        })),
        vipPackages: updates.vipPackages.map((ticket, index) => ({
          ...ticket,
          id: `vip-${Date.now()}-${index}`,
          currentSold: 0
        })),
        salesStartDate: updates.salesStartDate,
        salesEndDate: updates.salesEndDate,
        maxTicketsPerOrder: updates.maxTicketsPerOrder,
        refundPolicy: updates.refundPolicy,
        terms: updates.terms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      eventTicketConfigs.push(newConfig);
      return this.apiResponse(newConfig, true, 'Event tickets configured successfully');
    } else {
      // Update existing configuration
      const updatedConfig = {
        ...eventTicketConfigs[configIndex],
        regularTickets: updates.regularTickets.map((ticket, index) => ({
          ...ticket,
          id: eventTicketConfigs[configIndex].regularTickets[index]?.id || `regular-${Date.now()}-${index}`,
          currentSold: eventTicketConfigs[configIndex].regularTickets[index]?.currentSold || 0
        })),
        vipPackages: updates.vipPackages.map((ticket, index) => ({
          ...ticket,
          id: eventTicketConfigs[configIndex].vipPackages[index]?.id || `vip-${Date.now()}-${index}`,
          currentSold: eventTicketConfigs[configIndex].vipPackages[index]?.currentSold || 0
        })),
        salesStartDate: updates.salesStartDate,
        salesEndDate: updates.salesEndDate,
        maxTicketsPerOrder: updates.maxTicketsPerOrder,
        refundPolicy: updates.refundPolicy,
        terms: updates.terms,
        updatedAt: new Date().toISOString()
      };
      
      eventTicketConfigs[configIndex] = updatedConfig;
      return this.apiResponse(updatedConfig, true, 'Event tickets updated successfully');
    }
  }

  // Create ticket reservation
  async createReservation(reservationData: CreateTicketReservationRequest): Promise<ApiResponse<TicketReservation>> {
    const config = eventTicketConfigs.find(c => c.eventId === reservationData.eventId);
    if (!config || !config.ticketingEnabled) {
      return this.apiResponse(null as any, false, 'Ticketing not available for this event');
    }

    // Check sales period
    const now = new Date();
    const salesStart = new Date(config.salesStartDate);
    const salesEnd = new Date(config.salesEndDate);
    
    if (now < salesStart) {
      return this.apiResponse(null as any, false, 'Ticket sales have not started yet');
    }
    
    if (now > salesEnd) {
      return this.apiResponse(null as any, false, 'Ticket sales have ended');
    }

    // Validate and process tickets
    const ticketItems: TicketItem[] = [];
    let totalAmount = 0;
    let totalQuantity = 0;
    let hasVIP = false;

    for (const ticketRequest of reservationData.tickets) {
      // Find ticket type
      const allTickets = [...config.regularTickets, ...config.vipPackages];
      const ticketType = allTickets.find(t => t.id === ticketRequest.ticketTypeId);
      
      if (!ticketType || !ticketType.isActive) {
        return this.apiResponse(null as any, false, `Ticket type not available: ${ticketRequest.ticketTypeId}`);
      }

      // Check availability
      if (ticketType.currentSold + ticketRequest.quantity > ticketType.maxQuantity) {
        return this.apiResponse(null as any, false, `Not enough tickets available for ${ticketType.name}`);
      }

      // Check guest names for VIP packages
      if (ticketType.category === 'vip' && (!ticketRequest.guestNames || ticketRequest.guestNames.length !== ticketRequest.quantity)) {
        return this.apiResponse(null as any, false, `Guest names required for all VIP tickets: ${ticketType.name}`);
      }

      // Calculate pricing (check for early bird and group discounts)
      let unitPrice = ticketType.price;
      
      // Early bird pricing
      if (ticketType.earlyBirdPrice && ticketType.earlyBirdDeadline) {
        const deadline = new Date(ticketType.earlyBirdDeadline);
        if (now <= deadline) {
          unitPrice = ticketType.earlyBirdPrice;
        }
      }

      // Group discounts for VIP
      if (ticketType.category === 'vip' && ticketType.groupDiscounts) {
        const applicableDiscount = ticketType.groupDiscounts
          .filter(d => ticketRequest.quantity >= d.minQuantity)
          .sort((a, b) => b.discountPercent - a.discountPercent)[0];
        
        if (applicableDiscount) {
          unitPrice = unitPrice * (1 - applicableDiscount.discountPercent / 100);
        }
      }

      const ticketItem: TicketItem = {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        category: ticketType.category,
        quantity: ticketRequest.quantity,
        unitPrice: Math.round(unitPrice * 100) / 100, // Round to 2 decimals
        totalPrice: Math.round(unitPrice * ticketRequest.quantity * 100) / 100,
        benefits: ticketType.benefits,
        guestNames: ticketRequest.guestNames
      };

      ticketItems.push(ticketItem);
      totalAmount += ticketItem.totalPrice;
      totalQuantity += ticketRequest.quantity;
      
      if (ticketType.category === 'vip') {
        hasVIP = true;
      }

      // Update sold count
      ticketType.currentSold += ticketRequest.quantity;
    }

    // Check total quantity limit
    if (totalQuantity > config.maxTicketsPerOrder) {
      return this.apiResponse(null as any, false, `Maximum ${config.maxTicketsPerOrder} tickets per order`);
    }

    // Create reservation
    const newReservation: TicketReservation = {
      id: `reservation-${Date.now()}`,
      eventId: reservationData.eventId,
      eventTitle: config.eventTitle,
      userId: 'current-user-id',
      userName: reservationData.contactInfo.name,
      userEmail: reservationData.contactInfo.email,
      userPhone: reservationData.contactInfo.phone,
      tickets: ticketItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalQuantity,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: reservationData.specialRequests,
      reservationCode: this.generateReservationCode(config.eventTitle, hasVIP),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ticketReservations.push(newReservation);
    
    return this.apiResponse(newReservation, true, 'Ticket reservation created successfully');
  }

  // Get reservations
  async getReservations(eventId?: string, userId?: string): Promise<ApiResponse<TicketReservation[]>> {
    let reservations = ticketReservations;
    
    if (eventId) {
      reservations = reservations.filter(r => r.eventId === eventId);
    }
    
    if (userId) {
      reservations = reservations.filter(r => r.userId === userId);
    }
    
    return this.apiResponse(reservations);
  }

  // Update reservation
  async updateReservation(id: string, updates: Partial<TicketReservation>): Promise<ApiResponse<TicketReservation>> {
    const reservationIndex = ticketReservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return this.apiResponse(null as any, false, 'Reservation not found');
    }

    ticketReservations[reservationIndex] = {
      ...ticketReservations[reservationIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.apiResponse(ticketReservations[reservationIndex], true, 'Reservation updated successfully');
  }

  // Cancel reservation
  async cancelReservation(id: string): Promise<ApiResponse<null>> {
    const reservationIndex = ticketReservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return this.apiResponse(null, false, 'Reservation not found');
    }

    const reservation = ticketReservations[reservationIndex];
    
    // Update reservation status
    ticketReservations[reservationIndex] = {
      ...reservation,
      status: 'cancelled',
      paymentStatus: 'refunded',
      updatedAt: new Date().toISOString()
    };

    // Update ticket availability
    const config = eventTicketConfigs.find(c => c.eventId === reservation.eventId);
    if (config) {
      reservation.tickets.forEach(ticket => {
        const allTickets = [...config.regularTickets, ...config.vipPackages];
        const ticketType = allTickets.find(t => t.id === ticket.ticketTypeId);
        if (ticketType) {
          ticketType.currentSold = Math.max(0, ticketType.currentSold - ticket.quantity);
        }
      });
    }

    return this.apiResponse(null, true, 'Reservation cancelled successfully');
  }

  // Ticketing analytics
  async getTicketingAnalytics(eventId?: string): Promise<ApiResponse<any>> {
    let reservations = ticketReservations;
    let configs = eventTicketConfigs;
    
    if (eventId) {
      reservations = reservations.filter(r => r.eventId === eventId);
      configs = configs.filter(c => c.eventId === eventId);
    }

    const analytics = {
      totalReservations: reservations.length,
      totalRevenue: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
      totalTicketsSold: reservations.reduce((sum, r) => sum + r.totalQuantity, 0),
      avgOrderValue: reservations.length > 0 
        ? reservations.reduce((sum, r) => sum + r.totalAmount, 0) / reservations.length 
        : 0,
      statusBreakdown: {
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        paid: reservations.filter(r => r.status === 'paid').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        checkedIn: reservations.filter(r => r.status === 'checked_in').length
      },
      paymentBreakdown: {
        pending: reservations.filter(r => r.paymentStatus === 'pending').length,
        paid: reservations.filter(r => r.paymentStatus === 'paid').length,
        failed: reservations.filter(r => r.paymentStatus === 'failed').length,
        refunded: reservations.filter(r => r.paymentStatus === 'refunded').length
      },
      ticketTypeBreakdown: configs.flatMap(config => {
        const allTickets = [...config.regularTickets, ...config.vipPackages];
        return allTickets.map(ticket => ({
          eventTitle: config.eventTitle,
          ticketTypeName: ticket.name,
          category: ticket.category,
          price: ticket.price,
          maxQuantity: ticket.maxQuantity,
          currentSold: ticket.currentSold,
          available: ticket.maxQuantity - ticket.currentSold,
          revenue: reservations
            .flatMap(r => r.tickets)
            .filter(t => t.ticketTypeId === ticket.id)
            .reduce((sum, t) => sum + t.totalPrice, 0)
        }));
      }),
      vipVsRegular: {
        vipReservations: reservations.filter(r => r.tickets.some(t => t.category === 'vip')).length,
        regularReservations: reservations.filter(r => r.tickets.every(t => t.category === 'regular')).length,
        vipRevenue: reservations
          .flatMap(r => r.tickets)
          .filter(t => t.category === 'vip')
          .reduce((sum, t) => sum + t.totalPrice, 0),
        regularRevenue: reservations
          .flatMap(r => r.tickets)
          .filter(t => t.category === 'regular')
          .reduce((sum, t) => sum + t.totalPrice, 0)
      }
    };

    return this.apiResponse(analytics);
  }
}

export const ticketingService = new TicketingService();
export default ticketingService;
