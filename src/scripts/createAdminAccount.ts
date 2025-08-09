/**
 * Script to create admin accounts for Boujee Events platform
 * This script should be run in a secure environment to create initial admin users
 */

import { supabase } from '../lib/supabase';

interface AdminUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'organizer' | 'member';
  status: 'approved' | 'pending';
  phone?: string;
  bio?: string;
}

interface CreateAdminResult {
  success: boolean;
  userId?: string;
  error?: string;
  message: string;
}

class AdminAccountCreator {
  private static instance: AdminAccountCreator;

  private constructor() {}

  public static getInstance(): AdminAccountCreator {
    if (!AdminAccountCreator.instance) {
      AdminAccountCreator.instance = new AdminAccountCreator();
    }
    return AdminAccountCreator.instance;
  }

  /**
   * Create a new admin account
   */
  async createAdminAccount(userData: AdminUserData): Promise<CreateAdminResult> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase not configured',
          message: 'Database connection not available. Please configure Supabase.'
        };
      }

      // Validate input data
      const validation = this.validateUserData(userData);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          message: validation.errors.join(', ')
        };
      }

      // Check if user already exists
      const existingUser = await this.checkUserExists(userData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User already exists',
          message: `A user with email ${userData.email} already exists.`
        };
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: 'Auth creation failed',
          message: authError?.message || 'Failed to create authentication user.'
        };
      }

      // Create profile in users table
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          status: userData.status,
          phone: userData.phone,
          bio: userData.bio,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await this.cleanupAuthUser(authData.user.id);
        return {
          success: false,
          error: 'Profile creation failed',
          message: profileError.message
        };
      }

      return {
        success: true,
        userId: authData.user.id,
        message: `Admin account created successfully for ${userData.email}`
      };

    } catch (error: any) {
      console.error('Error creating admin account:', error);
      return {
        success: false,
        error: 'Unexpected error',
        message: error.message || 'An unexpected error occurred.'
      };
    }
  }

  /**
   * Create multiple admin accounts in batch
   */
  async createMultipleAdmins(usersData: AdminUserData[]): Promise<CreateAdminResult[]> {
    const results: CreateAdminResult[] = [];

    for (const userData of usersData) {
      const result = await this.createAdminAccount(userData);
      results.push(result);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Update existing user to admin role
   */
  async promoteUserToAdmin(email: string): Promise<CreateAdminResult> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase not configured',
          message: 'Database connection not available.'
        };
      }

      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with email ${email}`
        };
      }

      // Update user role to admin
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (updateError) {
        return {
          success: false,
          error: 'Update failed',
          message: updateError.message
        };
      }

      return {
        success: true,
        userId: userData.id,
        message: `User ${email} promoted to admin successfully`
      };

    } catch (error: any) {
      return {
        success: false,
        error: 'Unexpected error',
        message: error.message || 'An unexpected error occurred.'
      };
    }
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(): Promise<{ success: boolean; admins?: any[]; error?: string }> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase not configured'
        };
      }

      const { data: admins, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        admins: admins || []
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch admin users'
      };
    }
  }

  /**
   * Delete admin account (use with caution)
   */
  async deleteAdminAccount(email: string): Promise<CreateAdminResult> {
    try {
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase not configured',
          message: 'Database connection not available.'
        };
      }

      // Find user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return {
          success: false,
          error: 'User not found',
          message: `No user found with email ${email}`
        };
      }

      // Delete user profile
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id);

      if (deleteError) {
        return {
          success: false,
          error: 'Delete failed',
          message: deleteError.message
        };
      }

      return {
        success: true,
        message: `Admin account ${email} deleted successfully`
      };

    } catch (error: any) {
      return {
        success: false,
        error: 'Unexpected error',
        message: error.message || 'An unexpected error occurred.'
      };
    }
  }

  /**
   * Validate user data before creation
   */
  private validateUserData(userData: AdminUserData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    // Password validation
    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Name validation
    if (!userData.full_name || userData.full_name.trim().length < 2) {
      errors.push('Full name is required');
    }

    // Role validation
    const validRoles = ['admin', 'organizer', 'member'];
    if (!validRoles.includes(userData.role)) {
      errors.push('Invalid role specified');
    }

    // Status validation
    const validStatuses = ['approved', 'pending'];
    if (!validStatuses.includes(userData.status)) {
      errors.push('Invalid status specified');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if user already exists
   */
  private async checkUserExists(email: string): Promise<boolean> {
    try {
      if (!supabase) return false;

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Clean up auth user if profile creation fails
   */
  private async cleanupAuthUser(userId: string): Promise<void> {
    try {
      if (!supabase) return;

      // Note: In production, you would need admin privileges to delete auth users
      // This is typically done through Supabase dashboard or admin API
      console.warn(`Auth user ${userId} created but profile failed. Manual cleanup required.`);
    } catch (error) {
      console.error('Failed to cleanup auth user:', error);
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

// Predefined admin accounts for initial setup
const DEFAULT_ADMIN_ACCOUNTS: AdminUserData[] = [
  {
    email: 'admin@nexacore-innovations.com',
    password: 'NexaCore2024!',
    full_name: 'Nexacore Admin',
    role: 'admin',
    status: 'approved',
    bio: 'Platform administrator for Nexacore Innovations'
  },
  {
    email: 'admin@boujeeevents.com',
    password: 'BoujeeAdmin2025!',
    full_name: 'Boujee Events Admin',
    role: 'admin',
    status: 'approved',
    bio: 'Primary platform administrator'
  },
  {
    email: 'superadmin@boujeeevents.com',
    password: 'SuperBoujee2025!',
    full_name: 'Super Administrator',
    role: 'admin',
    status: 'approved',
    bio: 'Super administrator with full platform access'
  }
];

// Export singleton instance and utility functions
export const adminAccountCreator = AdminAccountCreator.getInstance();

/**
 * Main function to create default admin accounts
 */
export async function createDefaultAdmins(): Promise<void> {
  console.log('🚀 Creating default admin accounts...');
  
  const results = await adminAccountCreator.createMultipleAdmins(DEFAULT_ADMIN_ACCOUNTS);
  
  console.log('\n📊 Results:');
  results.forEach((result, index) => {
    const account = DEFAULT_ADMIN_ACCOUNTS[index];
    if (result.success) {
      console.log(`✅ ${account.email}: ${result.message}`);
    } else {
      console.log(`❌ ${account.email}: ${result.message}`);
    }
  });
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n📈 Summary: ${successful} successful, ${failed} failed`);
}

