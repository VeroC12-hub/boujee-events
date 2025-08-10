// src/hooks/useAuth.ts - COMPLETE FULL IMPLEMENTATION
import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

// ================== MAIN USEAUTH HOOK ==================
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ================== AUTHENTICATION HOOKS ==================

// Hook for components that require authentication
export function useRequireAuth(requiredRole?: 'admin' | 'organizer' | 'member' | 'attendee') {
  const { user, profile, loading, isAuthenticated, hasRole } = useAuth();
  
  const hasAccess = user && profile && (
    !requiredRole || 
    hasRole(requiredRole) || 
    profile.role === 'admin'  // Admin has access to everything
  );

  return {
    user,
    profile,
    loading,
    hasAccess: Boolean(hasAccess),
    isAuthenticated: isAuthenticated(),
    isAdmin: profile?.role === 'admin',
    isOrganizer: profile?.role === 'organizer',
    isMember: profile?.role === 'member',
    isAttendee: profile?.role === 'attendee',
    userRole: profile?.role,
    userStatus: profile?.status
  };
}

// Hook for sign in functionality
export function useSignIn() {
  const { signIn, loading, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string>('');

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      setSignInError('');
      clearError();
      
      const result = await signIn(email, password);
      
      if (!result.success && result.error) {
        setSignInError(result.error);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during sign in';
      setSignInError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  }, [signIn, clearError]);

  const clearSignInError = useCallback(() => {
    setSignInError('');
    clearError();
  }, [clearError]);

  return {
    signIn: handleSignIn,
    loading: loading || isSubmitting,
    error: signInError || error,
    clearError: clearSignInError,
    isSubmitting
  };
}

