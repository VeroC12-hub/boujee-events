// Client-side API interface that can work with either local storage or server API
export interface ClientApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'organizer' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  verified: boolean;
  joinDate: string;
  lastLogin?: string;
  eventsCreated: number;
  eventsAttended: number;
  totalSpent: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  date: string;
  endDate?: string;
  location: string;
  venue?: string;
  capacity: number;
  price: number;
  currency: string;
  status: 'active' | 'cancelled' | 'completed' | 'draft';
  featured: boolean;
  category?: string;
  tags: string[];
  imageUrl?: string;
  images?: string[];
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
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
  qrCode?: string;
}

export interface PaymentProvider {
  id: string;
  providerName: string;
  providerType: 'stripe' | 'paypal' | 'hungarian_bank';
  isActive: boolean;
  isTestMode: boolean;
  supportedCurrencies: string[];
  createdAt: string;
}

export interface SystemSetting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category?: string;
  isPublic: boolean;
}

// Client API service that works in browser environment
class ClientApiService {
  private baseUrl: string;
  private isLocalMode: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    this.isLocalMode = import.meta.env.VITE_LOCAL_MODE === 'true' || !import.meta.env.VITE_API_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ClientApiResponse<T>> {
    try {
      if (this.isLocalMode) {
        // Use local storage for demo mode
        return this.handleLocalRequest<T>(endpoint, options);
      }

      const token = this.getAuthToken();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private getAuthToken(): string | null {
    const tokensStr = localStorage.getItem('authTokens');
    if (!tokensStr) return null;
    
    try {
      const tokens: AuthTokens = JSON.parse(tokensStr);
      return tokens.accessToken;
    } catch {
      return null;
    }
  }

  // Local storage-based implementation for demo/development
  private async handleLocalRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ClientApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

    try {
      // Import and use the existing mock API
      const { default: mockApi } = await import('../services/mockApi');
      
      const method = options.method?.toUpperCase() || 'GET';
      const body = options.body ? JSON.parse(options.body as string) : undefined;

      // Route the request to appropriate mock API method
      switch (endpoint) {
        case '/auth/login':
          if (method === 'POST' && body) {
            const response = await mockApi.login(body);
            return { success: true, data: response as T };
          }
          break;
          
        case '/auth/register':
          if (method === 'POST' && body) {
            // Create mock registration response
            const loginResponse = await mockApi.login({
              email: body.email,
              password: body.password
            });
            return { success: true, data: loginResponse as T };
          }
          break;
          
        case '/users/me':
          if (method === 'GET') {
            const token = this.getAuthToken();
            if (token) {
              // Get user from stored auth data
              const userStr = localStorage.getItem('authUser');
              if (userStr) {
                const user = JSON.parse(userStr);
                return { success: true, data: user as T };
              }
            }
            return { success: false, error: 'Not authenticated' };
          }
          break;
          
        case '/events':
          if (method === 'GET') {
            const response = await mockApi.getEvents();
            return { success: true, data: response as T };
          }
          break;
          
        case '/settings/public':
          if (method === 'GET') {
            const settings = {
              site_name: 'Boujee Events',
              site_description: 'Luxury Events Platform for Exclusive Experiences',
              default_currency: 'USD'
            };
            return { success: true, data: settings as T };
          }
          break;
          
        default:
          return { success: false, error: `Endpoint ${endpoint} not implemented in local mode` };
      }
      
      return { success: false, error: 'Invalid request' };
    } catch (error) {
      console.error('Local API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Local API error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ClientApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'member' | 'organizer';
  }): Promise<ClientApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ClientApiResponse<void>> {
    localStorage.removeItem('authTokens');
    localStorage.removeItem('authUser');
    return { success: true };
  }

  async refreshToken(): Promise<ClientApiResponse<AuthTokens>> {
    const tokensStr = localStorage.getItem('authTokens');
    if (!tokensStr) {
      return { success: false, error: 'No refresh token available' };
    }

    const tokens: AuthTokens = JSON.parse(tokensStr);
    return this.makeRequest<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
  }

  // User methods
  async getCurrentUser(): Promise<ClientApiResponse<User>> {
    return this.makeRequest<User>('/users/me');
  }

  async updateUser(updates: Partial<User>): Promise<ClientApiResponse<User>> {
    return this.makeRequest<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ClientApiResponse<void>> {
    return this.makeRequest<void>('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Event methods
  async getEvents(params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    featured?: boolean; 
  }): Promise<ClientApiResponse<{ events: Event[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    return this.makeRequest<{ events: Event[]; total: number }>(
      `/events?${queryParams.toString()}`
    );
  }

  async getEvent(eventId: string): Promise<ClientApiResponse<Event>> {
    return this.makeRequest<Event>(`/events/${eventId}`);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientApiResponse<Event>> {
    return this.makeRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<ClientApiResponse<Event>> {
    return this.makeRequest<Event>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEvent(eventId: string): Promise<ClientApiResponse<void>> {
    return this.makeRequest<void>(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Booking methods
  async createBooking(
    eventId: string,
    ticketQuantity: number
  ): Promise<ClientApiResponse<{ booking: Booking; paymentIntent?: any }>> {
    return this.makeRequest<{ booking: Booking; paymentIntent?: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ eventId, ticketQuantity }),
    });
  }

  async getUserBookings(): Promise<ClientApiResponse<Booking[]>> {
    return this.makeRequest<Booking[]>('/users/me/bookings');
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<ClientApiResponse<void>> {
    return this.makeRequest<void>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // System settings
  async getPublicSettings(): Promise<ClientApiResponse<Record<string, any>>> {
    return this.makeRequest<Record<string, any>>('/settings/public');
  }

  async getSystemSettings(): Promise<ClientApiResponse<SystemSetting[]>> {
    return this.makeRequest<SystemSetting[]>('/admin/settings');
  }

  async updateSystemSetting(key: string, value: any, type?: string): Promise<ClientApiResponse<void>> {
    return this.makeRequest<void>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value, type }),
    });
  }

  // Payment provider management
  async getPaymentProviders(): Promise<ClientApiResponse<PaymentProvider[]>> {
    return this.makeRequest<PaymentProvider[]>('/admin/payment-providers');
  }

  async savePaymentProvider(
    providerType: 'stripe' | 'paypal' | 'hungarian_bank',
    credentials: any,
    isTestMode: boolean
  ): Promise<ClientApiResponse<PaymentProvider>> {
    return this.makeRequest<PaymentProvider>('/admin/payment-providers', {
      method: 'POST',
      body: JSON.stringify({ providerType, credentials, isTestMode }),
    });
  }

  async togglePaymentProvider(providerId: string, isActive: boolean): Promise<ClientApiResponse<void>> {
    return this.makeRequest<void>(`/admin/payment-providers/${providerId}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  // Google Drive configuration
  async saveGoogleDriveConfig(
    accountEmail: string,
    credentials: any
  ): Promise<ClientApiResponse<{ configId: string }>> {
    return this.makeRequest<{ configId: string }>('/admin/google-drive/config', {
      method: 'POST',
      body: JSON.stringify({ accountEmail, credentials }),
    });
  }

  async testGoogleDriveConnection(): Promise<ClientApiResponse<{ connected: boolean }>> {
    return this.makeRequest<{ connected: boolean }>('/admin/google-drive/test');
  }

  // Image management
  async uploadImages(
    files: File[],
    eventId?: string
  ): Promise<ClientApiResponse<{ uploadedImages: any[] }>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    if (eventId) {
      formData.append('eventId', eventId);
    }

    return this.makeRequest<{ uploadedImages: any[] }>('/admin/images/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  async getHomepageImages(): Promise<ClientApiResponse<any[]>> {
    return this.makeRequest<any[]>('/admin/images/homepage');
  }

  async updateImageOrder(imageId: string, newOrder: number): Promise<ClientApiResponse<void>> {
    return this.makeRequest<void>(`/admin/images/${imageId}/order`, {
      method: 'PUT',
      body: JSON.stringify({ order: newOrder }),
    });
  }

  async deleteImage(imageId: string): Promise<ClientApiResponse<void>> {
    return this.makeRequest<void>(`/admin/images/${imageId}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const clientApi = new ClientApiService();

export default clientApi;