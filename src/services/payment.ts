// Payment Integration Service
import { env } from '../config/environment';
import { db } from './database';
import { emailTicketingService } from './emailTicketing';
import type { Payment, Ticket } from '../types/database';

export interface PaymentRequest {
  ticketId: string;
  amount: number;
  currency: string;
  method: 'stripe' | 'paypal' | 'barion';
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  paymentId?: string;
  transactionId?: string;
  redirectUrl?: string;
  clientSecret?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  method: string;
  transactionId: string;
  createdAt: Date;
  processedAt?: Date;
}

// Stripe integration (browser-compatible)
class StripePaymentProvider {
  private publicKey: string;

  constructor() {
    this.publicKey = env.STRIPE_PUBLIC_KEY;
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, unknown> = {}): Promise<PaymentResult> {
    try {
      // In a real implementation, this would call your backend API which creates the payment intent
      // For now, we'll simulate the process
      
      console.log('Creating Stripe payment intent:', { amount, currency, metadata });
      
      // Mock Stripe payment intent creation
      const paymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_${Math.random()}`,
        amount: amount * 100, // Stripe uses cents
        currency: currency.toLowerCase(),
        status: 'requires_payment_method'
      };
      
      return {
        success: true,
        message: 'Payment intent created successfully',
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        message: 'Failed to create payment intent'
      };
    }
  }

  async confirmPayment(clientSecret: string, paymentMethodId: string): Promise<PaymentResult> {
    try {
      // In a real implementation, this would use the Stripe.js library
      console.log('Confirming Stripe payment:', { clientSecret, paymentMethodId });
      
      // Mock successful payment confirmation
      const mockTransactionId = `ch_mock_${Date.now()}`;
      
      return {
        success: true,
        message: 'Payment confirmed successfully',
        transactionId: mockTransactionId
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      return {
        success: false,
        message: 'Payment confirmation failed'
      };
    }
  }
}

// PayPal integration
class PayPalPaymentProvider {
  private clientId: string;

  constructor() {
    this.clientId = env.PAYPAL_CLIENT_ID;
  }

  async createOrder(amount: number, currency: string, metadata: Record<string, unknown> = {}): Promise<PaymentResult> {
    try {
      console.log('Creating PayPal order:', { amount, currency, metadata });
      
      // Mock PayPal order creation
      const order = {
        id: `PAYPAL_ORDER_${Date.now()}`,
        status: 'CREATED',
        links: [{
          rel: 'approve',
          href: `https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL_ORDER_${Date.now()}`
        }]
      };
      
      return {
        success: true,
        message: 'PayPal order created successfully',
        paymentId: order.id,
        redirectUrl: order.links[0].href
      };
    } catch (error) {
      console.error('PayPal order creation error:', error);
      return {
        success: false,
        message: 'Failed to create PayPal order'
      };
    }
  }

  async captureOrder(orderId: string): Promise<PaymentResult> {
    try {
      console.log('Capturing PayPal order:', orderId);
      
      // Mock successful order capture
      const mockTransactionId = `PAYPAL_${Date.now()}`;
      
      return {
        success: true,
        message: 'PayPal payment captured successfully',
        transactionId: mockTransactionId
      };
    } catch (error) {
      console.error('PayPal order capture error:', error);
      return {
        success: false,
        message: 'PayPal payment capture failed'
      };
    }
  }
}

// Barion integration (Hungarian payment gateway)
class BarionPaymentProvider {
  private publicKey: string;

  constructor() {
    this.publicKey = env.BARION_PUBLIC_KEY;
  }

  async createPayment(amount: number, currency: string, metadata: Record<string, unknown> = {}): Promise<PaymentResult> {
    try {
      console.log('Creating Barion payment:', { amount, currency, metadata });
      
      // Mock Barion payment creation
      const payment = {
        PaymentId: `BARION_${Date.now()}`,
        PaymentRequestId: `REQ_${Date.now()}`,
        Status: 'Prepared',
        GatewayUrl: `https://secure.barion.com/Pay?Id=BARION_${Date.now()}`
      };
      
      return {
        success: true,
        message: 'Barion payment created successfully',
        paymentId: payment.PaymentId,
        redirectUrl: payment.GatewayUrl
      };
    } catch (error) {
      console.error('Barion payment creation error:', error);
      return {
        success: false,
        message: 'Failed to create Barion payment'
      };
    }
  }

  async getPaymentState(paymentId: string): Promise<PaymentResult> {
    try {
      console.log('Getting Barion payment state:', paymentId);
      
      // Mock successful payment state
      const mockTransactionId = `BARION_TXN_${Date.now()}`;
      
      return {
        success: true,
        message: 'Payment completed successfully',
        transactionId: mockTransactionId
      };
    } catch (error) {
      console.error('Barion payment state error:', error);
      return {
        success: false,
        message: 'Failed to get payment state'
      };
    }
  }
}

