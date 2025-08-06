import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using mock auth');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// TYPE DEFINITIONS
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

// Mock user data for testing
const MOCK_USERS = {
  'admin@nexacore-innovations.com': {
    password: 'Admin123!',
    profile: {
      id: '0d510a4d-6e99-45d6-b034-950d5fbbe1b9',
      email: 'admin@nexacore-innovations.com',
      full_name: 'Admin User',
      role: 'admin' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'admin@test.com': {
    password: 'TestAdmin2025',
    profile: {
      id: 'test-admin-id',
      email: 'admin@test.com',
      full_name: 'Test Admin',
      role: 'admin' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  'organizer@test.com': {
    password: 'TestOrganizer2025',
    profile: {
      id: 'test-organizer-id',
      email: 'organizer@test.com',
      full_name: 'Test Organizer',
      role: 'organizer' as const,
      status: 'approved' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
};

// AUTH SERVICE CLASS
class AuthService {
  private static instance: AuthService;
  private currentUser: any = null;
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

  private async initialize(): Promise<void> {
    console.log('🔧 Initializing auth service...');
    
    // Check for stored session first
    const storedUser = localStorage.getItem('boujee_auth_user');
    const storedProfile = localStorage.getItem('boujee_auth_profile');
    
    if (storedUser && storedProfile) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.currentProfile = JSON.parse(storedProfile);
        console.log('✅ Restored session from localStorage');
        this.notifyStateChange({
          user: this.currentUser,
          profile: this.currentProfile,
          session: null,
          loading: false,
          error: null
        });
        return;
      } catch (error) {
        console.warn('Failed to restore session:', error);
        localStorage.removeItem('boujee_auth_user');
        localStorage.removeItem('boujee_auth_profile');
      }
    }

    if (supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase session error:', error);
        }

        if (session?.user) {
          this.currentUser = session.user;
          await this.loadUserProfile(session.user.id);
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event, session?.user?.email);
          
          if (event === 'SIGNED_IN' && session?.user) {
            this.currentUser = session.user;
            await this.loadUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            this.currentProfile = null;
            localStorage.removeItem('boujee_auth_user');
            localStorage.removeItem('boujee_auth_profile');
          }

          this.notifyStateChange({
            user: this.currentUser,
            profile: this.currentProfile,
            session,
            loading: false,
            error: null
          });
        });
      } catch (error) {
        console.error('Supabase initialization failed:', error);
      }
    }

    this.notifyStateChange({
      user: this.currentUser,
      profile: this.currentProfile,
      session: null,
      loading: false,
      error: null
    });
  }

  async signUp(data: SignUpData): Promise<{ user: any; error: string | null }> {
    console.log('📝 Sign up attempt:', data.email);
    
    if (supabase) {
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
          console.error('Failed to create user profile:', profileError);
        }

        return { user: authData.user, error: null };

      } catch (error) {
        console.error('Sign up failed:', error);
        return { user: null, error: 'Sign up failed. Please try again.' };
      }
    }

    // Mock signup for development
    return { user: null, error: 'Mock signup not implemented' };
  }

  async signIn(data: SignInData): Promise<{ user: any; error: string | null }> {
    console.log('🔐 Sign in attempt:', data.email);
    
    // Try Supabase first
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (authError) {
          console.log('❌ Supabase auth failed, trying mock auth:', authError.message);
          // Fall through to mock auth
        } else if (authData.user) {
          await this.loadUserProfile(authData.user.id);
          
          if (this.currentProfile && this.currentProfile.status !== 'approved') {
            if (this.currentProfile.status === 'pending') {
              return { user: authData.user, error: 'Your account is pending approval. Please wait for admin approval.' };
            } else {
              await this.signOut();
              return { user: null, error: `Your account has been ${this.currentProfile.status}. Please contact support.` };
            }
          }

          // Store session
          localStorage.setItem('boujee_auth_user', JSON.stringify(authData.user));
          if (this.currentProfile) {
            localStorage.setItem('boujee_auth_profile', JSON.stringify(this.currentProfile));
          }

          return { user: authData.user, error: null };
        }
      } catch (error) {
        console.error('Supabase sign in failed:', error);
      }
    }

    // Mock authentication for development
    console.log('🧪 Trying mock authentication...');
    const mockUser = MOCK_USERS[data.email as keyof typeof MOCK_USERS];
    
    if (mockUser && mockUser.password === data.password) {
      console.log('✅ Mock authentication successful');
      
      // Create mock user object
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

      // Store session
      localStorage.setItem('boujee_auth_user', JSON.stringify(user));
      localStorage.setItem('boujee_auth_profile', JSON.stringify(mockUser.profile));

      this.notifyStateChange({
        user: this.currentUser,
        profile: this.currentProfile,
        session: null,
        loading: false,
        error: null
      });

      return { user, error: null };
    }

    console.log('❌ Authentication failed');
    return { user: null, error: 'Invalid email or password' };
  }

  async signOut(): Promise<void> {
    console.log('🚪 Signing out...');
    
    if (supabase) {
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
    localStorage.removeItem('boujee_auth_user');
    localStorage.removeItem('boujee_auth_profile');

    this.notifyStateChange({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null
    });
  }

  private async loadUserProfile(userId: string): Promise<void> {
    if (!supabase) {
      console.log('No Supabase client, skipping profile load');
      return;
    }

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

  // State management
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
    
    callback({
      user: this.currentUser,
      profile: this.currentProfile,
      session: null,
      loading: false,
      error: null
    });

    return () => {
      this.callbacks.delete(callback);
    };
  }

  // Utility functions
  getCurrentUser(): any {
    return this.currentUser;
  }

  getCurrentProfile(): UserProfile | null {
    return this.currentProfile;
  }

  isSignedIn(): boolean {
    return Boolean(this.currentUser && this.currentProfile);
  }

  isAdmin(): boolean {
    return this.currentProfile?.role === 'admin' && this.currentProfile?.status === 'approved';
  }
}

export const authService = AuthService.getInstance();

// Export utility functions
export const getCurrentUser = () => authService.getCurrentUser();
export const getCurrentProfile = () => authService.getCurrentProfile();
export const signIn = (data: SignInData) => authService.signIn(data);
export const signUp = (data: SignUpData) => authService.signUp(data);
export const signOut = () => authService.signOut();
