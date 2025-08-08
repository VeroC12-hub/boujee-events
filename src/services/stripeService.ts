/**
 * Stripe Payment Integration Service
 * Handles payment processing for event tickets
 */

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

interface BookingData {
  eventId: string;
  userId: string;
  quantity: number;
  totalAmount: number;
  userEmail: string;
  userName: string;
}

class StripePaymentService {
  private stripe: any = null;
  private isInitialized = false;
  private publishableKey: string;

  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
  }

  /**
   * Initialize Stripe
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.publishableKey) {
        console.warn('Stripe publishable key not configured');
        return false;
      }

      if (this.isInitialized && this.stripe) {
        return true;
      }

      // Load Stripe.js
      const stripeLib = await this.loadStripe();
      if (!stripeLib) {
        throw new Error('Failed to load Stripe.js');
      }

      this.stripe = stripeLib(this.publishableKey);
      this.isInitialized = true;
      
      console.log('✅ Stripe initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error);
      return false;
    }
  }

  /**
   * Load Stripe.js library
   */
  private async loadStripe(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check if Stripe is already loaded
      if (window.Stripe) {
        resolve(window.Stripe);
        return;
      }

      // Load Stripe script
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        if (window.Stripe) {
          resolve(window.Stripe);
        } else {
          reject(new Error('Stripe failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Stripe script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Create payment intent for event booking
   */
  async createPaymentIntent(bookingData: BookingData): Promise<PaymentResult> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return { success: false, error: 'Stripe not configured' };
        }
      }

      // In a real implementation, this would call your backend API
      // For now, we'll simulate the payment intent creation
      const mockPaymentIntent: PaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        amount: Math.round(bookingData.totalAmount * 100), // Convert to cents
        currency: 'eur',
        status: 'requires_payment_method',
        client_secret: `pi_mock_${Date.now()}_secret_mock`
      };

      return {
        success: true,
        paymentIntent: mockPaymentIntent
      };

      // Real implementation would look like this:
      /*
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const { client_secret, error } = await response.json();

      if (error) {
        return { success: false, error };
      }

      return {
        success: true,
        paymentIntent: { client_secret, ...otherData }
      };
      */
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      return { 
        success: false, 
        error: 'Failed to create payment intent' 
      };
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(
    clientSecret: string, 
    paymentMethodData: any
  ): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        return { success: false, error: 'Stripe not initialized' };
      }

      // For mock implementation, simulate success
      if (clientSecret.includes('mock')) {
        return {
          success: true,
          paymentIntent: {
            id: clientSecret.split('_')[2],
            amount: 0,
            currency: 'eur',
            status: 'succeeded',
            client_secret: clientSecret
          }
        };
      }

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethodData
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, paymentIntent };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return { 
        success: false, 
        error: 'Payment confirmation failed' 
      };
    }
  }

  /**
   * Create payment element for Stripe Elements
   */
  async createPaymentElement(clientSecret: string): Promise<any> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const elements = this.stripe.elements({
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#D4AF37', // Gold color
            colorBackground: '#1F2937', // Dark gray
            colorText: '#FFFFFF',
            colorDanger: '#EF4444',
            borderRadius: '8px'
          }
        }
      });

      const paymentElement = elements.create('payment');
      
      return { elements, paymentElement };
    } catch (error) {
      console.error('Failed to create payment element:', error);
      throw error;
    }
  }

  /**
   * Check if Stripe is available
   */
  isAvailable(): boolean {
    return !!this.publishableKey;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return [
      'card',
      'sepa_debit',
      'ideal',
      'bancontact',
      'giropay',
      'sofort'
    ];
  }
}

// Export singleton instance
export const stripePaymentService = new StripePaymentService();

// Export types
export type { PaymentIntent, PaymentResult, BookingData };

// Export class for advanced usage
export { StripePaymentService };