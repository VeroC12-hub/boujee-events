// src/App.tsx - Complete application with role-based routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  ProtectedRoute, 
  RoleProtectedRoute, 
  AdminOnlyRoute, 
  ElevatedAccessRoute,
  getRoleBasedRedirect 
} from './components/auth/ProtectedRoute';

// === PAGE IMPORTS ===

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';

// Auth pages
import AuthCallback from './pages/AuthCallback';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Dashboard pages
import IntegratedAdminDashboard from './pages/IntegratedAdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import IndexPage from './pages/IndexPage';

// Profile and settings
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Error pages
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// === DASHBOARD REDIRECT COMPONENT ===
const DashboardRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }
  
  const redirectPath = getRoleBasedRedirect(profile.role);
  return <Navigate to={redirectPath} replace />;
};

// === ROLE-BASED NAVIGATION GUARD ===
const RoleBasedDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  // For admin and organizer, use the integrated dashboard
  if (profile?.role === 'admin' || profile?.role === 'organizer') {
    return <IntegratedAdminDashboard />;
  }
  
  // For members, use the member dashboard
  if (profile?.role === 'member') {
    return <MemberDashboard />;
  }
  
  // Default fallback
  return <Navigate to="/login" replace />;
};

// === ERROR BOUNDARY COMPONENT ===
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-red-400 cursor-pointer">Error Details</summary>
                <pre className="text-red-300 text-xs mt-2 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// === MAIN APP COMPONENT ===
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gray-900">
            <Routes>
              {/* === PUBLIC ROUTES === */}
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              
              {/* === AUTHENTICATION ROUTES === */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* === PROTECTED INDEX ROUTE === */}
              <Route 
                path="/index" 
                element={
                  <ProtectedRoute>
                    <IndexPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* === DASHBOARD ROUTES === */}
              
              {/* Generic dashboard redirect */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Dashboard Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminOnlyRoute>
                    <IntegratedAdminDashboard />
                  </AdminOnlyRoute>
                } 
              />
              
              <Route 
                path="/admin-dashboard" 
                element={
                  <AdminOnlyRoute>
                    <IntegratedAdminDashboard />
                  </AdminOnlyRoute>
                } 
              />
              
              <Route 
                path="/admin/*" 
                element={
                  <AdminOnlyRoute>
                    <IntegratedAdminDashboard />
                  </AdminOnlyRoute>
                } 
              />
              
              {/* Organizer Dashboard Routes */}
              <Route 
                path="/organizer" 
                element={
                  <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <IntegratedAdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/organizer-dashboard" 
                element={
                  <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <IntegratedAdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/organizer/*" 
                element={
                  <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <IntegratedAdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Member Dashboard Routes */}
              <Route 
                path="/member" 
                element={
                  <RoleProtectedRoute allowedRoles={['member']}>
                    <MemberDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/member-dashboard" 
                element={
                  <RoleProtectedRoute allowedRoles={['member']}>
                    <MemberDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/member/*" 
                element={
                  <RoleProtectedRoute allowedRoles={['member']}>
                    <MemberDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Dynamic role-based dashboard */}
              <Route 
                path="/my-dashboard" 
                element={
                  <ProtectedRoute>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* === ELEVATED ACCESS ROUTES === */}
              
              {/* Homepage Media Management - Admin & Organizer Only */}
              <Route 
                path="/manage/homepage" 
                element={
                  <ElevatedAccessRoute>
                    <div>Homepage Media Management Component</div>
                  </ElevatedAccessRoute>
                } 
              />
              
              {/* Event Management - Admin & Organizer Only */}
              <Route 
                path="/manage/events" 
                element={
                  <ElevatedAccessRoute>
                    <div>Event Management Component</div>
                  </ElevatedAccessRoute>
                } 
              />
              
              {/* Media Management - Admin & Organizer Only */}
              <Route 
                path="/manage/media" 
                element={
                  <ElevatedAccessRoute>
                    <div>Media Management Component</div>
                  </ElevatedAccessRoute>
                } 
              />
              
              {/* === USER PROFILE ROUTES === */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <div>Edit Profile Component</div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* === ADMIN-ONLY ROUTES === */}
              
              {/* User Management */}
              <Route 
                path="/admin/users" 
                element={
                  <AdminOnlyRoute>
                    <div>User Management Component</div>
                  </AdminOnlyRoute>
                } 
              />
              
              {/* System Analytics */}
              <Route 
                path="/admin/analytics" 
                element={
                  <AdminOnlyRoute>
                    <div>System Analytics Component</div>
                  </AdminOnlyRoute>
                } 
              />
              
              {/* System Settings */}
              <Route 
                path="/admin/settings" 
                element={
                  <AdminOnlyRoute>
                    <div>System Settings Component</div>
                  </AdminOnlyRoute>
                } 
              />
              
              {/* System Logs */}
              <Route 
                path="/admin/logs" 
                element={
                  <AdminOnlyRoute>
                    <div>System Logs Component</div>
                  </AdminOnlyRoute>
                } 
              />
              
              {/* === DEVELOPMENT ROUTES === */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Route 
                    path="/dev/auth-test" 
                    element={<div>Auth Test Component</div>} 
                  />
                  <Route 
                    path="/dev/role-test" 
                    element={
                      <ProtectedRoute>
                        <div>Role Test Component</div>
                      </ProtectedRoute>
                    } 
                  />
                </>
              )}
              
              {/* === CATCH-ALL ROUTES === */}
              
              {/* 404 Not Found */}
              <Route path="/404" element={<NotFoundPage />} />
              
              {/* Catch all unmatched routes */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// === ROUTE DEBUGGING (Development only) ===
if (process.env.NODE_ENV === 'development') {
  console.log('🛣️ Boujee Events - Route Configuration Loaded');
  console.log('Available routes:');
  console.log('  Public: /, /events, /events/:id');
  console.log('  Auth: /login, /register, /auth/callback');
  console.log('  Admin: /admin, /admin-dashboard, /admin/*');
  console.log('  Organizer: /organizer, /organizer-dashboard, /organizer/*');
  console.log('  Member: /member, /member-dashboard, /member/*');
  console.log('  Protected: /profile, /settings, /manage/*');
}

export default App;