// Main payment service
class PaymentService {
  private stripeProvider: StripePaymentProvider;
  private paypalProvider: PayPalPaymentProvider;
  private barionProvider: BarionPaymentProvider;

  constructor() {
    this.stripeProvider = new StripePaymentProvider();
    this.paypalProvider = new PayPalPaymentProvider();
    this.barionProvider = new BarionPaymentProvider();
  }

  // Get enabled payment methods from settings
  async getEnabledPaymentMethods(): Promise<string[]> {
    const setting = await db.getSetting('payment_methods_enabled');
    if (setting) {
      return setting.value.split(',').map(method => method.trim());
    }
    return ['stripe']; // Default to Stripe only
  }

  // Create payment
  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Get ticket details
      const ticket = await db.getTicketById(request.ticketId);
      if (!ticket) {
        return { success: false, message: 'Ticket not found' };
      }

      // Validate amount
      const expectedAmount = ticket.price * ticket.quantity;
      if (Math.abs(request.amount - expectedAmount) > 0.01) {
        return { success: false, message: 'Invalid payment amount' };
      }

      // Check if payment method is enabled
      const enabledMethods = await this.getEnabledPaymentMethods();
      if (!enabledMethods.includes(request.method)) {
        return { success: false, message: 'Payment method not available' };
      }

      let result: PaymentResult;

      // Route to appropriate payment provider
      switch (request.method) {
        case 'stripe':
          result = await this.stripeProvider.createPaymentIntent(
            request.amount,
            request.currency,
            { ticketId: request.ticketId, ...request.metadata }
          );
          break;
        case 'paypal':
          result = await this.paypalProvider.createOrder(
            request.amount,
            request.currency,
            { ticketId: request.ticketId, ...request.metadata }
          );
          break;
        case 'barion':
          result = await this.barionProvider.createPayment(
            request.amount,
            request.currency,
            { ticketId: request.ticketId, ...request.metadata }
          );
          break;
        default:
          return { success: false, message: 'Unsupported payment method' };
      }

      // If payment creation was successful, create payment record
      if (result.success && result.paymentId) {
        await db.createPayment({
          ticketId: request.ticketId,
          userId: ticket.userId,
          amount: request.amount,
          currency: request.currency,
          method: request.method,
          status: 'pending',
          transactionId: result.paymentId,
          gatewayResponse: {
            paymentId: result.paymentId,
            clientSecret: result.clientSecret,
            redirectUrl: result.redirectUrl
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Payment creation error:', error);
      return { success: false, message: 'Payment creation failed' };
    }
  }

  // Confirm payment (webhook handler)
  async confirmPayment(
    paymentId: string, 
    transactionId: string, 
    method: 'stripe' | 'paypal' | 'barion'
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find payment record
      const payment = await db.getPaymentById(paymentId);
      if (!payment) {
        return { success: false, message: 'Payment not found' };
      }

      // Update payment status
      await db.updatePayment(paymentId, {
        status: 'completed',
        transactionId: transactionId,
        processedAt: new Date()
      });

      // Confirm the ticket
      const confirmResult = await emailTicketingService.confirmTicket(payment.ticketId);
      if (!confirmResult.success) {
        console.error('Failed to confirm ticket after payment:', confirmResult.message);
      }

      // Generate QR code and send confirmation email
      const ticket = await db.getTicketById(payment.ticketId);
      if (ticket) {
        try {
          const qrCode = await emailTicketingService.generateQRCode(
            ticket.id,
            ticket.eventId,
            ticket.userId
          );
          
          await emailTicketingService.sendTicketConfirmation(ticket, qrCode);
        } catch (error) {
          console.error('Failed to send ticket confirmation email:', error);
        }
      }

      return { success: true, message: 'Payment confirmed successfully' };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return { success: false, message: 'Payment confirmation failed' };
    }
  }

  // Handle payment failure
  async failPayment(paymentId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      // Update payment status
      await db.updatePayment(paymentId, {
        status: 'failed',
        gatewayResponse: { failureReason: reason }
      });

      // Cancel the associated ticket
      const payment = await db.getPaymentById(paymentId);
      if (payment) {
        await db.updateTicket(payment.ticketId, { status: 'cancelled' });
      }

      return { success: true, message: 'Payment failure handled' };
    } catch (error) {
      console.error('Payment failure handling error:', error);
      return { success: false, message: 'Failed to handle payment failure' };
    }
  }

