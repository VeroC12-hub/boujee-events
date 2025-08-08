import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRequireAuth } from '../hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'organizer' | 'attendee';
  fallbackPath?: string;
}

export function RequireAuth({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}: RequireAuthProps) {
  const location = useLocation();
  const { user, profile, loading, hasAccess } = useRequireAuth(requiredRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role: {requiredRole} | Your role: {profile?.role || 'none'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
