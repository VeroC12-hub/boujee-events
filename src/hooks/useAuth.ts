import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(requiredRole?: 'admin' | 'organizer' | 'attendee') {
  const { user, profile, loading } = useAuth();
  
  const hasAccess = () => {
    if (!user) return false;
    if (!requiredRole) return true;
    return profile?.role === requiredRole || profile?.role === 'admin';
  };

  return {
    user,
    profile,
    loading,
    hasAccess: hasAccess(),
    isAdmin: profile?.role === 'admin',
    isOrganizer: profile?.role === 'organizer',
    isAttendee: profile?.role === 'attendee'
  };
}
