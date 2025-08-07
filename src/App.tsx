import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import IndexPage from './pages/Index';
import LoginPage from './pages/LoginPage';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import MemberDashboard from './pages/MemberDashboard';
import AuthCallback from './pages/AuthCallback';

// Types
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'organizer' | 'member';
}

// Protected Route Component - FIXED
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const authContext = useAuth();
  
  // Safety check for auth context
  if (!authContext) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">Authentication service is not available.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const { loading = false, user, profile } = authContext;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Enhanced Error Boundary - FIXED
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log specific auth-related errors
    if (error.message?.includes('loading') || error.message?.includes('undefined')) {
      console.error('🚨 Authentication state error detected:', {
        error: error.message,
        stack: error.stack,
        errorInfo
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-300 mb-6">We're sorry for the inconvenience. Please try refreshing the page.</p>
            
            {/* Show error details in development */}
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="mb-4 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer mb-2">Error Details (Dev Mode)</summary>
                <pre className="text-xs text-red-300 bg-red-900/20 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Cache & Login
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              {new Date().toISOString().replace('T', ' ').split('.')[0]} UTC | Error Boundary
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 404 Not Found Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            🏠 Go to Home
          </button>
          <button
            onClick={() => window.location.href = '/admin'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📊 Admin Dashboard
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          2025-08-07 | Boujee Events
        </p>
      </div>
    </div>
  );
};

// Emergency Admin Login Component
const EmergencyAdminLogin: React.FC = () => {
  const handleEmergencyLogin = () => {
    // For development only - create a fake admin session
    localStorage.setItem('emergency_admin', 'true');
    window.location.href = '/admin';
  };

  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Emergency Access</h2>
        <p className="text-gray-300 mb-6 text-center text-sm">
          Emergency admin access for development. Remove this route in production.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleEmergencyLogin}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            🚨 Emergency Admin Login
          </button>
          <button
            onClick={handleClearStorage}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            🧹 Clear All Storage
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏠 Go to Homepage
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          2025-08-07 | Emergency Access Route
        </p>
      </div>
    </div>
  );
};

// Main App Component with Auth Context Wrapper - FIXED
const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/index" element={<IndexPage />} />
      <Route path="/events" element={<IndexPage />} />
      <Route path="/book/:eventId" element={<BookingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/admin-dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/organizer" element={
        <ProtectedRoute requiredRole="organizer">
          <OrganizerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/organizer-dashboard" element={
        <ProtectedRoute requiredRole="organizer">
          <OrganizerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/member" element={
        <ProtectedRoute requiredRole="member">
          <MemberDashboard />
        </ProtectedRoute>
      } />

      <Route path="/member-dashboard" element={
        <ProtectedRoute requiredRole="member">
          <MemberDashboard />
        </ProtectedRoute>
      } />

      {/* Development/Emergency Admin Access - Remove in production */}
      <Route path="/admin-emergency-login" element={<EmergencyAdminLogin />} />
      
      {/* 404 Not Found - Must be last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Main App Component - FIXED with proper error boundary placement
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
