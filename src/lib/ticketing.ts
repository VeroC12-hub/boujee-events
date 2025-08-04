import QRCode from 'qrcode';
import { getDatabase } from './database';
import { emailService } from './email';

export interface Ticket {
  id: string;
  bookingId: string;
  userId: string;
  eventId: string;
  ticketNumber: string;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred';
  issuedAt: string;
  usedAt?: string;
  transferredTo?: string;
  metadata: Record<string, any>;
}

export interface BookingData {
  id: string;
  userId: string;
  eventId: string;
  ticketQuantity: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: 'confirmed' | 'cancelled' | 'checked_in';
  bookingReference: string;
  createdAt: string;
}

export interface TicketValidationResult {
  valid: boolean;
  ticket?: Ticket;
  event?: any;
  user?: any;
  error?: string;
}

class TicketingService {
  private db = getDatabase();

  // Generate unique booking reference
  generateBookingReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `BE-${timestamp}-${random}`;
  }

  // Generate QR code for ticket
  async generateQRCode(data: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Create booking with tickets
  async createBooking(
    userId: string,
    eventId: string,
    ticketQuantity: number,
    totalAmount: number,
    currency: string = 'USD',
    paymentMethod?: string,
    paymentId?: string
  ): Promise<{ booking: BookingData; tickets: Ticket[] }> {
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const bookingReference = this.generateBookingReference();
    
    // Get event details
    const event = this.db.prepare(`
      SELECT id, title, date, location, venue FROM events WHERE id = ?
    `).get(eventId) as any;
    
    if (!event) {
      throw new Error('Event not found');
    }

    // Check capacity
    const existingBookings = this.db.prepare(`
      SELECT SUM(ticket_quantity) as total FROM bookings 
      WHERE event_id = ? AND status != 'cancelled'
    `).get(eventId) as any;
    
    const eventCapacity = this.db.prepare('SELECT capacity FROM events WHERE id = ?').get(eventId) as any;
    const currentBookings = existingBookings.total || 0;
    
    if (currentBookings + ticketQuantity > eventCapacity.capacity) {
      throw new Error('Insufficient capacity for this booking');
    }

    // Create booking record
    this.db.prepare(`
      INSERT INTO bookings (id, user_id, event_id, ticket_quantity, total_amount, currency, payment_status, payment_method, payment_id, booking_reference, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookingId,
      userId,
      eventId,
      ticketQuantity,
      totalAmount,
      currency,
      paymentId ? 'completed' : 'pending',
      paymentMethod || null,
      paymentId || null,
      bookingReference,
      'confirmed'
    );

    // Generate tickets
    const tickets: Ticket[] = [];
    for (let i = 0; i < ticketQuantity; i++) {
      const ticket = await this.createTicket(bookingId, userId, eventId, i + 1);
      tickets.push(ticket);
    }

    // Update booking with ticket data
    const ticketData = {
      tickets: tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        qrCode: t.qrCode
      }))
    };

    this.db.prepare(`
      UPDATE bookings SET ticket_data = ?, qr_code = ? WHERE id = ?
    `).run(
      JSON.stringify(ticketData),
      tickets[0].qrCode, // Use first ticket's QR code as main QR
      bookingId
    );

    const booking: BookingData = {
      id: bookingId,
      userId,
      eventId,
      ticketQuantity,
      totalAmount,
      currency,
      paymentStatus: paymentId ? 'completed' : 'pending',
      status: 'confirmed',
      bookingReference,
      createdAt: new Date().toISOString()
    };

    return { booking, tickets };
  }

  // Create individual ticket
  private async createTicket(
    bookingId: string,
    userId: string,
    eventId: string,
    ticketIndex: number
  ): Promise<Ticket> {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    // Generate ticket number
    const ticketNumber = `${eventId.substr(-4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${ticketIndex.toString().padStart(2, '0')}`;
    
    // Create ticket data for QR code
    const ticketData = {
      ticketId,
      bookingId,
      eventId,
      userId,
      ticketNumber,
      issuedAt: new Date().toISOString(),
      checksum: this.generateChecksum(ticketId + eventId + userId)
    };

    // Generate QR code
    const qrCode = await this.generateQRCode(JSON.stringify(ticketData));

    const ticket: Ticket = {
      id: ticketId,
      bookingId,
      userId,
      eventId,
      ticketNumber,
      qrCode,
      status: 'valid',
      issuedAt: new Date().toISOString(),
      metadata: {
        ticketIndex,
        originalQrData: ticketData
      }
    };

    return ticket;
  }

  // Generate checksum for ticket validation
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Validate ticket QR code
  async validateTicket(qrCodeData: string): Promise<TicketValidationResult> {
    try {
      const ticketData = JSON.parse(qrCodeData);
      
      // Verify checksum
      const expectedChecksum = this.generateChecksum(
        ticketData.ticketId + ticketData.eventId + ticketData.userId
      );
      
      if (ticketData.checksum !== expectedChecksum) {
        return { valid: false, error: 'Invalid ticket checksum' };
      }

      // Get booking details
      const booking = this.db.prepare(`
        SELECT * FROM bookings WHERE id = ? AND status != 'cancelled'
      `).get(ticketData.bookingId) as any;

      if (!booking) {
        return { valid: false, error: 'Booking not found or cancelled' };
      }

      // Get event details
      const event = this.db.prepare(`
        SELECT * FROM events WHERE id = ?
      `).get(ticketData.eventId) as any;

      if (!event) {
        return { valid: false, error: 'Event not found' };
      }

      // Get user details
      const user = this.db.prepare(`
        SELECT id, name, email FROM users WHERE id = ?
      `).get(ticketData.userId) as any;

      if (!user) {
        return { valid: false, error: 'User not found' };
      }

      // Check if ticket was already used
      const ticketUsage = this.db.prepare(`
        SELECT * FROM activity_logs 
        WHERE entity_type = 'ticket' AND entity_id = ? AND action = 'check_in'
      `).get(ticketData.ticketId) as any;

      if (ticketUsage) {
        return { 
          valid: false, 
          error: 'Ticket already used',
          ticket: {
            id: ticketData.ticketId,
            bookingId: ticketData.bookingId,
            userId: ticketData.userId,
            eventId: ticketData.eventId,
            ticketNumber: ticketData.ticketNumber,
            qrCode: qrCodeData,
            status: 'used',
            issuedAt: ticketData.issuedAt,
            usedAt: ticketUsage.created_at,
            metadata: {}
          }
        };
      }

      // Validate event date (tickets can only be used on event day or after)
      const eventDate = new Date(event.date);
      const now = new Date();
      const eventStartOfDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      if (now < eventStartOfDay) {
        return { 
          valid: false, 
          error: 'Ticket cannot be used before event date',
          ticket: {
            id: ticketData.ticketId,
            bookingId: ticketData.bookingId,
            userId: ticketData.userId,
            eventId: ticketData.eventId,
            ticketNumber: ticketData.ticketNumber,
            qrCode: qrCodeData,
            status: 'valid',
            issuedAt: ticketData.issuedAt,
            metadata: {}
          },
          event,
          user
        };
      }

      const ticket: Ticket = {
        id: ticketData.ticketId,
        bookingId: ticketData.bookingId,
        userId: ticketData.userId,
        eventId: ticketData.eventId,
        ticketNumber: ticketData.ticketNumber,
        qrCode: qrCodeData,
        status: 'valid',
        issuedAt: ticketData.issuedAt,
        metadata: {}
      };

      return {
        valid: true,
        ticket,
        event,
        user
      };

    } catch (error) {
      console.error('Ticket validation error:', error);
      return { valid: false, error: 'Invalid QR code format' };
    }
  }

  // Check-in ticket (mark as used)
  async checkInTicket(qrCodeData: string, checkedInBy: string): Promise<TicketValidationResult> {
    const validation = await this.validateTicket(qrCodeData);
    
    if (!validation.valid || !validation.ticket) {
      return validation;
    }

    try {
      // Log the check-in
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      this.db.prepare(`
        INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        checkedInBy,
        'check_in',
        'ticket',
        validation.ticket.id,
        JSON.stringify({
          ticketNumber: validation.ticket.ticketNumber,
          eventId: validation.ticket.eventId,
          checkedInAt: new Date().toISOString()
        })
      );

      // Update booking status if all tickets are checked in
      const bookingTickets = this.getBookingTickets(validation.ticket.bookingId);
      const allTicketsCheckedIn = bookingTickets.every(ticket => {
        return ticket.id === validation.ticket!.id || this.isTicketCheckedIn(ticket.id);
      });

      if (allTicketsCheckedIn) {
        this.db.prepare(`
          UPDATE bookings SET status = 'checked_in' WHERE id = ?
        `).run(validation.ticket.bookingId);
      }

      return {
        ...validation,
        ticket: {
          ...validation.ticket,
          status: 'used',
          usedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Check-in error:', error);
      return { valid: false, error: 'Failed to check-in ticket' };
    }
  }

  // Check if ticket is already checked in
  private isTicketCheckedIn(ticketId: string): boolean {
    const checkIn = this.db.prepare(`
      SELECT id FROM activity_logs 
      WHERE entity_type = 'ticket' AND entity_id = ? AND action = 'check_in'
    `).get(ticketId);
    
    return !!checkIn;
  }

  // Get tickets for a booking
  private getBookingTickets(bookingId: string): Array<{ id: string; ticketNumber: string }> {
    const booking = this.db.prepare(`
      SELECT ticket_data FROM bookings WHERE id = ?
    `).get(bookingId) as any;

    if (!booking || !booking.ticket_data) {
      return [];
    }

    try {
      const ticketData = JSON.parse(booking.ticket_data);
      return ticketData.tickets || [];
    } catch (error) {
      console.error('Failed to parse ticket data:', error);
      return [];
    }
  }

  // Get user's bookings
  getUserBookings(userId: string): BookingData[] {
    const bookings = this.db.prepare(`
      SELECT b.*, e.title as event_title, e.date as event_date, e.location as event_location
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(userId) as any[];

    return bookings.map(booking => ({
      id: booking.id,
      userId: booking.user_id,
      eventId: booking.event_id,
      ticketQuantity: booking.ticket_quantity,
      totalAmount: booking.total_amount,
      currency: booking.currency,
      paymentStatus: booking.payment_status,
      status: booking.status,
      bookingReference: booking.booking_reference,
      createdAt: booking.created_at
    }));
  }

  // Cancel booking
  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<boolean> {
    try {
      // Verify ownership
      const booking = this.db.prepare(`
        SELECT id, status, event_id FROM bookings WHERE id = ? AND user_id = ?
      `).get(bookingId, userId) as any;

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status === 'cancelled') {
        throw new Error('Booking already cancelled');
      }

      if (booking.status === 'checked_in') {
        throw new Error('Cannot cancel checked-in booking');
      }

      // Update booking status
      this.db.prepare(`
        UPDATE bookings 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(bookingId);

      // Log the cancellation
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      this.db.prepare(`
        INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        userId,
        'cancel_booking',
        'booking',
        bookingId,
        JSON.stringify({ reason: reason || 'User cancellation' })
      );

      return true;
    } catch (error) {
      console.error('Booking cancellation error:', error);
      return false;
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(bookingId: string): Promise<boolean> {
    try {
      const booking = this.db.prepare(`
        SELECT b.*, u.name as user_name, u.email as user_email,
               e.title as event_title, e.date as event_date, e.location as event_location
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN events e ON b.event_id = e.id
        WHERE b.id = ?
      `).get(bookingId) as any;

      if (!booking) {
        throw new Error('Booking not found');
      }

      const result = await emailService.sendBookingConfirmation(
        booking.user_email,
        booking.user_name,
        booking.event_title,
        new Date(booking.event_date).toLocaleDateString(),
        booking.event_location,
        booking.booking_reference,
        booking.qr_code
      );

      return result.success;
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      return false;
    }
  }

  // Get event capacity and current bookings
  getEventCapacityInfo(eventId: string): {
    capacity: number;
    booked: number;
    available: number;
    waitlist: number;
  } {
    const event = this.db.prepare('SELECT capacity FROM events WHERE id = ?').get(eventId) as any;
    
    if (!event) {
      return { capacity: 0, booked: 0, available: 0, waitlist: 0 };
    }

    const bookings = this.db.prepare(`
      SELECT SUM(ticket_quantity) as total FROM bookings 
      WHERE event_id = ? AND status != 'cancelled'
    `).get(eventId) as any;

    const booked = bookings.total || 0;
    const available = Math.max(0, event.capacity - booked);

    return {
      capacity: event.capacity,
      booked,
      available,
      waitlist: 0 // TODO: Implement waitlist functionality
    };
  }
}

// Export singleton instance
export const ticketingService = new TicketingService();

export default ticketingService;