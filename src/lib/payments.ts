import Stripe from 'stripe';
import { getDatabase } from './database';
import { getSystemSetting } from './init';

// Payment provider types
export type PaymentProvider = 'stripe' | 'paypal' | 'hungarian_bank';

export interface PaymentCredentials {
  stripe?: {
    secretKey: string;
    publicKey: string;
    webhookSecret?: string;
  };
  paypal?: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
  };
  hungarian_bank?: {
    merchantId: string;
    secretKey: string;
    apiEndpoint: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  data?: any;
}

// Encryption for storing credentials (simplified for demo)
const encrypt = (data: string): string => {
  // In production, use proper encryption like crypto.createCipher
  return Buffer.from(data).toString('base64');
};

const decrypt = (encryptedData: string): string => {
  // In production, use proper decryption
  return Buffer.from(encryptedData, 'base64').toString('utf8');
};

// Payment service class
export class PaymentService {
  private db = getDatabase();
  
  // Get active payment provider credentials
  async getActiveProviderCredentials(provider: PaymentProvider): Promise<PaymentCredentials[typeof provider] | null> {
    const row = this.db.prepare(`
      SELECT credentials_encrypted FROM payment_providers 
      WHERE provider_type = ? AND is_active = 1 
      ORDER BY created_at DESC LIMIT 1
    `).get(provider) as any;
    
    if (!row) {
      return null;
    }
    
    try {
      const decrypted = decrypt(row.credentials_encrypted);
      const credentials = JSON.parse(decrypted);
      return credentials;
    } catch (error) {
      console.error('Failed to decrypt payment credentials:', error);
      return null;
    }
  }
  
  // Save payment provider credentials (admin function)
  async saveProviderCredentials(
    provider: PaymentProvider, 
    credentials: PaymentCredentials[typeof provider], 
    createdBy: string,
    isTestMode: boolean = true
  ): Promise<string> {
    const credentialsJson = JSON.stringify(credentials);
    const encryptedCredentials = encrypt(credentialsJson);
    
    const providerId = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Deactivate existing providers of the same type
    this.db.prepare(`
      UPDATE payment_providers 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE provider_type = ?
    `).run(provider);
    
    // Insert new provider
    this.db.prepare(`
      INSERT INTO payment_providers (id, provider_name, provider_type, credentials_encrypted, is_active, is_test_mode, supported_currencies, created_by)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      providerId,
      provider.charAt(0).toUpperCase() + provider.slice(1),
      provider,
      encryptedCredentials,
      isTestMode ? 1 : 0,
      JSON.stringify(['USD', 'EUR', 'GBP', 'HUF']),
      createdBy
    );
    
    return providerId;
  }
  
  // Create payment intent (Stripe)
  async createStripePaymentIntent(
    amount: number, 
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntent | null> {
    const credentials = await this.getActiveProviderCredentials('stripe') as PaymentCredentials['stripe'];
    
    if (!credentials) {
      throw new Error('Stripe credentials not configured');
    }
    
    try {
      const stripe = new Stripe(credentials.secretKey);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });
      
      return {
        id: paymentIntent.id,
        amount: amount,
        currency: currency.toUpperCase(),
        status: paymentIntent.status as PaymentIntent['status'],
        clientSecret: paymentIntent.client_secret || undefined,
        metadata
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return null;
    }
  }
  
  // Verify payment (Stripe webhook)
  async verifyStripePayment(paymentIntentId: string): Promise<PaymentResult> {
    const credentials = await this.getActiveProviderCredentials('stripe') as PaymentCredentials['stripe'];
    
    if (!credentials) {
      return { success: false, error: 'Stripe credentials not configured' };
    }
    
    try {
      const stripe = new Stripe(credentials.secretKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        data: {
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: paymentIntent.status,
          metadata: paymentIntent.metadata
        }
      };
    } catch (error) {
      console.error('Stripe payment verification failed:', error);
      return { success: false, error: 'Payment verification failed' };
    }
  }
  
  // Process refund (Stripe)
  async processStripeRefund(
    paymentIntentId: string, 
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<PaymentResult> {
    const credentials = await this.getActiveProviderCredentials('stripe') as PaymentCredentials['stripe'];
    
    if (!credentials) {
      return { success: false, error: 'Stripe credentials not configured' };
    }
    
    try {
      const stripe = new Stripe(credentials.secretKey);
      
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });
      
      return {
        success: refund.status === 'succeeded',
        paymentId: refund.id,
        data: {
          amount: refund.amount / 100,
          currency: refund.currency.toUpperCase(),
          status: refund.status,
          reason: refund.reason
        }
      };
    } catch (error) {
      console.error('Stripe refund failed:', error);
      return { success: false, error: 'Refund processing failed' };
    }
  }
  
  // Get payment providers list (admin function)
  getPaymentProviders(): Array<{
    id: string;
    provider_name: string;
    provider_type: PaymentProvider;
    is_active: boolean;
    is_test_mode: boolean;
    supported_currencies: string[];
    created_at: string;
  }> {
    const providers = this.db.prepare(`
      SELECT id, provider_name, provider_type, is_active, is_test_mode, supported_currencies, created_at
      FROM payment_providers
      ORDER BY created_at DESC
    `).all() as any[];
    
    return providers.map(provider => ({
      ...provider,
      is_active: Boolean(provider.is_active),
      is_test_mode: Boolean(provider.is_test_mode),
      supported_currencies: JSON.parse(provider.supported_currencies || '[]')
    }));
  }
  
  // Toggle payment provider status (admin function)
  toggleProviderStatus(providerId: string, isActive: boolean): boolean {
    try {
      const result = this.db.prepare(`
        UPDATE payment_providers 
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(isActive ? 1 : 0, providerId);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Failed to toggle payment provider status:', error);
      return false;
    }
  }
  
  // Delete payment provider (admin function)
  deleteProvider(providerId: string): boolean {
    try {
      const result = this.db.prepare('DELETE FROM payment_providers WHERE id = ?').run(providerId);
      return result.changes > 0;
    } catch (error) {
      console.error('Failed to delete payment provider:', error);
      return false;
    }
  }
  
  // Get supported currencies for active providers
  getSupportedCurrencies(): string[] {
    const providers = this.db.prepare(`
      SELECT supported_currencies FROM payment_providers 
      WHERE is_active = 1
    `).all() as any[];
    
    const allCurrencies = new Set<string>();
    
    providers.forEach(provider => {
      try {
        const currencies = JSON.parse(provider.supported_currencies || '[]');
        currencies.forEach((currency: string) => allCurrencies.add(currency));
      } catch (error) {
        console.error('Failed to parse supported currencies:', error);
      }
    });
    
    return Array.from(allCurrencies);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Helper functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const validateCurrency = (currency: string): boolean => {
  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'HUF', 'CAD', 'AUD'];
  return supportedCurrencies.includes(currency.toUpperCase());
};

export default paymentService;