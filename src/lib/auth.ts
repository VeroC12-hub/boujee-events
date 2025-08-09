// File: src/lib/auth.ts
import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  role: 'admin' | 'organizer' | 'member';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
  
  // Extended properties for UserProfile component
  stats?: {
    eventsAttended: number;
    totalSpent: number;
    reviewsLeft: number;
    favoriteEvents: number;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
    eventReminders: boolean;
    privacySettings: boolean;
  };
  socialProfile?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  loyaltyTier?: string;
  loyaltyPoints?: number;
  isVip?: boolean;
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

const MOCK_USERS = {
  'admin@nexacore-innovations.com': {
    password: 'NexaCore2024!',
    profile: {
      id: 'admin-nexacore',
      user_id: 'admin-nexacore',
      email: 'admin@nexacore-innovations.com',
      full_name: 'Nexacore Admin',
      name: 'Nexacore Admin',
      role: 'admin' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'admin@test.com': {
    password: 'TestAdmin2025',
    profile: {
      id: 'test-admin',
      user_id: 'test-admin',
      email: 'admin@test.com',
      full_name: 'Test Administrator',
      name: 'Test Administrator',
      role: 'admin' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'organizer@test.com': {
    password: 'TestOrganizer2025',
    profile: {
      id: 'test-organizer',
      user_id: 'test-organizer',
      email: 'organizer@test.com',
      full_name: 'Test Organizer',
      name: 'Test Organizer',
      role: 'organizer' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'member@test.com': {
    password: 'TestMember2025',
    profile: {
      id: 'test-member',
      user_id: 'test-member',
      email: 'member@test.com',
      full_name: 'Test Member',
      name: 'Test Member',
      role: 'member' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
};

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private currentProfile: UserProfile | null = null;
  private currentSession: Session | null = null;
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

  private async initialize(): Promise<void> {
    console.log('🔧 Initializing auth service...');
    
    if (isSupabaseConfigured() && supabase) {
      console.log('✅ Using Supabase authentication');
      await this.initializeSupabase();
    } else {
      console.log('⚠️ Supabase not configured, using mock authentication');
      this.initializeMockAuth();
    }
  }

  private async initializeSupabase(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase!.auth.getSession();
      
      if (error) {
        console.error('Supabase session error:', error);
      }

      if (session?.user) {
        this.currentUser = session.user;
        this.currentSession = session;
        await this.loadUserProfile(session.user);
      }

      supabase!.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          this.currentUser = session.user;
          this.currentSession = session;
          await this.loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          this.currentProfile = null;
          this.currentSession = null;
          this.clearStorage();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          this.currentSession = session;
        }
        
        this.notifyStateChange();
      });
    } catch (error) {
      console.error('Supabase initialization error:', error);
    }
  }

  private initializeMockAuth(): void {
    const storedUser = localStorage.getItem('boujee_auth_user');
    const storedProfile = localStorage.getItem('boujee_auth_profile');
    
    if (storedUser && storedProfile) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.currentProfile = JSON.parse(storedProfile);
        this.currentSession = {
          user: this.currentUser!,
          access_token: 'mock_token',
          refresh_token: 'mock_refresh',
          expires_in: 3600,
          expires_at: Date.now() / 1000 + 3600,
          token_type: 'bearer'
        } as Session;
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        this.clearStorage();
      }
    }
  }

  // NEW METHOD - Required by AuthContext
  async getSession(): Promise<Session | null> {
    try {
      if (!supabase) {
        return this.currentSession;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      this.currentSession = session;
      return session;
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  }

  // NEW METHOD - Required by AuthContext
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        return this.currentProfile;
      }
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error getting profile:', error);
        return null;
      }
      
      this.currentProfile = profile;
      return profile;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  // NEW METHOD - Required by UserProfile component
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        // Mock update
        const updatedProfile = {
          ...this.currentProfile,
          ...updates,
          updated_at: new Date().toISOString()
        } as UserProfile;
        
        this.currentProfile = updatedProfile;
        localStorage.setItem('boujee_auth_profile', JSON.stringify(updatedProfile));
        this.notifyStateChange();
        
        return updatedProfile;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      this.currentProfile = profile;
      this.notifyStateChange();
      
      return profile;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  }

  private async loadUserProfile(user: User): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        // Enhanced mock profile with all properties components expect
        const mockProfile: UserProfile = {
          id: `profile_${user.id}`,
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || '',
          avatar: user.user_metadata?.avatar_url || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          role: 'member' as const,
          status: 'approved' as const,
          phone: '',
          bio: '',
          
          // User stats
          stats: {
            eventsAttended: 0,
            totalSpent: 0,
            reviewsLeft: 0,
            favoriteEvents: 0
          },
          
          // User preferences
          preferences: {
            emailNotifications: true,
            pushNotifications: true,
            newsletter: false,
            eventReminders: true,
            privacySettings: false
          },
          
          // Social profile
          socialProfile: {
            twitter: '',
            instagram: '',
            linkedin: '',
            website: ''
          },
          
          // Loyalty program
          loyaltyTier: 'Bronze',
          loyaltyPoints: 0,
          isVip: false,
          
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        this.currentProfile = mockProfile;
        return mockProfile;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      this.currentProfile = profile;
      return profile;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  }

  async signIn(data: SignInData): Promise<{
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    error?: string;
  }> {
    try {
      if (supabase) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });

        if (error) {
          return { user: null, profile: null, session: null, error: error.message };
        }

        if (authData.user) {
          this.currentUser = authData.user;
          this.currentSession = authData.session;
          await this.loadUserProfile(authData.user);
        }

        return {
          user: this.currentUser,
          profile: this.currentProfile,
          session: this.currentSession
        };
      } else {
        // Mock authentication
        const mockUser = MOCK_USERS[data.email as keyof typeof MOCK_USERS];
        
        if (!mockUser || mockUser.password !== data.password) {
          return { 
            user: null, 
            profile: null, 
            session: null, 
            error: 'Invalid email or password' 
          };
        }

        const user = {
          id: mockUser.profile.id,
          email: data.email,
          user_metadata: { full_name: mockUser.profile.full_name },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;

        const session = {
          user,
          access_token: 'mock_token',
          refresh_token: 'mock_refresh',
          expires_in: 3600,
          expires_at: Date.now() / 1000 + 3600,
          token_type: 'bearer'
        } as Session;

        this.currentUser = user;
        this.currentProfile = mockUser.profile as UserProfile;
        this.currentSession = session;

        localStorage.setItem('boujee_auth_user', JSON.stringify(user));
        localStorage.setItem('boujee_auth_profile', JSON.stringify(mockUser.profile));

        return {
          user: this.currentUser,
          profile: this.currentProfile,
          session: this.currentSession
        };
      }
    } catch (error: any) {
      return { 
        user: null, 
        profile: null, 
        session: null, 
        error: error.message || 'Sign in failed' 
      };
    }
  }

  async signUp(data: SignUpData): Promise<{
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    error?: string;
  }> {
    try {
      if (supabase) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone
            }
          }
        });

        if (error) {
          return { user: null, profile: null, session: null, error: error.message };
        }

        if (authData.user) {
          this.currentUser = authData.user;
          this.currentSession = authData.session;
          
          // Create user profile
          const profileData = {
            user_id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            phone: data.phone,
            role: data.role || 'member',
            status: 'pending'
          };

          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();

          if (!profileError) {
            this.currentProfile = profile;
          }
        }

        return {
          user: this.currentUser,
          profile: this.currentProfile,
          session: this.currentSession
        };
      } else {
        // Mock signup
        const user = {
          id: `user_${Date.now()}`,
          email: data.email,
          user_metadata: { full_name: data.fullName },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;

        const profile: UserProfile = {
          id: `profile_${user.id}`,
          user_id: user.id,
          email: data.email,
          full_name: data.fullName,
          name: data.fullName,
          phone: data.phone,
          role: data.role || 'member',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.currentUser = user;
        this.currentProfile = profile;

        return {
          user: this.currentUser,
          profile: this.currentProfile,
          session: null
        };
      }
    } catch (error: any) {
      return { 
        user: null, 
        profile: null, 
        session: null, 
        error: error.message || 'Sign up failed' 
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      this.currentUser = null;
      this.currentProfile = null;
      this.currentSession = null;
      this.clearStorage();
      this.notifyStateChange();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('boujee_auth_user');
    localStorage.removeItem('boujee_auth_profile');
  }

  private notifyStateChange(): void {
    const state: AuthState = {
      user: this.currentUser,
      profile: this.currentProfile,
      session: this.currentSession,
      loading: false,
      error: null
    };

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
    
    callback({
      user: this.currentUser,
      profile: this.currentProfile,
      session: this.currentSession,
      loading: false,
      error: null
    });

    return () => {
      this.callbacks.delete(callback);
    };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  isSignedIn(): boolean {
    return Boolean(this.currentUser && this.currentProfile);
  }

  isAdmin(): boolean {
    return this.currentProfile?.role === 'admin' && this.currentProfile?.status === 'approved';
  }

  async refreshProfile(): Promise<void> {
    if (this.currentUser) {
      await this.loadUserProfile(this.currentUser);
      this.notifyStateChange();
    }
  }

  getDebugInfo(): any {
    return {
      hasSupabase: !!supabase,
      supabaseConfigured: isSupabaseConfigured(),
      hasUser: !!this.currentUser,
      hasProfile: !!this.currentProfile,
      hasSession: !!this.currentSession,
      userEmail: this.currentUser?.email,
      userRole: this.currentProfile?.role,
      userStatus: this.currentProfile?.status,
      environment: {
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        nodeEnv: import.meta.env.NODE_ENV
      }
    };
  }
}

export const authService = AuthService.getInstance();

export const getCurrentUser = () => authService.getCurrentUser();
export const getCurrentProfile = () => authService.getCurrentProfile();
export const getCurrentSession = () => authService.getCurrentSession();
export const signIn = (data: SignInData) => authService.signIn(data);
export const signUp = (data: SignUpData) => authService.signUp(data);
export const signOut = () => authService.signOut();
export const refreshProfile = () => authService.refreshProfile();
export const isAdmin = () => authService.isAdmin();
export const getAuthDebugInfo = () => authService.getDebugInfo();
