// src/App.tsx - Simplified version with only essential routes
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

// === IMPORT EXISTING PAGES ===
// Only import pages that exist in your project
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Import your existing dashboard
import AdminDashboard from './pages/AdminDashboard'; // Your existing dashboard

// === SIMPLE PLACEHOLDER COMPONENTS ===
// These replace missing pages with simple placeholders

const RegisterPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Register</h1>
      <p className="text-gray-400 mb-6">Registration page coming soon...</p>
      <button
        onClick={() => window.location.href = '/login'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
      >
        Go to Login
      </button>
    </div>
  </div>
);

const EventsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Events</h1>
      <p className="text-gray-400 mb-6">Events page coming soon...</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
      >
        Go Home
      </button>
    </div>
  </div>
);

const AuthCallback: React.FC = () => {
  const { user, profile } = useAuth();
  
  React.useEffect(() => {
    if (user && profile) {
      const redirectPath = getRoleBasedRedirect(profile.role);
      window.location.href = redirectPath;
    }
  }, [user, profile]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
};

const MemberDashboard: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Member Dashboard</h1>
      <p className="text-gray-400 mb-6">Member dashboard coming soon...</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
      >
        Go Home
      </button>
    </div>
  </div>
);

const IndexPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
      <p className="text-gray-400 mb-6">Welcome to your dashboard!</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
      >
        Go Home
      </button>
    </div>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
      >
        Go Home
      </button>
    </div>
  </div>
);

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
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Refresh Page
            </button>
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
              
              {/* === AUTHENTICATION ROUTES === */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
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
              
              {/* Admin Dashboard - Use your existing dashboard */}
              <Route 
                path="/admin" 
                element={
                  <AdminOnlyRoute>
                    <AdminDashboard />
                  </AdminOnlyRoute>
                } 
              />
              
              <Route 
                path="/admin-dashboard" 
                element={
                  <AdminOnlyRoute>
                    <AdminDashboard />
                  </AdminOnlyRoute>
                } 
              />
              
              {/* Organizer Dashboard - Use your existing dashboard */}
              <Route 
                path="/organizer" 
                element={
                  <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/organizer-dashboard" 
                element={
                  <RoleProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <AdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Member Dashboard */}
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

export default App;
