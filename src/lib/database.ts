import Database from 'better-sqlite3';
import path from 'path';

// Database configuration
const DB_PATH = process.env.NODE_ENV === 'production' 
  ? process.env.DATABASE_URL 
  : path.join(process.cwd(), 'data', 'boujee-events.db');

let db: Database.Database | null = null;

// Initialize database
export const initializeDatabase = (): Database.Database => {
  if (db) return db;
  
  try {
    // For production with PostgreSQL, we'll need a different approach
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('postgres')) {
      throw new Error('PostgreSQL not yet implemented - falling back to SQLite');
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(DB_PATH as string);
    try {
      const fs = require('fs');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (err) {
      console.warn('Could not create data directory:', err);
    }
    
    db = new Database(DB_PATH as string);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize schema
    initializeSchema(db);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Database schema initialization
const initializeSchema = (database: Database.Database) => {
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin', 'organizer', 'member')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      avatar TEXT,
      verified BOOLEAN DEFAULT FALSE,
      join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      events_created INTEGER DEFAULT 0,
      events_attended INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table
  database.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      short_description TEXT,
      date DATETIME NOT NULL,
      end_date DATETIME,
      location TEXT,
      venue TEXT,
      capacity INTEGER NOT NULL DEFAULT 100,
      price REAL NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'draft')),
      featured BOOLEAN DEFAULT FALSE,
      category TEXT,
      tags TEXT, -- JSON array as string
      image_url TEXT,
      images TEXT, -- JSON array as string
      organizer_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    )
  `);

  // Bookings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      ticket_quantity INTEGER NOT NULL DEFAULT 1,
      total_amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method TEXT,
      payment_id TEXT,
      ticket_data TEXT, -- JSON string with ticket details
      qr_code TEXT,
      booking_reference TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'checked_in')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  // Payment Providers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS payment_providers (
      id TEXT PRIMARY KEY,
      provider_name TEXT NOT NULL,
      provider_type TEXT NOT NULL CHECK (provider_type IN ('stripe', 'paypal', 'hungarian_bank')),
      credentials_encrypted TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      is_test_mode BOOLEAN DEFAULT TRUE,
      supported_currencies TEXT, -- JSON array as string
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // System Settings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json')),
      description TEXT,
      category TEXT,
      is_public BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Google Drive Configuration table
  database.exec(`
    CREATE TABLE IF NOT EXISTS google_drive_config (
      id TEXT PRIMARY KEY,
      account_email TEXT NOT NULL,
      credentials_encrypted TEXT NOT NULL,
      folder_id TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Homepage Images table
  database.exec(`
    CREATE TABLE IF NOT EXISTS homepage_images (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      drive_file_id TEXT,
      watermarked_url TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      uploaded_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `);

  // Activity Logs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT, -- JSON string
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(created_at);
  `);

  console.log('Database schema initialized');
};

// Get database instance
export const getDatabase = (): Database.Database => {
  if (!db) {
    return initializeDatabase();
  }
  return db;
};

// Close database connection
export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};

// Health check
export const healthCheck = (): boolean => {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as health').get();
    return result && (result as any).health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export default { initializeDatabase, getDatabase, closeDatabase, healthCheck };