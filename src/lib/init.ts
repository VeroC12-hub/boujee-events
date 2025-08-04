import { getDatabase } from '../lib/database';
import { hashPassword } from '../lib/auth';

// Initialize database with default admin user and settings
export const initializeDefaultData = async (): Promise<void> => {
  const db = getDatabase();
  
  try {
    // Check if admin user already exists
    const existingAdmin = db.prepare('SELECT id FROM users WHERE role = "admin" LIMIT 1').get();
    
    if (!existingAdmin) {
      console.log('Creating default admin user...');
      
      // Create default admin user
      const adminId = 'admin_001';
      const adminPasswordHash = await hashPassword('admin123!@#');
      
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, phone, role, status, verified, events_created, events_attended, total_spent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        adminId,
        'admin@boujeeevents.com',
        adminPasswordHash,
        'System Administrator',
        '+1-555-0001',
        'admin',
        'active',
        1, // verified
        0,
        0,
        0
      );
      
      console.log('Default admin user created');
    }
    
    // Initialize system settings
    const defaultSettings = [
      {
        key: 'site_name',
        value: 'Boujee Events',
        type: 'string',
        description: 'Website name',
        category: 'general',
        is_public: 1
      },
      {
        key: 'site_description',
        value: 'Luxury Events Platform for Exclusive Experiences',
        type: 'string',
        description: 'Website description',
        category: 'general',
        is_public: 1
      },
      {
        key: 'default_currency',
        value: 'USD',
        type: 'string',
        description: 'Default currency for events',
        category: 'payments',
        is_public: 1
      },
      {
        key: 'email_notifications_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Enable email notifications',
        category: 'notifications',
        is_public: 0
      },
      {
        key: 'max_file_upload_size',
        value: '10485760',
        type: 'number',
        description: 'Maximum file upload size in bytes (10MB)',
        category: 'uploads',
        is_public: 0
      },
      {
        key: 'watermark_text',
        value: 'BOUJEE EVENTS',
        type: 'string',
        description: 'Watermark text for images',
        category: 'uploads',
        is_public: 0
      },
      {
        key: 'stripe_webhook_endpoint',
        value: '',
        type: 'string',
        description: 'Stripe webhook endpoint secret',
        category: 'payments',
        is_public: 0
      },
      {
        key: 'resend_api_key',
        value: '',
        type: 'string',
        description: 'Resend API key for email sending',
        category: 'notifications',
        is_public: 0
      }
    ];
    
    for (const setting of defaultSettings) {
      const existingSetting = db.prepare('SELECT id FROM system_settings WHERE key = ?').get(setting.key);
      
      if (!existingSetting) {
        const settingId = `setting_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        db.prepare(`
          INSERT INTO system_settings (id, key, value, type, description, category, is_public)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          settingId,
          setting.key,
          setting.value,
          setting.type,
          setting.description,
          setting.category,
          setting.is_public
        );
      }
    }
    
    // Create sample events if none exist
    const existingEvents = db.prepare('SELECT COUNT(*) as count FROM events').get() as any;
    
    if (existingEvents.count === 0) {
      console.log('Creating sample events...');
      
      const sampleEvents = [
        {
          id: 'event_001',
          title: 'Luxury Wine Tasting Experience',
          description: 'An exclusive wine tasting event featuring rare vintages from around the world.',
          short_description: 'Exclusive wine tasting with rare vintages',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          location: 'Napa Valley, CA',
          venue: 'Château Margaux',
          capacity: 50,
          price: 299.99,
          currency: 'USD',
          status: 'active',
          featured: 1,
          category: 'Food & Wine',
          tags: JSON.stringify(['wine', 'luxury', 'tasting', 'exclusive']),
          image_url: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=800&h=600&fit=crop',
          organizer_id: 'admin_001'
        },
        {
          id: 'event_002',
          title: 'Rooftop Jazz & Cocktails',
          description: 'Sophisticated evening of live jazz music paired with craft cocktails on our exclusive rooftop terrace.',
          short_description: 'Live jazz and cocktails on rooftop terrace',
          date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
          location: 'Manhattan, NY',
          venue: 'Sky Lounge NYC',
          capacity: 100,
          price: 189.99,
          currency: 'USD',
          status: 'active',
          featured: 1,
          category: 'Music & Entertainment',
          tags: JSON.stringify(['jazz', 'cocktails', 'rooftop', 'manhattan']),
          image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
          organizer_id: 'admin_001'
        },
        {
          id: 'event_003',
          title: 'Private Art Gallery Opening',
          description: 'Exclusive preview of contemporary art collection featuring emerging and established artists.',
          short_description: 'Private contemporary art gallery preview',
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
          location: 'Miami, FL',
          venue: 'Wynwood Arts District',
          capacity: 75,
          price: 150.00,
          currency: 'USD',
          status: 'active',
          featured: 0,
          category: 'Art & Culture',
          tags: JSON.stringify(['art', 'gallery', 'contemporary', 'exclusive']),
          image_url: 'https://images.unsplash.com/photo-1544967882-6abaa1ad6435?w=800&h=600&fit=crop',
          organizer_id: 'admin_001'
        }
      ];
      
      for (const event of sampleEvents) {
        db.prepare(`
          INSERT INTO events (id, title, description, short_description, date, location, venue, capacity, price, currency, status, featured, category, tags, image_url, organizer_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          event.id,
          event.title,
          event.description,
          event.short_description,
          event.date,
          event.location,
          event.venue,
          event.capacity,
          event.price,
          event.currency,
          event.status,
          event.featured,
          event.category,
          event.tags,
          event.image_url,
          event.organizer_id
        );
      }
      
      console.log('Sample events created');
    }
    
    console.log('Default data initialization completed');
    
  } catch (error) {
    console.error('Error initializing default data:', error);
    throw error;
  }
};

// Get system setting
export const getSystemSetting = (key: string): any => {
  const db = getDatabase();
  const setting = db.prepare('SELECT value, type FROM system_settings WHERE key = ?').get(key) as any;
  
  if (!setting) {
    return null;
  }
  
  // Convert value based on type
  switch (setting.type) {
    case 'boolean':
      return setting.value === 'true';
    case 'number':
      return parseFloat(setting.value);
    case 'json':
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    default:
      return setting.value;
  }
};

// Set system setting
export const setSystemSetting = (key: string, value: any, type: string = 'string', description: string = '', category: string = 'general'): void => {
  const db = getDatabase();
  
  let stringValue: string;
  switch (type) {
    case 'boolean':
      stringValue = value ? 'true' : 'false';
      break;
    case 'number':
      stringValue = value.toString();
      break;
    case 'json':
      stringValue = JSON.stringify(value);
      break;
    default:
      stringValue = value.toString();
  }
  
  const existingSetting = db.prepare('SELECT id FROM system_settings WHERE key = ?').get(key);
  
  if (existingSetting) {
    db.prepare(`
      UPDATE system_settings 
      SET value = ?, type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = ?
    `).run(stringValue, type, key);
  } else {
    const settingId = `setting_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    db.prepare(`
      INSERT INTO system_settings (id, key, value, type, description, category, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(settingId, key, stringValue, type, description, category, 0);
  }
};

// Get all public settings
export const getPublicSettings = (): Record<string, any> => {
  const db = getDatabase();
  const settings = db.prepare('SELECT key, value, type FROM system_settings WHERE is_public = 1').all() as any[];
  
  const result: Record<string, any> = {};
  
  for (const setting of settings) {
    switch (setting.type) {
      case 'boolean':
        result[setting.key] = setting.value === 'true';
        break;
      case 'number':
        result[setting.key] = parseFloat(setting.value);
        break;
      case 'json':
        try {
          result[setting.key] = JSON.parse(setting.value);
        } catch {
          result[setting.key] = setting.value;
        }
        break;
      default:
        result[setting.key] = setting.value;
    }
  }
  
  return result;
};

export default {
  initializeDefaultData,
  getSystemSetting,
  setSystemSetting,
  getPublicSettings
};