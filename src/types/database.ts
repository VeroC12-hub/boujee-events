// Database types and interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Hashed password, optional for external responses
  role: 'admin' | 'organizer' | 'member';
  avatar?: string;
  emailVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  settings?: Record<string, unknown>;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  startDate: Date;
  endDate: Date;
  location: string;
  venue: string;
  address: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  capacity: number;
  ticketsSold: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  featured: boolean;
  imageUrl?: string;
  images: string[];
  tags: string[];
  organizerId: string;
  organizer?: User;
  createdAt: Date;
  updatedAt: Date;
  settings?: Record<string, unknown>;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  type: 'standard' | 'vip' | 'premium';
  price: number;
  currency: string;
  quantity: number;
  status: 'reserved' | 'confirmed' | 'cancelled' | 'refunded';
  qrCode: string;
  purchaseDate: Date;
  validFrom: Date;
  validTo: Date;
  metadata?: Record<string, unknown>;
  event?: Event;
  user?: User;
}

export interface Payment {
  id: string;
  ticketId: string;
  userId: string;
  amount: number;
  currency: string;
  method: 'stripe' | 'paypal' | 'barion';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  gatewayResponse?: Record<string, unknown>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VIPTier {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  capacity: number;
  sold: number;
  perks: string[];
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'ticket_confirmation' | 'event_reminder' | 'cancellation' | 'welcome';
  variables: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: 'payment' | 'email' | 'general' | 'google_drive' | 'security';
  updatedAt: Date;
  updatedBy: string;
}

// Database query interfaces
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Create database tables SQL
export const createTablesSQL = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin', 'organizer', 'member')),
      avatar TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );
  `,

  events: `
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      category TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      location TEXT NOT NULL,
      venue TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      price DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      capacity INTEGER NOT NULL,
      tickets_sold INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
      featured BOOLEAN DEFAULT FALSE,
      image_url TEXT,
      images TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      organizer_id TEXT NOT NULL,
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    );
  `,

  tickets: `
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'vip', 'premium')),
      price DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      quantity INTEGER DEFAULT 1,
      status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'cancelled', 'refunded')),
      qr_code TEXT UNIQUE NOT NULL,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      valid_from DATETIME NOT NULL,
      valid_to DATETIME NOT NULL,
      metadata TEXT DEFAULT '{}',
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,

  payments: `
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      method TEXT NOT NULL CHECK (method IN ('stripe', 'paypal', 'barion')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      transaction_id TEXT UNIQUE NOT NULL,
      gateway_response TEXT DEFAULT '{}',
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,

  vip_tiers: `
    CREATE TABLE IF NOT EXISTS vip_tiers (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      currency TEXT DEFAULT 'USD',
      capacity INTEGER NOT NULL,
      sold INTEGER DEFAULT 0,
      perks TEXT DEFAULT '[]',
      priority INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `,

  email_templates: `
    CREATE TABLE IF NOT EXISTS email_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('ticket_confirmation', 'event_reminder', 'cancellation', 'welcome')),
      variables TEXT DEFAULT '[]',
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  system_settings: `
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
      description TEXT,
      category TEXT DEFAULT 'general' CHECK (category IN ('payment', 'email', 'general', 'google_drive', 'security')),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT NOT NULL
    );
  `
};

// Indexes for better performance
export const createIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
  'CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);',
  'CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);',
  'CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);',
  'CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);',
  'CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);',
  'CREATE INDEX IF NOT EXISTS idx_payments_ticket ON payments(ticket_id);',
  'CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);',
  'CREATE INDEX IF NOT EXISTS idx_vip_tiers_event ON vip_tiers(event_id);',
  'CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);',
  'CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);'
];