  // Process refund
  async processRefund(paymentId: string, reason: string = ''): Promise<{ success: boolean; message: string }> {
    try {
      const payment = await db.getPaymentById(paymentId);
      if (!payment) {
        return { success: false, message: 'Payment not found' };
      }

      if (payment.status !== 'completed') {
        return { success: false, message: 'Can only refund completed payments' };
      }

      // In a real implementation, you would call the payment provider's refund API
      console.log(`Processing refund for payment ${paymentId} via ${payment.method}`);

      // Update payment status
      await db.updatePayment(paymentId, {
        status: 'refunded',
        gatewayResponse: {
          ...payment.gatewayResponse,
          refundReason: reason,
          refundedAt: new Date().toISOString()
        }
      });

      // Cancel the ticket
      await db.updateTicket(payment.ticketId, { status: 'refunded' });

      // Update event sold count
      const ticket = await db.getTicketById(payment.ticketId);
      if (ticket) {
        const event = await db.getEventById(ticket.eventId);
        if (event) {
          await db.updateEvent(event.id, {
            ticketsSold: Math.max(0, event.ticketsSold - ticket.quantity)
          });
        }
      }

      return { success: true, message: 'Refund processed successfully' };
    } catch (error) {
      console.error('Refund processing error:', error);
      return { success: false, message: 'Refund processing failed' };
    }
  }

  // Get payment statistics
  async getPaymentStats(eventId?: string): Promise<{
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    refundedPayments: number;
    totalRevenue: number;
    revenueByMethod: Record<string, number>;
  }> {
    try {
      // In a real implementation, this would be a database query
      // For now, we'll simulate with available data
      const stats = {
        totalPayments: 0,
        completedPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        totalRevenue: 0,
        revenueByMethod: {} as Record<string, number>
      };

      // This would be replaced with actual database queries
      console.log('Getting payment stats for event:', eventId || 'all events');

      return stats;
    } catch (error) {
      console.error('Payment stats error:', error);
      return {
        totalPayments: 0,
        completedPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        totalRevenue: 0,
        revenueByMethod: {}
      };
    }
  }

  // Webhook verification and handling
  async handleWebhook(
    provider: 'stripe' | 'paypal' | 'barion',
    signature: string,
    payload: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, you would verify the webhook signature
      // and parse the payload according to each provider's format
      
      console.log(`Handling ${provider} webhook`);
      
      // Mock webhook processing
      const webhookData = JSON.parse(payload);
      
      switch (provider) {
        case 'stripe':
          // Handle Stripe webhook events
          if (webhookData.type === 'payment_intent.succeeded') {
            const paymentIntent = webhookData.data.object;
            await this.confirmPayment(
              paymentIntent.metadata?.paymentId,
              paymentIntent.id,
              'stripe'
            );
          }
          break;
          
        case 'paypal':
          // Handle PayPal webhook events
          if (webhookData.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const capture = webhookData.resource;
            await this.confirmPayment(
              capture.custom_id,
              capture.id,
              'paypal'
            );
          }
          break;
          
        case 'barion':
          // Handle Barion webhook events
          if (webhookData.Status === 'Succeeded') {
            await this.confirmPayment(
              webhookData.PaymentId,
              webhookData.TransactionId,
              'barion'
            );
          }
          break;
      }
      
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Webhook handling error:', error);
      return { success: false, message: 'Webhook processing failed' };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export types
export type { PaymentRequest, PaymentResult, PaymentStatus };