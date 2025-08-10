// src/components/auth/ProtectedRoute.tsx - Complete route protection with role-based access
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// === LOADING SPINNER COMPONENT ===
const LoadingSpinner: React.FC<{ 
  fullScreen?: boolean; 
  message?: string 
}> = ({ 
  fullScreen = false, 
  message = 'Loading...' 
}) => (
  <div className={
    fullScreen 
      ? 'min-h-screen flex items-center justify-center bg-gray-900' 
      : 'flex items-center justify-center p-8'
  }>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// === ACCESS DENIED COMPONENT ===
const AccessDenied: React.FC<{
  requiredRoles?: string[];
  userRole?: string;
  userName?: string;
  customMessage?: string;
}> = ({ 
  requiredRoles = [], 
  userRole = 'Unknown', 
  userName = 'User',
  customMessage 
}) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="max-w-lg w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
      <div className="text-6xl mb-6">🚫</div>
      <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        {customMessage || 'You don\'t have permission to access this area.'}
      </p>
      
      {/* Role Information */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-red-300 font-semibold mb-1">Your Role</p>
            <p className="text-red-200 capitalize">{userRole}</p>
          </div>
          <div>
            <p className="text-red-300 font-semibold mb-1">Required Roles</p>
            <p className="text-red-200">{requiredRoles.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <p className="text-blue-200 text-sm">
          Currently logged in as: <strong>{userName}</strong>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ← Go Back
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors font-semibold"
        >
          Go Home
        </button>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 mt-6">
        {new Date().toISOString().replace('T', ' ').split('.')[0]} UTC | Boujee Events Security
      </p>
    </div>
  </div>
);

// === BASIC PROTECTED ROUTE (Authentication only) ===
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  redirectTo = '/login'
}) => {
  const { user, profile, loading, error } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile, 
    userRole: profile?.role,
    path: location.pathname 
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('⏳ ProtectedRoute: Loading authentication...');
    return (
      <LoadingSpinner 
        fullScreen 
        message="Checking authentication..." 
      />
    );
  }

  // Show error state if there's an authentication error
  if (error) {
    console.log('❌ ProtectedRoute: Authentication error:', error);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    console.log('❌ ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated, show content
  console.log('✅ ProtectedRoute: Access granted');
  return <>{fallback || children}</>;
};

// === ROLE-BASED PROTECTED ROUTE ===
type UserRole = 'admin' | 'organizer' | 'member' | 'viewer';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  customMessage?: string;
  showAccessDenied?: boolean;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
  customMessage,
  showAccessDenied = true
}) => {
  const { user, profile, loading, error } = useAuth();
  const location = useLocation();

  console.log('🛡️ RoleProtectedRoute check:', {
    path: location.pathname,
    allowedRoles,
    userRole: profile?.role,
    hasUser: !!user
  });

  // Show loading while checking authentication
  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        message="Checking permissions..." 
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    console.log('❌ RoleProtectedRoute: User not authenticated');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(profile.role as UserRole);

  if (!hasRequiredRole) {
    console.log('🚫 RoleProtectedRoute: Access denied', {
      userRole: profile.role,
      allowedRoles
    });

    if (!showAccessDenied) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = getRoleBasedRedirect(profile.role);
      return <Navigate to={redirectPath} replace />;
    }

    return (
      <AccessDenied
        requiredRoles={allowedRoles}
        userRole={profile.role}
        userName={profile.full_name || user.email || 'Unknown User'}
        customMessage={customMessage}
      />
    );
  }

  // User has required role, allow access
  console.log('✅ RoleProtectedRoute: Access granted');
  return <>{children}</>;
};

// === ADMIN ONLY ROUTE ===
interface AdminOnlyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnlyRoute: React.FC<AdminOnlyRouteProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin']}
      customMessage="This area is restricted to administrators only."
    >
      {fallback || children}
    </RoleProtectedRoute>
  );
};

// === ELEVATED ACCESS ROUTE (Admin + Organizer) ===
interface ElevatedAccessRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ElevatedAccessRoute: React.FC<ElevatedAccessRouteProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'organizer']}
      customMessage="This area is available to administrators and event organizers only."
    >
      {fallback || children}
    </RoleProtectedRoute>
  );
};

// === HELPER FUNCTIONS ===

// Get appropriate redirect path based on user role
export const getRoleBasedRedirect = (role?: string): string => {
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'organizer':
      return '/organizer-dashboard';
    case 'member':
      return '/member-dashboard';
    case 'viewer':
      return '/events';
    default:
      return '/';
  }
};

// Check if user can access a specific route
export const canAccessRoute = (
  userRole?: string, 
  allowedRoles: string[] = []
): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

// === ROUTE GUARD HOOK ===
export const useRouteGuard = (allowedRoles: UserRole[] = []) => {
  const { user, profile, loading } = useAuth();
  
  const isAuthenticated = !!(user && profile);
  const hasRequiredRole = profile?.role ? allowedRoles.includes(profile.role as UserRole) : false;
  const canAccess = isAuthenticated && (allowedRoles.length === 0 || hasRequiredRole);
  
  return {
    isAuthenticated,
    hasRequiredRole,
    canAccess,
    loading,
    userRole: profile?.role,
    redirectPath: getRoleBasedRedirect(profile?.role)
  };
};

// === DEFAULT EXPORT ===
export default ProtectedRoute;
