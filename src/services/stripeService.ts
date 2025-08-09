// Stripe Service for Payment Processing
// Note: This service requires Stripe.js to be loaded in the browser

// Extend Window interface for Stripe
declare global {
  interface Window {
    Stripe?: any;
    stripe?: any;
  }
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'sepa_debit' | 'ideal' | 'sofort';
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface StripeError {
  type: string;
  code?: string;
  message: string;
  param?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: StripeError;
}

export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency?: string;
  eventId: string;
  userId: string;
  metadata?: Record<string, string>;
}

export interface BookingData {
  eventId: string;
  userId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod?: string;
  specialRequests?: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId: string;
  returnUrl?: string;
}

class StripeService {
  private static instance: StripeService;
  private stripe: any = null;
  private isInitialized = false;
  private publicKey: string;

  private constructor() {
    this.publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        console.warn('Stripe service not available in server environment');
        return false;
      }

      if (!this.publicKey) {
        console.warn('Stripe public key not configured');
        return false;
      }

      // Check if Stripe.js is loaded
      if (!window.Stripe) {
        console.warn('Stripe.js not loaded. Make sure to include the Stripe script.');
        return false;
      }

      // Initialize Stripe instance
      this.stripe = window.Stripe(this.publicKey);
      
      if (!this.stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      return false;
    }
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Stripe not initialized');
        }
      }

      // This would typically be a call to your backend API
      // For now, we'll simulate the response
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency || 'usd',
          event_id: request.eventId,
          user_id: request.userId,
          metadata: request.metadata || {}
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      
      return {
        id: data.id,
        client_secret: data.client_secret,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      
      // Return mock payment intent for development
      return {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret`,
        amount: request.amount,
        currency: request.currency || 'usd',
        status: 'requires_payment_method',
        metadata: request.metadata
      };
    }
  }

  async confirmPayment(request: ConfirmPaymentRequest): Promise<PaymentResult> {
    try {
      if (!this.isInitialized || !this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentIntent, error } = await this.stripe.confirmPayment({
        elements: null, // This would be your Stripe Elements instance
        confirmParams: {
          payment_method: request.paymentMethodId,
          return_url: request.returnUrl || window.location.origin,
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            type: error.type,
            code: error.code,
            message: error.message,
            param: error.param
          }
        };
      }

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
        }
      };
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: error.message || 'Payment confirmation failed'
        }
      };
    }
  }

  async createPaymentMethod(cardElement: any): Promise<{ paymentMethod?: PaymentMethod; error?: StripeError }> {
    try {
      if (!this.isInitialized || !this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        return {
          error: {
            type: error.type,
            code: error.code,
            message: error.message,
            param: error.param
          }
        };
      }

      return {
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card ? {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year
          } : undefined
        }
      };
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      return {
        error: {
          type: 'api_error',
          message: error.message || 'Failed to create payment method'
        }
      };
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    try {
      if (!this.isInitialized || !this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentIntent, error } = await this.stripe.retrievePaymentIntent(paymentIntentId);

      if (error) {
        console.error('Error retrieving payment intent:', error);
        return null;
      }

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
    }
  }

  async processRefund(paymentIntentId: string, amount?: number): Promise<{ success: boolean; refund?: any; error?: StripeError }> {
    try {
      // This would typically be a call to your backend API
      const response = await fetch('/api/create-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          amount: amount, // If not provided, refunds the full amount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();
      
      return {
        success: true,
        refund: data
      };
    } catch (error: any) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: {
          type: 'api_error',
          message: error.message || 'Refund failed'
        }
      };
    }
  }

  // Helper method to format currency amounts
  formatAmount(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert from cents to dollars
  }

  // Helper method to validate card information
  validateCard(cardNumber: string, expiryMonth: number, expiryYear: number, cvc: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic card number validation (Luhn algorithm would be more thorough)
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Invalid card number');
    }

    // Expiry validation
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      errors.push('Card has expired');
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      errors.push('Invalid expiry month');
    }

    // CVC validation
    if (!cvc || cvc.length < 3 || cvc.length > 4) {
      errors.push('Invalid CVC');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Create Elements (for card input forms)
  createElement(type: 'card' | 'cardNumber' | 'cardExpiry' | 'cardCvc', options?: any): any {
    if (!this.isInitialized || !this.stripe) {
      console.error('Stripe not initialized');
      return null;
    }

    const elements = this.stripe.elements();
    return elements.create(type, options);
  }

  // Helper method to check if Stripe is available
  isAvailable(): boolean {
    return this.isInitialized && !!this.stripe;
  }

  // Mock payment for development/testing
  async mockPayment(amount: number, eventId: string, userId: string): Promise<PaymentResult> {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        return {
          success: true,
          paymentIntent: {
            id: `pi_mock_${Date.now()}`,
            client_secret: `pi_mock_${Date.now()}_secret`,
            amount,
            currency: 'usd',
            status: 'succeeded',
            metadata: {
              eventId,
              userId
            }
          }
        };
      } else {
        return {
          success: false,
          error: {
            type: 'card_error',
            code: 'card_declined',
            message: 'Your card was declined.'
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          type: 'api_error',
          message: error.message || 'Mock payment failed'
        }
      };
    }
  }

  // Get supported payment methods for the current setup
  getSupportedPaymentMethods(): string[] {
    return ['card', 'apple_pay', 'google_pay'];
  }

  // Calculate processing fee (example: 2.9% + 30¢ for cards)
  calculateFee(amount: number, paymentMethod: string = 'card'): number {
    switch (paymentMethod) {
      case 'card':
        return Math.round(amount * 0.029 + 30); // 2.9% + 30¢
      case 'ach':
        return Math.min(Math.round(amount * 0.008), 500); // 0.8%, max $5
      default:
        return 0;
    }
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();
export const stripePaymentService = stripeService; // Alias for compatibility

// Export helper functions
export const formatCurrency = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const validateCardNumber = (cardNumber: string): boolean => {
  // Basic Luhn algorithm implementation
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0 && digits.length >= 13;
};

export default stripeService;
