import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from './database';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'boujee-events-dev-secret-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

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

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT tokens
export const generateTokens = (user: User): AuthTokens => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'boujee-events',
    audience: 'boujee-events-app'
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' }, 
    JWT_SECRET, 
    { 
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'boujee-events',
      audience: 'boujee-events-app'
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days in seconds
  };
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'boujee-events',
      audience: 'boujee-events-app'
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const db = getDatabase();
  
  // Find user by email
  const userRow = db.prepare(`
    SELECT id, email, password_hash, name, phone, role, status, avatar, verified,
           join_date as joinDate, last_login as lastLogin, events_created as eventsCreated,
           events_attended as eventsAttended, total_spent as totalSpent
    FROM users 
    WHERE email = ? AND status != 'suspended'
  `).get(email) as any;

  if (!userRow) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, userRow.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  db.prepare(`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(userRow.id);

  // Create user object (excluding password_hash)
  const user: User = {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    phone: userRow.phone,
    role: userRow.role,
    status: userRow.status,
    avatar: userRow.avatar,
    verified: Boolean(userRow.verified),
    joinDate: userRow.joinDate,
    lastLogin: new Date().toISOString(),
    eventsCreated: userRow.eventsCreated || 0,
    eventsAttended: userRow.eventsAttended || 0,
    totalSpent: userRow.totalSpent || 0
  };

  // Generate tokens
  const tokens = generateTokens(user);

  return { user, tokens };
};

// Register user
export const registerUser = async (userData: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'member' | 'organizer';
}): Promise<LoginResponse> => {
  const db = getDatabase();
  
  // Check if user already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(userData.password);

  // Generate user ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Insert user
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, phone, role, status, verified)
    VALUES (?, ?, ?, ?, ?, ?, 'active', FALSE)
  `).run(
    userId,
    userData.email,
    passwordHash,
    userData.name,
    userData.phone || null,
    userData.role || 'member'
  );

  // Return login response
  return loginUser(userData.email, userData.password);
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const db = getDatabase();
  
  const userRow = db.prepare(`
    SELECT id, email, name, phone, role, status, avatar, verified,
           join_date as joinDate, last_login as lastLogin, events_created as eventsCreated,
           events_attended as eventsAttended, total_spent as totalSpent
    FROM users 
    WHERE id = ?
  `).get(userId) as any;

  if (!userRow) {
    return null;
  }

  return {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    phone: userRow.phone,
    role: userRow.role,
    status: userRow.status,
    avatar: userRow.avatar,
    verified: Boolean(userRow.verified),
    joinDate: userRow.joinDate,
    lastLogin: userRow.lastLogin,
    eventsCreated: userRow.eventsCreated || 0,
    eventsAttended: userRow.eventsAttended || 0,
    totalSpent: userRow.totalSpent || 0
  };
};

// Update user
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  const db = getDatabase();
  
  const allowedFields = ['name', 'phone', 'avatar', 'status'];
  const updateFields = Object.keys(updates)
    .filter(key => allowedFields.includes(key) && updates[key as keyof User] !== undefined)
    .map(key => `${key} = ?`);

  if (updateFields.length === 0) {
    return getUserById(userId);
  }

  const values = Object.keys(updates)
    .filter(key => allowedFields.includes(key) && updates[key as keyof User] !== undefined)
    .map(key => updates[key as keyof User]);

  values.push(userId);

  db.prepare(`
    UPDATE users 
    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(...values);

  return getUserById(userId);
};

// Change password
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  const db = getDatabase();
  
  // Get current password hash
  const userRow = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
  if (!userRow) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, userRow.password_hash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  db.prepare(`
    UPDATE users 
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newPasswordHash, userId);

  return true;
};

// Refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens> => {
  try {
    const payload = verifyToken(refreshToken);
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    const user = await getUserById(payload.id);
    if (!user || user.status === 'suspended') {
      throw new Error('User not found or suspended');
    }

    return generateTokens(user);
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Invalid refresh token');
  }
};

// Middleware function to verify authentication
export const verifyAuthentication = (token: string): User => {
  const payload = verifyToken(token);
  
  if (payload.type === 'refresh') {
    throw new Error('Cannot use refresh token for authentication');
  }

  return {
    id: payload.id,
    email: payload.email,
    name: '', // Will be populated from database if needed
    role: payload.role,
    status: payload.status,
    verified: false,
    joinDate: '',
    eventsCreated: 0,
    eventsAttended: 0,
    totalSpent: 0
  };
};

// Check permissions
export const hasPermission = (user: User, permission: string): boolean => {
  const rolePermissions = {
    admin: ['all'],
    organizer: ['event_management', 'attendee_management', 'analytics_view'],
    member: ['event_access', 'profile_management']
  };

  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes('all') || userPermissions.includes(permission);
};

export default {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyToken,
  loginUser,
  registerUser,
  getUserById,
  updateUser,
  changePassword,
  refreshAccessToken,
  verifyAuthentication,
  hasPermission
};