// Hook for sign up functionality  
export function useSignUp() {
  const { signUp, loading, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signUpError, setSignUpError] = useState<string>('');

  const handleSignUp = useCallback(async (email: string, password: string, userData: any = {}) => {
    try {
      setIsSubmitting(true);
      setSignUpError('');
      clearError();
      
      const result = await signUp(email, password, userData);
      
      if (!result.success && result.error) {
        setSignUpError(result.error);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during sign up';
      setSignUpError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  }, [signUp, clearError]);

  const clearSignUpError = useCallback(() => {
    setSignUpError('');
    clearError();
  }, [clearError]);

  return {
    signUp: handleSignUp,
    loading: loading || isSubmitting,
    error: signUpError || error,
    clearError: clearSignUpError,
    isSubmitting
  };
}

// Hook for sign out functionality
export function useSignOut() {
  const { signOut, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string>('');

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      setSignOutError('');
      await signOut();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during sign out';
      setSignOutError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  return {
    signOut: handleSignOut,
    loading: loading || isSigningOut,
    error: signOutError,
    isSigningOut
  };
}

// Hook for password reset functionality
export function usePasswordReset() {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string>('');
  const [resetMessage, setResetMessage] = useState<string>('');

  const handlePasswordReset = useCallback(async (email: string) => {
    try {
      setIsSubmitting(true);
      setResetError('');
      setResetMessage('');
      clearError();
      
      const result = await resetPassword(email);
      
      if (result.success) {
        setResetMessage(result.message || 'Password reset email sent successfully');
      } else if (result.error) {
        setResetError(result.error);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setResetError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  }, [resetPassword, clearError]);

  const clearMessages = useCallback(() => {
    setResetError('');
    setResetMessage('');
    clearError();
  }, [clearError]);

  return {
    resetPassword: handlePasswordReset,
    loading: loading || isSubmitting,
    error: resetError || error,
    message: resetMessage,
    clearMessages,
    isSubmitting
  };
}

// ================== UTILITY HOOKS ==================

// Hook for user data
export function useAuthUser() {
  const { user } = useAuth();
  return user;
}

// Hook for user profile
export function useAuthProfile() {
  const { profile, refreshProfile } = useAuth();
  return { profile, refreshProfile };
}

// Hook for loading state
export function useAuthLoading() {
  const { loading, initialized } = useAuth();
  return { loading, initialized };
}

// Hook for error state
export function useAuthError() {
  const { error, clearError } = useAuth();
  return { error, clearError };
}

// Hook for authentication status
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated();
}

// Hook for admin status
export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin();
}

// Hook for organizer status
export function useIsOrganizer() {
  const { isOrganizer } = useAuth();
  return isOrganizer();
}

// Hook for member status
export function useIsMember() {
  const { isMember } = useAuth();
  return isMember();
}

// Hook for role checking
export function useHasRole(role: string) {
  const { hasRole } = useAuth();
  return hasRole(role);
}

// Hook for permission checking
export function useHasPermission(permission: string) {
  const { checkPermission } = useAuth();
  return checkPermission(permission);
}

// ================== ADVANCED HOOKS ==================

// Hook for protected routes
export function useProtectedRoute(requiredRole?: 'admin' | 'organizer' | 'member' | 'attendee') {
  const { user, profile, loading, initialized, isAuthenticated, hasRole } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectReason, setRedirectReason] = useState<string>('');

  useEffect(() => {
    if (!loading && initialized) {
      if (!isAuthenticated()) {
        setShouldRedirect(true);
        setRedirectReason('not_authenticated');
        return;
      }

      if (requiredRole && !hasRole(requiredRole) && profile?.role !== 'admin') {
        setShouldRedirect(true);
        setRedirectReason('insufficient_permissions');
        return;
      }

      if (profile?.status !== 'approved') {
        setShouldRedirect(true);
        setRedirectReason('account_not_approved');
        return;
      }

      setShouldRedirect(false);
      setRedirectReason('');
    }
  }, [user, profile, loading, initialized, requiredRole, isAuthenticated, hasRole]);

  return {
    shouldRedirect,
    redirectReason,
    loading: loading || !initialized,
    user,
    profile,
    isAuthenticated: isAuthenticated(),
    hasRequiredRole: !requiredRole || hasRole(requiredRole) || profile?.role === 'admin'
  };
}

// Hook for user profile management
export function useUserProfile() {
  const { user, profile, updateProfile, refreshProfile, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleUpdateProfile = useCallback(async (updates: any) => {
    try {
      setIsUpdating(true);
      setUpdateError('');
      setUpdateSuccess(false);
      
      const result = await updateProfile(updates);
      
      if (result.success) {
        setUpdateSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else if (result.error) {
        setUpdateError(result.error);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during profile update';
      setUpdateError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsUpdating(false);
    }
  }, [updateProfile]);

  const clearMessages = useCallback(() => {
    setUpdateError('');
    setUpdateSuccess(false);
  }, []);

  return {
    user,
    profile,
    loading: loading || isUpdating,
    updateProfile: handleUpdateProfile,
    refreshProfile,
    isUpdating,
    updateError,
    updateSuccess,
    clearMessages
  };
}

// Hook for session management
export function useSession() {
  const { session, user, loading, initialized } = useAuth();
  
  const isSessionValid = Boolean(session && user);
  const sessionExpiry = session ? new Date(Date.now() + (session.expires_in * 1000)) : null;
  const isSessionExpired = sessionExpiry ? sessionExpiry <= new Date() : false;

  return {
    session,
    isSessionValid,
    sessionExpiry,
    isSessionExpired,
    loading,
    initialized
  };
}

// Hook for debugging auth state
export function useAuthDebug() {
  const { getDebugInfo } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDebugInfo(getDebugInfo());
    }
  }, [getDebugInfo]);

  return debugInfo;
}

// ================== FORM HOOKS ==================

// Hook for login form
export function useLoginForm() {
  const { signIn } = useSignIn();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return { success: false, error: 'Please fix form errors' };
    }
    
    return await signIn(formData.email, formData.password);
  }, [formData, validateForm, signIn]);

  const resetForm = useCallback(() => {
    setFormData({ email: '', password: '' });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    handleSubmit,
    resetForm,
    isValid: Object.keys(errors).length === 0 && formData.email && formData.password
  };
}

// Hook for signup form
export function useSignupForm() {
  const { signUp } = useSignUp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return { success: false, error: 'Please fix form errors' };
    }
    
    return await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      phone: formData.phone
    });
  }, [formData, validateForm, signUp]);

  const resetForm = useCallback(() => {
    setFormData({ 
      email: '', 
      password: '', 
      confirmPassword: '', 
      fullName: '', 
      phone: '' 
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    updateField,
    handleSubmit,
    resetForm,
    isValid: Object.keys(errors).length === 0 && 
             formData.email && 
             formData.password && 
             formData.confirmPassword && 
             formData.fullName
  };
}

// ================== DEFAULT EXPORT ==================
export default useAuth;
