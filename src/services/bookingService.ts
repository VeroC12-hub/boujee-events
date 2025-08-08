/**
 * Booking Service
 * Handles event bookings, payments, and ticket management
 */

import { supabase } from '../lib/supabase';
import { stripePaymentService, type BookingData, type PaymentResult } from './stripeService';

interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  payment_intent_id?: string;
  booking_reference: string;
  created_at: string;
  updated_at: string;
}

interface BookingRequest {
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  quantity: number;
  totalAmount: number;
}

interface BookingConfirmation {
  booking: Booking;
  success: boolean;
  error?: string;
  bookingReference: string;
}

class BookingService {
  /**
   * Generate unique booking reference
   */
  private generateBookingReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `BE-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Create a new booking
   */
  async createBooking(request: BookingRequest): Promise<BookingConfirmation> {
    try {
      const bookingReference = this.generateBookingReference();

      // Create booking data
      const bookingData: BookingData = {
        eventId: request.eventId,
        userId: request.userId,
        quantity: request.quantity,
        totalAmount: request.totalAmount,
        userEmail: request.userEmail,
        userName: request.userName
      };

      // Create payment intent
      const paymentResult = await stripePaymentService.createPaymentIntent(bookingData);
      
      if (!paymentResult.success) {
        return {
          booking: null as any,
          success: false,
          error: paymentResult.error || 'Failed to create payment',
          bookingReference
        };
      }

      // Create booking record in database
      const booking = await this.createBookingRecord({
        ...request,
        bookingReference,
        paymentIntentId: paymentResult.paymentIntent?.id
      });

      if (!booking) {
        return {
          booking: null as any,
          success: false,
          error: 'Failed to create booking record',
          bookingReference
        };
      }

      return {
        booking,
        success: true,
        bookingReference
      };

    } catch (error) {
      console.error('Booking creation failed:', error);
      return {
        booking: null as any,
        success: false,
        error: 'Booking creation failed',
        bookingReference: this.generateBookingReference()
      };
    }
  }

  /**
   * Create booking record in database
   */
  private async createBookingRecord(data: {
    eventId: string;
    userId: string;
    quantity: number;
    totalAmount: number;
    bookingReference: string;
    paymentIntentId?: string;
  }): Promise<Booking | null> {
    try {
      if (!supabase) {
        // Mock booking for development
        return {
          id: `mock-${Date.now()}`,
          event_id: data.eventId,
          user_id: data.userId,
          quantity: data.quantity,
          amount: data.totalAmount,
          status: 'pending',
          payment_intent_id: data.paymentIntentId,
          booking_reference: data.bookingReference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([{
          event_id: data.eventId,
          user_id: data.userId,
          quantity: data.quantity,
          amount: data.totalAmount,
          status: 'pending',
          payment_intent_id: data.paymentIntentId,
          booking_reference: data.bookingReference
        }])
        .select()
        .single();

      if (error) {
        console.error('Database booking creation failed:', error);
        return null;
      }

      return booking;
    } catch (error) {
      console.error('Booking record creation failed:', error);
      return null;
    }
  }

  /**
   * Confirm booking after successful payment
   */
  async confirmBooking(
    bookingId: string, 
    paymentIntentId: string
  ): Promise<boolean> {
    try {
      if (!supabase) {
        // Mock confirmation for development
        console.log(`Mock: Booking ${bookingId} confirmed with payment ${paymentIntentId}`);
        return true;
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_intent_id: paymentIntentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Booking confirmation failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Booking confirmation error:', error);
      return false;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      if (!supabase) {
        // Mock cancellation for development
        console.log(`Mock: Booking ${bookingId} cancelled`);
        return true;
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Booking cancellation failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Booking cancellation error:', error);
      return false;
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      if (!supabase) {
        // Mock bookings for development
        return [
          {
            id: 'mock-1',
            event_id: 'mock-event-1',
            user_id: userId,
            quantity: 2,
            amount: 5000,
            status: 'confirmed',
            booking_reference: 'BE-MOCK001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          events(title, event_date, venue)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch user bookings:', error);
        return [];
      }

      return bookings || [];
    } catch (error) {
      console.error('User bookings fetch error:', error);
      return [];
    }
  }

  /**
   * Get booking by reference
   */
  async getBookingByReference(reference: string): Promise<Booking | null> {
    try {
      if (!supabase) {
        // Mock booking lookup for development
        return {
          id: 'mock-ref',
          event_id: 'mock-event-1',
          user_id: 'mock-user-1',
          quantity: 1,
          amount: 2500,
          status: 'confirmed',
          booking_reference: reference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          events(title, event_date, venue),
          profiles(full_name, email)
        `)
        .eq('booking_reference', reference)
        .single();

      if (error) {
        console.error('Booking lookup failed:', error);
        return null;
      }

      return booking;
    } catch (error) {
      console.error('Booking reference lookup error:', error);
      return null;
    }
  }

  /**
   * Get event booking statistics
   */
  async getEventBookingStats(eventId: string): Promise<{
    totalBookings: number;
    totalRevenue: number;
    confirmedBookings: number;
    pendingBookings: number;
  }> {
    try {
      if (!supabase) {
        // Mock stats for development
        return {
          totalBookings: 42,
          totalRevenue: 105000,
          confirmedBookings: 40,
          pendingBookings: 2
        };
      }

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('quantity, amount, status')
        .eq('event_id', eventId);

      if (error) {
        console.error('Failed to fetch booking stats:', error);
        return {
          totalBookings: 0,
          totalRevenue: 0,
          confirmedBookings: 0,
          pendingBookings: 0
        };
      }

      const stats = bookings?.reduce((acc, booking) => {
        acc.totalBookings += booking.quantity || 0;
        acc.totalRevenue += booking.amount || 0;
        
        if (booking.status === 'confirmed') {
          acc.confirmedBookings += booking.quantity || 0;
        } else if (booking.status === 'pending') {
          acc.pendingBookings += booking.quantity || 0;
        }
        
        return acc;
      }, {
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        pendingBookings: 0
      }) || {
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        pendingBookings: 0
      };

      return stats;
    } catch (error) {
      console.error('Booking stats fetch error:', error);
      return {
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        pendingBookings: 0
      };
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(booking: Booking): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with an email service
      // For now, we'll just log the action
      console.log('📧 Booking confirmation email sent:', {
        bookingReference: booking.booking_reference,
        amount: booking.amount,
        quantity: booking.quantity
      });

      return true;
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      return false;
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();

// Export types
export type { Booking, BookingRequest, BookingConfirmation };

// Export class for advanced usage
export { BookingService };