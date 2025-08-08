import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { IndexPage } from './pages/IndexPage';
import { BookingPage } from './pages/BookingPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallback } from './components/AuthCallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { MemberDashboard } from './pages/MemberDashboard';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-700">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              🔄 Refresh Page
            </button>
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-700">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            🏠 Go to Home
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          2025-08-08 | Boujee Events
        </p>
      </div>
    </div>
  );
};

// Main App Component with Auth Context Wrapper
const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES - Only these are accessible without login */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/index" element={<IndexPage />} />
      <Route path="/events" element={<IndexPage />} />
      <Route path="/book/:eventId" element={<BookingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* PROTECTED ROUTES - Only accessible after login with proper role */}
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
      
      {/* 404 Not Found - Must be last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Main App Component
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
