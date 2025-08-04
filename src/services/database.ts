// Database service - simplified for now to work with existing mock data
// In production, this would connect to PostgreSQL or SQLite

import { env } from '../config/environment';
import type { 
  User, 
  Event, 
  Ticket, 
  Payment, 
  VIPTier, 
  EmailTemplate, 
  SystemSettings,
  QueryOptions,
  PaginatedResult 
} from '../types/database';

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// In-memory storage for development (to be replaced with real database)
class DatabaseService {
  private users: Map<string, User> = new Map();
  private events: Map<string, Event> = new Map();
  private tickets: Map<string, Ticket> = new Map();
  private payments: Map<string, Payment> = new Map();
  private vipTiers: Map<string, VIPTier> = new Map();
  private emailTemplates: Map<string, EmailTemplate> = new Map();
  private systemSettings: Map<string, SystemSettings> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  // Initialize with some default data
  private initializeDefaultData(): void {
    // Default admin user
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@boujeeevents.com',
      name: 'VeroC12-hub',
      role: 'admin',
      avatar: 'https://avatars.githubusercontent.com/u/VeroC12-hub?v=4',
      emailVerified: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      settings: {}
    };
    this.users.set(adminUser.id, adminUser);

    // Default email templates
    const ticketTemplate: EmailTemplate = {
      id: 'template-1',
      name: 'Ticket Confirmation',
      subject: '🎫 Your Boujee Events Ticket Confirmation',
      content: `
        <h1>Thank you for your purchase!</h1>
        <p>Hello {{userName}},</p>
        <p>Your ticket for <strong>{{eventName}}</strong> has been confirmed.</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Date: {{eventDate}}</li>
          <li>Time: {{eventTime}}</li>
          <li>Venue: {{eventVenue}}</li>
          <li>Ticket Type: {{ticketType}}</li>
          <li>Quantity: {{ticketQuantity}}</li>
        </ul>
        <p>Please present the QR code attached to this email at the venue for entry.</p>
        <p>Best regards,<br>The Boujee Events Team</p>
      `,
      type: 'ticket_confirmation',
      variables: ['userName', 'eventName', 'eventDate', 'eventTime', 'eventVenue', 'ticketType', 'ticketQuantity'],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.emailTemplates.set(ticketTemplate.id, ticketTemplate);

    // Default system settings
    const defaultSettings = [
      { key: 'payment_methods_enabled', value: 'stripe,paypal', category: 'payment' as const, description: 'Enabled payment methods' },
      { key: 'email_service_provider', value: 'resend', category: 'email' as const, description: 'Email service provider' },
      { key: 'max_tickets_per_user', value: '10', category: 'general' as const, description: 'Maximum tickets per user per event' },
      { key: 'google_drive_enabled', value: 'false', category: 'google_drive' as const, description: 'Enable Google Drive integration' }
    ];

    defaultSettings.forEach(setting => {
      const systemSetting: SystemSettings = {
        id: generateId(),
        key: setting.key,
        value: setting.value,
        type: 'string',
        description: setting.description,
        category: setting.category,
        updatedAt: new Date(),
        updatedBy: adminUser.id
      };
      this.systemSettings.set(setting.key, systemSetting);
    });
  }

  // Users
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(options: QueryOptions = {}): Promise<PaginatedResult<User>> {
    const users = Array.from(this.users.values());
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const total = users.length;
    
    return {
      data: users.slice(offset, offset + limit),
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Events
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'ticketsSold'>): Promise<Event> {
    const event: Event = {
      ...eventData,
      id: generateId(),
      ticketsSold: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.events.set(event.id, event);
    return event;
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.events.get(id) || null;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const event = this.events.get(id);
    if (!event) return null;
    
    const updatedEvent = { ...event, ...updates, updatedAt: new Date() };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async getEvents(options: QueryOptions = {}): Promise<PaginatedResult<Event>> {
    const events = Array.from(this.events.values());
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const total = events.length;
    
    return {
      data: events.slice(offset, offset + limit),
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Tickets
  async createTicket(ticketData: Omit<Ticket, 'id' | 'purchaseDate' | 'qrCode'>): Promise<Ticket> {
    const ticket: Ticket = {
      ...ticketData,
      id: generateId(),
      qrCode: generateId(), // Simple QR code for now
      purchaseDate: new Date()
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) || null;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    const ticket = this.tickets.get(id);
    if (!ticket) return null;
    
    const updatedTicket = { ...ticket, ...updates };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.userId === userId);
  }

  async getEventTickets(eventId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.eventId === eventId);
  }

  // Payments
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const payment: Payment = {
      ...paymentData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;
    
    const updatedPayment = { ...payment, ...updates, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // System Settings
  async getSetting(key: string): Promise<SystemSettings | null> {
    return this.systemSettings.get(key) || null;
  }

  async setSetting(key: string, value: string, updatedBy: string, options: {
    type?: SystemSettings['type'];
    description?: string;
    category?: SystemSettings['category'];
  } = {}): Promise<SystemSettings> {
    const existing = this.systemSettings.get(key);
    const setting: SystemSettings = {
      id: existing?.id || generateId(),
      key,
      value,
      type: options.type || 'string',
      description: options.description || existing?.description,
      category: options.category || 'general',
      updatedAt: new Date(),
      updatedBy
    };
    this.systemSettings.set(key, setting);
    return setting;
  }

  async getSettingsByCategory(category: SystemSettings['category']): Promise<SystemSettings[]> {
    return Array.from(this.systemSettings.values()).filter(setting => setting.category === category);
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      // In a real database, this would check database connectivity
      return { status: 'healthy', message: 'Database service is operational' };
    } catch (error) {
      return { status: 'unhealthy', message: `Database error: ${error}` };
    }
  }

  // Statistics for admin dashboard
  async getStats(): Promise<{
    totalUsers: number;
    totalEvents: number;
    totalTickets: number;
    totalRevenue: number;
  }> {
    const totalUsers = this.users.size;
    const totalEvents = this.events.size;
    const totalTickets = this.tickets.size;
    
    // Calculate total revenue from completed payments
    const completedPayments = Array.from(this.payments.values())
      .filter(payment => payment.status === 'completed');
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalUsers,
      totalEvents,
      totalTickets,
      totalRevenue
    };
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Export utility functions
export { DatabaseService };