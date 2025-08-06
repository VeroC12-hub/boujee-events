// =====================================================
// AUTH SERVICE - BUILD ERROR FIXED
// Replace ENTIRE src/lib/auth.ts file with this code
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  role: 'admin' | 'organizer' | 'member';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'organizer' | 'member';
}

export interface SignInData {
  email: string;
  password: string;
}

// =====================================================
// AUTH SERVICE CLASS
// =====================================================

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private currentProfile: UserProfile | null = null;
  private callbacks: Set<(state: AuthState) => void> = new Set();

  private constructor() {
    this.initialize();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  private async initialize(): Promise<void> {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Failed to get session:', error);
        this.notifyStateChange({ user: null, profile: null, session: null, loading: false, error: error.message });
        return;
      }

      if (session?.user) {
        this.currentUser = session.user;
        await this.loadUserProfile(session.user.id);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          this.currentUser = session.user;
          await this.loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          this.currentProfile = null;
        }

        this.notifyStateChange({
          user: this.currentUser,
          profile: this.currentProfile,
          session,
          loading: false,
          error: null
        });
      });

      this.notifyStateChange({
        user: this.currentUser,
        profile: this.currentProfile,
        session,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.notifyStateChange({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: 'Authentication initialization failed'
      });
    }
  }

  // =====================================================
  // USER AUTHENTICATION
  // =====================================================

  async signUp(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone || null,
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Sign up failed - no user returned' };
      }

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone || null,
          role: data.role || 'member',
          status: 'pending' // Always pending for admin approval
        });

      if (profileError) {
        console.error('Failed to create user profile:', profileError);
        // Don't return error here - auth was successful
      }

      // Create user settings
      await supabase
        .from('user_settings')
        .insert({
          user_id: authData.user.id,
        });

      return { user: authData.user, error: null };

    } catch (error) {
      console.error('Sign up failed:', error);
      return { user: null, error: 'Sign up failed. Please try again.' };
    }
  }

  async signIn(data: SignInData): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Sign in failed - no user returned' };
      }

      // Load user profile
      await this.loadUserProfile(authData.user.id);

      // Check if user is approved
      if (this.currentProfile && this.currentProfile.status !== 'approved') {
        if (this.currentProfile.status === 'pending') {
          return { user: authData.user, error: 'Your account is pending approval. Please wait for admin approval.' };
        } else if (this.currentProfile.status === 'rejected') {
          await this.signOut(); // Sign them out
          return { user: null, error: 'Your account has been rejected. Please contact support.' };
        } else if (this.currentProfile.status === 'suspended') {
          await this.signOut(); // Sign them out
          return { user: null, error: 'Your account has been suspended. Please contact support.' };
        }
      }

      return { user: authData.user, error: null };

    } catch (error) {
      console.error('Sign in failed:', error);
      return { user: null, error: 'Sign in failed. Please try again.' };
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      this.currentUser = null;
      this.currentProfile = null;
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  // =====================================================
  // USER PROFILE MANAGEMENT
  // =====================================================

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Failed to load user profile:', error);
        this.currentProfile = null;
        return;
      }

      this.currentProfile = data;
    } catch (error) {
      console.error('Load profile failed:', error);
      this.currentProfile = null;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<{ error: string | null }> {
    try {
      if (!this.currentUser) {
        return { error: 'No user signed in' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', this.currentUser.id);

      if (error) {
        return { error: error.message };
      }

      // Reload profile
      await this.loadUserProfile(this.currentUser.id);
      
      this.notifyStateChange({
        user: this.currentUser,
        profile: this.currentProfile,
        session: await this.getSession(),
        loading: false,
        error: null
      });

      return { error: null };

    } catch (error) {
      console.error('Update profile failed:', error);
      return { error: 'Failed to update profile' };
    }
  }

  // =====================================================
  // ADMIN FUNCTIONS
  // =====================================================

  async approveUser(userId: string): Promise<{ error: string | null }> {
    try {
      if (!this.isAdmin()) {
        return { error: 'Unauthorized - Admin access required' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };

    } catch (error) {
      console.error('Approve user failed:', error);
      return { error: 'Failed to approve user' };
    }
  }

  async getPendingUsers(): Promise<{ users: UserProfile[]; error: string | null }> {
    try {
      if (!this.isAdmin()) {
        return { users: [], error: 'Unauthorized - Admin access required' };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        return { users: [], error: error.message };
      }

      return { users: data || [], error: null };

    } catch (error) {
      console.error('Get pending users failed:', error);
      return { users: [], error: 'Failed to load pending users' };
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session failed:', error);
      return null;
    }
  }

  isSignedIn(): boolean {
    return Boolean(this.currentUser && this.currentProfile);
  }

  isAdmin(): boolean {
    return this.currentProfile?.role === 'admin' && this.currentProfile?.status === 'approved';
  }

  isOrganizer(): boolean {
    return (
      (this.currentProfile?.role === 'organizer' || this.currentProfile?.role === 'admin') &&
      this.currentProfile?.status === 'approved'
    );
  }

  isMember(): boolean {
    return Boolean(this.currentProfile?.status === 'approved');
  }

  isPending(): boolean {
    return this.currentProfile?.status === 'pending';
  }

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  private notifyStateChange(state: AuthState): void {
    this.callbacks.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Auth state callback error:', error);
      }
    });
  }

  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.callbacks.add(callback);
    
    // Call immediately with current state
    callback({
      user: this.currentUser,
      profile: this.currentProfile,
      session: null, // Will be set by async call
      loading: false,
      error: null
    });

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }
}

// =====================================================
// EXPORTS
// =====================================================

export const authService = AuthService.getInstance();

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export const signUp = (data: SignUpData) => authService.signUp(data);
export const signIn = (data: SignInData) => authService.signIn(data);
export const signOut = () => authService.signOut();
export const getCurrentUser = () => authService.getCurrentUser();
export const getCurrentProfile = () => authService.getCurrentProfile();
export const isSignedIn = () => authService.isSignedIn();
export const isAdmin = () => authService.isAdmin();
export const isOrganizer = () => authService.isOrganizer();
export const updateProfile = (updates: Partial<UserProfile>) => authService.updateProfile(updates);

// =====================================================
// USAGE EXAMPLES:
//
// import { authService, signIn, signUp, isAdmin } from '../lib/auth';
//
// // Sign in
// const { user, error } = await signIn({ email: 'user@example.com', password: 'password' });
//
// // Sign up
// const { user, error } = await signUp({
//   email: 'user@example.com',
//   password: 'password',
//   fullName: 'John Doe',
//   role: 'organizer'
// });
//
// // Check permissions
// if (isAdmin()) {
//   // Admin-only functionality
// }
// =====================================================
