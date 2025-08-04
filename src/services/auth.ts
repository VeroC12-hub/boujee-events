// Enhanced authentication service with JWT support
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

class AuthService {
  private readonly JWT_SECRET = env.JWT_SECRET;
  private readonly JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
  private readonly BCRYPT_ROUNDS = env.BCRYPT_ROUNDS;

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  private generateToken(user: Omit<User, 'password'>): AuthToken {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(payload, this.JWT_SECRET, { 
      expiresIn: this.JWT_EXPIRES_IN 
    });

    // Calculate expiration date
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    return {
      token,
      expiresAt,
      user
    };
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<{ valid: boolean; user?: Omit<User, 'password'>; error?: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string; email: string; role: string };
      
      // Get current user data from database
      const user = await db.getUserById(decoded.userId);
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
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      } else {
        return { valid: false, error: 'Token verification failed' };
      }
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

  // Verify email (placeholder for future implementation)
  async verifyEmail(userId: string, verificationCode: string): Promise<AuthResult> {
    try {
      // In a real implementation, you'd verify the code against a stored verification token
      await db.updateUser(userId, { emailVerified: true });

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed'
      };
    }
  }

  // Reset password (placeholder for future implementation)
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await db.getUserByEmail(email.toLowerCase());
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        };
      }

      // In a real implementation, you'd:
      // 1. Generate a secure reset token
      // 2. Store it in the database with expiration
      // 3. Send email with reset link

      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
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
    }

    return result;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types
export type { AuthToken, LoginCredentials, RegisterData, AuthResult };