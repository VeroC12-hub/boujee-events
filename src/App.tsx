import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/common/Toast';

// Pages
import HomePage from './pages/HomePage';
import IndexPage from './pages/Index';
import Login from './pages/LoginPage';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import MemberDashboard from './pages/MemberDashboard';
import AuthCallback from './pages/AuthCallback'; // Add this import

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { state } = useAuth();
  
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && state.user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-300 mb-6">We're sorry for the inconvenience. Please try refreshing the page.</p>
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

    return this.props.children;
  }
}

// Toast Provider Component
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast, success, error, warning, info } = useToast();

  useEffect(() => {
    // Make toast functions globally available
    (window as Record<string, unknown>).toast = { success, error, warning, info };
  }, [success, error, warning, info]);

  return (
    <div className="App">
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

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
          2025-08-03 16:33:05 UTC | Boujee Events
        </p>
      </div>
    </div>
  );
};

// Emergency Admin Login Component
const EmergencyAdminLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Emergency Access</h2>
        <p className="text-gray-300 mb-6 text-center text-sm">
          Emergency admin access for development. Remove this route in production.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => {
              // Emergency login as admin
              const mockAuthState = {
                isAuthenticated: true,
                user: {
                  id: 'admin-emergency',
                  name: 'VeroC12-hub',
                  email: 'admin@boujeeevents.com',
                  role: 'admin',
                  avatar: 'https://avatars.githubusercontent.com/u/VeroC12-hub?v=4',
                  lastLogin: new Date().toISOString(),
                  status: 'active'
                }
              };
              localStorage.setItem('authState', JSON.stringify(mockAuthState));
              window.location.href = '/admin';
            }}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            🚨 Emergency Admin Login
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏠 Go to Homepage
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          2025-08-03 21:52:16 UTC | Emergency Access Route
        </p>
      </div>
    </div>
  );
};

// Main App Layout with Navigation
const AppLayout: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES - What customers see */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/index" element={<IndexPage />} />
      <Route path="/events" element={<IndexPage />} />
      <Route path="/book/:eventId" element={<BookingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} /> {/* Add OAuth callback route */}
      
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
        <ProtectedRoute requiredRole="organiser">
          <OrganizerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/organiser-dashboard" element={
        <ProtectedRoute requiredRole="organiser">
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

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <Router>
            <ToastProvider>
              <AppLayout />
            </ToastProvider>
          </Router>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
