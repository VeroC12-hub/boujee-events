// File: src/hooks/useAuth.ts
import { useContext, useEffect, useState } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

// Main useAuth hook that components are importing
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for components that require authentication
export function useRequireAuth(requiredRole?: 'admin' | 'organizer' | 'attendee') {
  const { user, profile, loading, error } = useAuth();
  
  const hasAccess = user && profile && (
    !requiredRole || 
    profile.role === requiredRole || 
    profile.role === 'admin'  // Admin has access to everything
  );

  return {
    user,
    profile,
    loading,
    error,
    hasAccess: Boolean(hasAccess),
    isAuthenticated: Boolean(user && profile),
    isAdmin: profile?.role === 'admin',
    isOrganizer: profile?.role === 'organizer',
    isAttendee: profile?.role === 'member'
  };
}

// Hook for sign in functionality
export function useSignIn() {
  const { signIn, loading, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      await signIn({ email, password });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    signIn: handleSignIn,
    loading: loading || isSubmitting,
    error
  };
}

// Hook for sign up functionality  
export function useSignUp() {
  const { signUp, loading, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => {
    try {
      setIsSubmitting(true);
      await signUp(userData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    signUp: handleSignUp,
    loading: loading || isSubmitting,
    error
  };
}

// Hook for sign out functionality
export function useSignOut() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsSigningOut(false);
    }
  };

  return {
    signOut: handleSignOut,
    loading: isSigningOut
  };
}

// Additional utility hooks that components might need
export function useAuthUser() {
  const { user } = useAuth();
  return user;
}

export function useAuthProfile() {
  const { profile } = useAuth();
  return profile;
}

export function useAuthLoading() {
  const { loading } = useAuth();
  return loading;
}

export function useAuthError() {
  const { error } = useAuth();
  return error;
}

export function useIsAuthenticated() {
  const { user, profile } = useAuth();
  return Boolean(user && profile);
}

export function useIsAdmin() {
  const { profile } = useAuth();
  return profile?.role === 'admin';
}

export function useIsOrganizer() {
  const { profile } = useAuth();
  return profile?.role === 'organizer';
}

export function useIsAttendee() {
  const { profile } = useAuth();
  return profile?.role === 'member';
}

// Hook for protected routes
export function useProtectedRoute(requiredRole?: 'admin' | 'organizer' | 'attendee') {
  const { user, profile, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        setShouldRedirect(true);
        return;
      }

      if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
        setShouldRedirect(true);
        return;
      }

      setShouldRedirect(false);
    }
  }, [user, profile, loading, requiredRole]);

  return {
    shouldRedirect,
    loading,
    user,
    profile,
    isAuthenticated: Boolean(user && profile),
    hasRequiredRole: !requiredRole || profile?.role === requiredRole || profile?.role === 'admin'
  };
}

// Hook for user profile management
export function useUserProfile() {
  const { user, profile, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (updates: Partial<any>) => {
    try {
      setIsUpdating(true);
      // This would call your profile update service
      // await profileService.updateProfile(user?.id, updates);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    user,
    profile,
    loading: loading || isUpdating,
    updateProfile,
    isUpdating
  };
}

// Default export for convenience
export default useAuth;
