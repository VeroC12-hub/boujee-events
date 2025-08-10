// src/components/routing/RoleBasedRoute.tsx - Enhanced route protection
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

type UserRole = 'admin' | 'organizer' | 'member';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
  showAccessDenied = true
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ RoleBasedRoute check:', {
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

  // Redirect to login if not authenticated
  if (!user || !profile) {
    console.log('❌ RoleBasedRoute: User not authenticated');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(profile.role as UserRole);

  if (!hasRequiredRole) {
    console.log('🚫 RoleBasedRoute: Access denied', {
      userRole: profile.role,
      allowedRoles
    });

    if (!showAccessDenied) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            This section is only available to {allowedRoles.join(' and ')} users.
          </p>
          
          {/* Current vs Required Roles */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-red-300 font-semibold mb-1">Your Role</p>
                <p className="text-red-200 capitalize">{profile.role}</p>
              </div>
              <div>
                <p className="text-red-300 font-semibold mb-1">Required Roles</p>
                <p className="text-red-200">{allowedRoles.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Role-specific message */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-200 text-sm">
              {profile.role === 'member' && allowedRoles.includes('organizer') && (
                "To become an event organizer, please contact an administrator."
              )}
              {profile.role === 'organizer' && allowedRoles.includes('admin') && (
                "This feature is restricted to administrators only."
              )}
              {!allowedRoles.includes('member') && (
                `Currently logged in as: ${profile.full_name || profile.email}`
              )}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors font-semibold"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has required role, allow access
  console.log('✅ RoleBasedRoute: Access granted');
  return <>{children}</>;
};

// src/App.tsx - Updated routing with role-based protection
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleBasedRoute } from './components/routing/RoleBasedRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import IndexPage from './pages/IndexPage';

// Dashboard pages
import { RoleBasedAdminDashboard } from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import MemberDashboard from './pages/MemberDashboard';

// Media management page
import { ProtectedHomepageMediaManager } from './components/admin/ProtectedHomepageMediaManager';

// Other pages
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            
            {/* Protected Index/Dashboard Route */}
            <Route path="/index" element={
              <ProtectedRoute>
                <IndexPage />
              </ProtectedRoute>
            } />
            
            {/* Role-Based Dashboard Routes */}
            <Route path="/admin" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <RoleBasedAdminDashboard />
              </RoleBasedRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <RoleBasedAdminDashboard />
              </RoleBasedRoute>
            } />
            
            <Route path="/organizer" element={
              <RoleBasedRoute allowedRoles={['organizer']}>
                <RoleBasedAdminDashboard />
              </RoleBasedRoute>
            } />
            
            <Route path="/organizer-dashboard" element={
              <RoleBasedRoute allowedRoles={['organizer']}>
                <RoleBasedAdminDashboard />
              </RoleBasedRoute>
            } />
            
            {/* Homepage Media Management - Admin & Organizer Only */}
            <Route path="/admin/homepage-media" element={
              <RoleBasedRoute allowedRoles={['admin', 'organizer']}>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
                  <div className="container mx-auto">
                    <ProtectedHomepageMediaManager />
                  </div>
                </div>
              </RoleBasedRoute>
            } />
            
            {/* Admin-Only Routes */}
            <Route path="/admin/users" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div>Admin Users Management</div>
              </RoleBasedRoute>
            } />
            
            <Route path="/admin/analytics" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div>Admin Analytics</div>
              </RoleBasedRoute>
            } />
            
            <Route path="/admin/system" element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <div>System Management</div>
              </RoleBasedRoute>
            } />
            
            {/* Organizer Routes */}
            <Route path="/organizer/events" element={
              <RoleBasedRoute allowedRoles={['admin', 'organizer']}>
                <div>Organizer Events Management</div>
              </RoleBasedRoute>
            } />
            
            <Route path="/organizer/create" element={
              <RoleBasedRoute allowedRoles={['admin', 'organizer']}>
                <div>Create Event</div>
              </RoleBasedRoute>
            } />
            
            {/* Member Dashboard - Member Only */}
            <Route path="/member" element={
              <RoleBasedRoute allowedRoles={['member']}>
                <MemberDashboard />
              </RoleBasedRoute>
            } />
            
            <Route path="/member-dashboard" element={
              <RoleBasedRoute allowedRoles={['member']}>
                <MemberDashboard />
              </RoleBasedRoute>
            } />
            
            {/* Generic Dashboard Route - Redirects based on role */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />
            
            {/* Profile Page - Any authenticated user */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect to appropriate dashboard based on user role
function DashboardRedirect() {
  const { user, profile } = useAuth();
  
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }
  
  switch (profile.role) {
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'organizer':
      return <Navigate to="/organizer-dashboard" replace />;
    case 'member':
      return <Navigate to="/member-dashboard" replace />;
    default:
      return <Navigate to="/member-dashboard" replace />;
  }
}

export default App;

// src/hooks/useRoleAccess.ts - Helper hook for role-based access control
import { useAuth } from '../contexts/AuthContext';

export const useRoleAccess = () => {
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  const isOrganizer = profile?.role === 'organizer';
  const isMember = profile?.role === 'member';
  
  const canManageHomepage = isAdmin || isOrganizer;
  const canManageUsers = isAdmin;
  const canViewAnalytics = isAdmin;
  const canCreateEvents = isAdmin || isOrganizer;
  const canManageBanners = isAdmin; // Banners are admin-only
  
  const hasRole = (roles: string[]) => {
    return profile?.role && roles.includes(profile.role);
  };
  
  const requiresRole = (requiredRoles: string[]) => {
    if (!profile?.role) return false;
    return requiredRoles.includes(profile.role);
  };
  
  return {
    // Role checks
    isAdmin,
    isOrganizer,
    isMember,
    userRole: profile?.role,
    
    // Permission checks
    canManageHomepage,
    canManageUsers,
    canViewAnalytics,
    canCreateEvents,
    canManageBanners,
    
    // Helper functions
    hasRole,
    requiresRole,
    
    // Navigation helpers
    getDashboardPath: () => {
      switch (profile?.role) {
        case 'admin': return '/admin-dashboard';
        case 'organizer': return '/organizer-dashboard';
        case 'member': return '/member-dashboard';
        default: return '/dashboard';
      }
    },
    
    getHomepageMediaPath: () => canManageHomepage ? '/admin/homepage-media' : null,
  };
};