/**
 * Create single admin account
 */
export async function createSingleAdmin(
  email: string,
  password: string,
  fullName: string,
  options?: { phone?: string; bio?: string }
): Promise<CreateAdminResult> {
  const userData: AdminUserData = {
    email,
    password,
    full_name: fullName,
    role: 'admin',
    status: 'approved',
    phone: options?.phone,
    bio: options?.bio
  };
  
  return await adminAccountCreator.createAdminAccount(userData);
}

/**
 * Promote existing user to admin
 */
export async function promoteToAdmin(email: string): Promise<CreateAdminResult> {
  return await adminAccountCreator.promoteUserToAdmin(email);
}

/**
 * List all admin users
 */
export async function listAdmins(): Promise<void> {
  console.log('👑 Fetching admin users...');
  
  const result = await adminAccountCreator.getAdminUsers();
  
  if (result.success && result.admins) {
    console.log(`\n📋 Found ${result.admins.length} admin users:`);
    result.admins.forEach((admin) => {
      console.log(`📧 ${admin.email} - ${admin.full_name} (${admin.status})`);
    });
  } else {
    console.log(`❌ Failed to fetch admins: ${result.error}`);
  }
}

// Export types and default data
export type { AdminUserData, CreateAdminResult };
export { DEFAULT_ADMIN_ACCOUNTS };

// If running as script (node environment)
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // This would be used when running the script directly
  console.log('🎪 Boujee Events Admin Account Creator');
  console.log('Use the exported functions to create admin accounts programmatically.');
}
