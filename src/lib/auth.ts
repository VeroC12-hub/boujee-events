import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

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

const MOCK_USERS = {
  'admin@nexacore-innovations.com': {
    password: 'NexaCore2024!',
    profile: {
      id: 'admin-nexacore',
      email: 'admin@nexacore-innovations.com',
      full_name: 'Nexacore Admin',
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
      email: 'admin@test.com',
      full_name: 'Test Administrator',
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
      email: 'organizer@test.com',
      full_name: 'Test Organizer',
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
      email: 'member@test.com',
      full_name: 'Test Member',
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
      console.error('Supabase initialization failed:', error);
      this.initializeMockAuth();
    }
  }

  private initializeMockAuth(): void {
    // Don't auto-restore session - require login
    console.log('Mock authentication ready - login required');
    this.clearStorage();
  }

  private async loadUserProfile(user: User): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Failed to load user profile from database:', error);
        this.currentProfile = this.createFallbackProfile(user);
      } else if (data) {
        this.currentProfile = data;
      }

      if (this.currentProfile) {
        localStorage.setItem('boujee_auth_user', JSON.stringify(user));
        localStorage.setItem('boujee_auth_profile', JSON.stringify(this.currentProfile));
      }

    } catch (error) {
      console.error('Error loading user profile:', error);
      this.currentProfile = this.createFallbackProfile(user);
    }
  }

  private createFallbackProfile(user: User): UserProfile {
    const mockUser = MOCK_USERS[user.email as keyof typeof MOCK_USERS];
    
    if (mockUser) {
      return { ...mockUser.profile, id: user.id };
    }

    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || user.email || '',
      role: user.email?.includes('admin') ? 'admin' : 'member',
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async signUp(data: SignUpData): Promise<{ user: any; error: string | null }> {
    console.log('📝 Sign up attempt:', data.email);
    
    if (!isSupabaseConfigured() || !supabase) {
      return { 
        user: null, 
        error: 'Sign up requires Supabase configuration.' 
      };
    }

    try {
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

      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            phone: data.phone || null,
            role: data.role || 'member',
            status: 'pending'
          });

        if (profileError) {
          console.warn('Profile creation failed, but signup succeeded:', profileError);
        }
      } catch (profileError) {
        console.warn('Profile creation error, but signup succeeded:', profileError);
      }

      return { user: authData.user, error: null };

    } catch (error) {
      console.error('Sign up failed:', error);
      return { user: null, error: 'Sign up failed. Please try again.' };
    }
  }

  async signIn(data: SignInData): Promise<{ user: any; error: string | null }> {
    console.log('🔐 Sign in attempt:', data.email);
    
    // Clear any existing session first
    this.clearStorage();
    
    // Try Supabase first if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (!authError && authData.user) {
          console.log('✅ Supabase authentication successful');
          this.currentUser = authData.user;
          this.currentSession = authData.session;
          await this.loadUserProfile(authData.user);
          
          if (this.currentProfile && this.currentProfile.status !== 'approved') {
            if (this.currentProfile.status === 'pending') {
              return { user: authData.user, error: 'Your account is pending approval.' };
            } else {
              await this.signOut();
              return { user: null, error: `Your account has been ${this.currentProfile.status}.` };
            }
          }

          this.notifyStateChange();
          return { user: authData.user, error: null };
        }
      } catch (error) {
        console.error('Supabase sign in failed:', error);
      }
    }

    // Mock authentication fallback with password validation
    console.log('🧪 Trying mock authentication...');
    const mockUser = MOCK_USERS[data.email as keyof typeof MOCK_USERS];
    
    // Check both email and password
    if (!mockUser || mockUser.password !== data.password) {
      console.log('❌ Invalid credentials');
      return { user: null, error: 'Invalid email or password' };
    }

    console.log('✅ Mock authentication successful');
    
    const user = {
      id: mockUser.profile.id,
      email: mockUser.profile.email,
      user_metadata: {
        full_name: mockUser.profile.full_name
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: mockUser.profile.created_at
    };

    this.currentUser = user;
    this.currentProfile = mockUser.profile;

    localStorage.setItem('boujee_auth_user', JSON.stringify(user));
    localStorage.setItem('boujee_auth_profile', JSON.stringify(mockUser.profile));

    this.notifyStateChange();
    return { user, error: null };
  }

  async signOut(): Promise<void> {
    console.log('🚪 Signing out...');
    
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase sign out error:', error);
        }
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    }
    
    this.currentUser = null;
    this.currentProfile = null;
    this.currentSession = null;
    this.clearStorage();
    this.notifyStateChange();
  }

  private clearStorage(): void {
    localStorage.removeItem('boujee_auth_user');
    localStorage.removeItem('boujee_auth_profile');
    sessionStorage.clear();
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

  // Add missing methods for AuthContext compatibility
  async getSession(): Promise<Session | null> {
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return null;
        }
        return data.session;
      } catch (error) {
        console.error('Error getting session:', error);
        return null;
      }
    }
    return this.currentSession;
  }

  async getProfile(userId?: string): Promise<UserProfile | null> {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return null;

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) {
          console.warn('Failed to load user profile from database:', error);
          return this.currentProfile;
        }
        return data;
      } catch (error) {
        console.error('Error getting profile:', error);
        return this.currentProfile;
      }
    }
    return this.currentProfile;
  }
}

export const authService = AuthService.getInstance();

export const getCurrentUser = () => authService.getCurrentUser();
export const getCurrentProfile = () => authService.getCurrentProfile();
export const getCurrentSession = () => authService.getCurrentSession();
export const getSession = () => authService.getSession();
export const getProfile = (userId?: string) => authService.getProfile(userId);
export const signIn = (data: SignInData) => authService.signIn(data);
export const signUp = (data: SignUpData) => authService.signUp(data);
export const signOut = () => authService.signOut();
export const refreshProfile = () => authService.refreshProfile();
export const isAdmin = () => authService.isAdmin();
export const getAuthDebugInfo = () => authService.getDebugInfo();
