// Unified Ticketing System Types
export interface TicketType {
  id: string;
  name: string;
  description: string;
  category: 'regular' | 'vip';
  price: number;
  maxQuantity: number;
  currentSold: number;
  isActive: boolean;
  benefits: string[];
  restrictions?: string[];
  color: string;
  icon: string;
  priority: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  groupDiscounts?: GroupDiscount[];
}

export interface GroupDiscount {
  minQuantity: number;
  discountPercent: number;
  description: string;
}

export interface EventTicketConfiguration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketingEnabled: boolean;
  regularTickets: TicketType[];
  vipPackages: TicketType[];
  salesStartDate: string;
  salesEndDate: string;
  maxTicketsPerOrder: number;
  refundPolicy: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketReservation {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  tickets: TicketItem[];
  totalAmount: number;
  totalQuantity: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'checked_in';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  specialRequests?: string;
  reservationCode: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
}

export interface TicketItem {
  ticketTypeId: string;
  ticketTypeName: string;
  category: 'regular' | 'vip';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  benefits: string[];
  guestNames?: string[]; // For VIP packages where guest names are required
}

export interface CreateTicketReservationRequest {
  eventId: string;
  tickets: {
    ticketTypeId: string;
    quantity: number;
    guestNames?: string[]; // Required for VIP packages
  }[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
}

export interface UpdateEventTicketsRequest {
  regularTickets: Omit<TicketType, 'id' | 'currentSold'>[];
  vipPackages: Omit<TicketType, 'id' | 'currentSold'>[];
  salesStartDate: string;
  salesEndDate: string;
  maxTicketsPerOrder: number;
  refundPolicy: string;
  terms: string;
}
