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
          await this.loadUserProfileWithRetry(session.user.id);
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔄 Auth state changed:', event, session?.user?.email);
          
          if (event === 'SIGNED_IN' && session?.user) {
            this.currentUser = session.user;
            await this.loadUserProfileWithRetry(session.user.id);
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

        // Create profile using the safe method
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
          // Don't fail the signup if profile creation fails
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
          console.log('✅ Supabase authentication successful');
          
          // Load profile with retry logic for RLS issues
          await this.loadUserProfileWithRetry(authData.user.id, 5);
          
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

  // Enhanced loadUserProfile with multiple fallback strategies
  private async loadUserProfileWithRetry(userId: string, maxRetries: number = 3): Promise<void> {
    console.log(`🔍 Loading user profile for: ${userId} (max retries: ${maxRetries})`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}`);
        
        // Strategy 1: Direct query
        if (attempt <= 2) {
          await this.loadUserProfileDirect(userId);
          if (this.currentProfile) {
            console.log(`✅ Profile loaded successfully via direct query on attempt ${attempt}`);
            return;
          }
        }
        
        // Strategy 2: Use helper function
        if (attempt >= 2) {
          await this.loadUserProfileViaFunction(userId);
          if (this.currentProfile) {
            console.log(`✅ Profile loaded successfully via function on attempt ${attempt}`);
            return;
          }
        }
        
      } catch (error: any) {
        console.warn(`Profile load attempt ${attempt} failed:`, error);
        
        // If it's an RLS recursion error, skip direct attempts and try functions
        if (error?.code === '42P17' || error?.message?.includes('recursion')) {
          console.log('🔄 RLS recursion detected, switching to function-based approach...');
          try {
            await this.loadUserProfileViaFunction(userId);
            if (this.currentProfile) {
              console.log(`✅ Profile loaded successfully via function after RLS error`);
              return;
            }
          } catch (funcError) {
            console.error('Function-based profile load also failed:', funcError);
          }
        }
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('❌ Failed to load profile after all retry attempts');
    this.currentProfile = null;
  }

  // Direct profile loading method
  private async loadUserProfileDirect(userId: string): Promise<void> {
    if (!supabase) {
      console.log('No Supabase client, skipping profile load');
      return;
    }

    console.log('🔍 Attempting direct profile load...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Direct profile load failed:', error);
      throw error;
    }

    if (data) {
      this.currentProfile = data;
      console.log('✅ Direct profile load successful:', data.role);
    } else {
      console.warn('No profile data returned from direct query');
    }
  }

  // Function-based profile loading method (bypasses RLS)
  private async loadUserProfileViaFunction(userId: string): Promise<void> {
    if (!supabase) {
      console.log('No Supabase client, skipping profile load');
      return;
    }

    console.log('🔍 Attempting function-based profile load...');
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile', { user_id: userId });

      if (error) {
        console.error('Function-based profile load failed:', error);
        throw error;
      }

      if (data && data.length > 0) {
        this.currentProfile = data[0];
        console.log('✅ Function-based profile load successful:', data[0].role);
      } else {
        console.warn('No profile data returned from function');
      }
    } catch (error) {
      console.error('RPC call failed:', error);
      throw error;
    }
  }

  // Helper function to check admin status safely
  async isAdmin(): Promise<boolean> {
    // First check loaded profile
    if (this.currentProfile?.role === 'admin') {
      return true;
    }

    // If no profile or not admin, try database check
    if (this.currentUser && supabase) {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) {
          console.warn('Admin check failed:', error);
          return false;
        }
        return data === true;
      } catch (error) {
        console.warn('Admin RPC call failed:', error);
        return false;
      }
    }

    return false;
  }

  // Get current user role safely
  async getCurrentUserRole(): Promise<string> {
    if (this.currentProfile?.role) {
      return this.currentProfile.role;
    }

    if (this.currentUser && supabase) {
      try {
        const { data, error } = await supabase.rpc('current_user_role');
        if (error) {
          console.warn('Role check failed:', error);
          return 'member';
        }
        return data || 'member';
      } catch (error) {
        console.warn('Role RPC call failed:', error);
        return 'member';
      }
    }

    return 'member';
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
    
    // Immediately call with current state
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

  // Synchronous admin check (uses loaded profile only)
  isAdminSync(): boolean {
    return this.currentProfile?.role === 'admin' && this.currentProfile?.status === 'approved';
  }

  // Force refresh profile
  async refreshProfile(): Promise<void> {
    if (this.currentUser) {
      await this.loadUserProfileWithRetry(this.currentUser.id);
      
      // Update stored profile
      if (this.currentProfile) {
        localStorage.setItem('boujee_auth_profile', JSON.stringify(this.currentProfile));
      }
      
      // Notify state change
      this.notifyStateChange({
        user: this.currentUser,
        profile: this.currentProfile,
        session: null,
        loading: false,
        error: null
      });
    }
  }

  // Debug helper
  getDebugInfo(): any {
    return {
      hasSupabase: !!supabase,
      hasUser: !!this.currentUser,
      hasProfile: !!this.currentProfile,
      userEmail: this.currentUser?.email,
      userRole: this.currentProfile?.role,
      userStatus: this.currentProfile?.status,
      storedUserExists: !!localStorage.getItem('boujee_auth_user'),
      storedProfileExists: !!localStorage.getItem('boujee_auth_profile')
    };
  }
}

// Create singleton instance
export const authService = AuthService.getInstance();

// Export utility functions
export const getCurrentUser = () => authService.getCurrentUser();
export const getCurrentProfile = () => authService.getCurrentProfile();
export const signIn = (data: SignInData) => authService.signIn(data);
export const signUp = (data: SignUpData) => authService.signUp(data);
export const signOut = () => authService.signOut();
export const refreshProfile = () => authService.refreshProfile();
export const isAdmin = () => authService.isAdmin();
export const getCurrentUserRole = () => authService.getCurrentUserRole();
export const getAuthDebugInfo = () => authService.getDebugInfo();
