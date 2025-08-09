import { useContext, useEffect, useState } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

// Main useAuth hook that components are importing
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for components that require authentication
export function useRequireAuth(requiredRole?: 'admin' | 'organizer' | 'member' | 'attendee') {
  const { user, loading } = useAuth();
  
  const hasAccess = user && (
    !requiredRole || 
    user.role === requiredRole || 
    user.role === 'admin'  // Admin has access to everything
  );

  return {
    user,
    profile: user,
    loading,
    hasAccess: Boolean(hasAccess),
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer',
    isMember: user?.role === 'member',
    isAttendee: user?.role === 'attendee'
  };
}

// Hook for sign in functionality
export function useSignIn() {
  const { signIn, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      const result = await signIn(email, password);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    signIn: handleSignIn,
    loading: loading || isSubmitting
  };
}

// Hook for sign up functionality  
export function useSignUp() {
  const { signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsSubmitting(true);
      const result = await signUp(email, password, fullName);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    signUp: handleSignUp,
    loading: loading || isSubmitting
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
  const { user } = useAuth();
  return Boolean(user);
}

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'admin';
}

export function useIsOrganizer() {
  const { user } = useAuth();
  return user?.role === 'organizer';
}

export function useIsMember() {
  const { user } = useAuth();
  return user?.role === 'member';
}

export function useIsAttendee() {
  const { user } = useAuth();
  return user?.role === 'attendee';
}

// Hook for protected routes
export function useProtectedRoute(requiredRole?: 'admin' | 'organizer' | 'member' | 'attendee') {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setShouldRedirect(true);
        return;
      }

      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        setShouldRedirect(true);
        return;
      }

      setShouldRedirect(false);
    }
  }, [user, loading, requiredRole]);

  return {
    shouldRedirect,
    loading,
    user,
    profile: user,
    isAuthenticated: Boolean(user),
    hasRequiredRole: !requiredRole || user?.role === requiredRole || user?.role === 'admin'
  };
}

// Hook for user profile management
export function useUserProfile() {
  const { user, updateProfile, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (updates: any) => {
    try {
      setIsUpdating(true);
      const result = await updateProfile(updates);
      return result;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    user,
    profile: user,
    loading: loading || isUpdating,
    updateProfile: handleUpdateProfile,
    isUpdating
  };
}

// Default export for convenience
export default useAuth;
