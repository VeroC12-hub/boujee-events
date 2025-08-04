// Browser-compatible authentication service (without Node.js dependencies)
import { env } from '../config/environment';
import { db } from './database';
import type { User } from '../types/database';

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: Omit<User, 'password'>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'member' | 'organizer';
}

export interface AuthResult {
  success: boolean;
  message: string;
  token?: AuthToken;
  user?: Omit<User, 'password'>;
}

// Simple browser-compatible hash function
const simpleHash = async (password: string, salt: string = ''): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Simple token generation
const generateSimpleToken = (userId: string, email: string, role: string): string => {
  const payload = {
    userId,
    email,
    role,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  // In production, use proper JWT with cryptographic signatures
  // For now, use base64 encoding with a simple signature
  const payloadStr = JSON.stringify(payload);
  const encoded = btoa(payloadStr);
  const signature = btoa(encoded + env.JWT_SECRET);
  
  return `${encoded}.${signature}`;
};

// Verify simple token
const verifySimpleToken = (token: string): { valid: boolean; payload?: Record<string, unknown>; error?: string } => {
  try {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    // Verify signature
    const expectedSignature = btoa(encoded + env.JWT_SECRET);
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }
    
    // Decode payload
    const payloadStr = atob(encoded);
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
};

class BrowserAuthService {
  private readonly SALT = 'boujee-events-salt';

  // Hash password using browser-compatible method
  private async hashPassword(password: string): Promise<string> {
    return simpleHash(password, this.SALT);
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hash = await this.hashPassword(password);
    return hash === hashedPassword;
  }

  // Generate authentication token
  private generateToken(user: Omit<User, 'password'>): AuthToken {
    const token = generateSimpleToken(user.id, user.email, user.role);
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

    return {
      token,
      expiresAt,
      user
    };
  }

  // Verify authentication token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: Omit<User, 'password'>; error?: string }> {
    try {
      const verification = verifySimpleToken(token);
      
      if (!verification.valid || !verification.payload) {
        return { valid: false, error: verification.error };
      }
      
      // Get current user data from database
      const user = await db.getUserById(verification.payload.userId as string);
      if (!user) {
        return { valid: false, error: 'User not found' };
      }

      if (user.status !== 'active') {
        return { valid: false, error: 'User account is inactive' };
      }

      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      return { valid: true, user: userWithoutPassword };
    } catch (error) {
      return { valid: false, error: 'Token verification failed' };
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user
      const userData = {
        email: data.email.toLowerCase(),
        name: data.name,
        password: hashedPassword,
        role: data.role || 'member' as const,
        avatar: undefined,
        emailVerified: false,
        status: 'active' as const,
        settings: {}
      };

      const newUser = await db.createUser(userData);
      
      // Remove password before generating token
      const { password, ...userWithoutPassword } = newUser;
      
      // Generate token
      const authToken = this.generateToken(userWithoutPassword);

      return {
        success: true,
        message: 'Registration successful',
        token: authToken,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await db.getUserByEmail(credentials.email.toLowerCase());
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check user status
      if (user.status !== 'active') {
        return {
          success: false,
          message: 'Account is inactive. Please contact support.'
        };
      }

      // Verify password
      if (!user.password) {
        return {
          success: false,
          message: 'Invalid login method. Please use social login.'
        };
      }

      const isPasswordValid = await this.verifyPassword(credentials.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Update last login
      await db.updateUser(user.id, { lastLogin: new Date() });

      // Remove password before generating token
      const { password, ...userWithoutPassword } = user;
      
      // Generate token
      const authToken = this.generateToken(userWithoutPassword);

      return {
        success: true,
        message: 'Login successful',
        token: authToken,
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // Refresh token
  async refreshToken(currentToken: string): Promise<AuthResult> {
    const verification = await this.verifyToken(currentToken);
    
    if (!verification.valid || !verification.user) {
      return {
        success: false,
        message: verification.error || 'Invalid token'
      };
    }

    // Generate new token
    const authToken = this.generateToken(verification.user);

    return {
      success: true,
      message: 'Token refreshed successfully',
      token: authToken,
      user: verification.user
    };
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = await db.getUserById(userId);
      if (!user || !user.password) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await db.updateUser(userId, { password: hashedNewPassword });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password. Please try again.'
      };
    }
  }

  // Check permissions
  hasPermission(user: Omit<User, 'password'>, permission: string): boolean {
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      organizer: ['events.create', 'events.update', 'events.delete', 'tickets.view', 'analytics.view'],
      member: ['tickets.view', 'profile.update']
    };

    const userPermissions = rolePermissions[user.role] || [];
    
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  // Create admin user (for development)
  async createAdminUser(): Promise<AuthResult> {
    const adminData: RegisterData = {
      email: env.ADMIN_EMAIL,
      password: 'admin123', // Change this in production
      name: 'Admin User',
      role: 'member' // Will be upgraded to admin
    };

    const result = await this.register(adminData);
    
    if (result.success && result.user) {
      // Upgrade to admin
      await db.updateUser(result.user.id, { role: 'admin' });
      // Update the returned user object
      result.user.role = 'admin';
    }

    return result;
  }
}

// Export singleton instance
export const authService = new BrowserAuthService();

// Export types
export type { AuthToken, LoginCredentials, RegisterData, AuthResult };