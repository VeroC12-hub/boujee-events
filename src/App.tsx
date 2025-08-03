import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import Analytics from './components/admin/Analytics';
import EventManagement from './components/admin/EventManagement';
import VIPManagement from './components/admin/VIPManagement';
import UserManagement from './components/admin/UserManagement';
import Settings from './components/admin/Settings';
import PublicLayout from './components/public/PublicLayout';
import PublicHomepage from './components/public/PublicHomepage';
import PublicEvents from './components/public/PublicEvents';
import PublicEventDetails from './components/public/PublicEventDetails';
import PublicVIPBooking from './components/public/PublicVIPBooking';

// App Context for global state
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast, success, error, warning, info } = useToast();

  // Make toast functions available globally
  React.useEffect(() => {
    (window as any).toast = { success, error, warning, info };
  }, [success, error, warning, info]);

  return (
    <div className="App">
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

// Main App Layout with Navigation
const AppLayout: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<PublicHomepage />} />
        <Route path="events" element={<PublicEvents />} />
        <Route path="events/:id" element={<PublicEventDetails />} />
        <Route path="vip-booking/:eventId" element={<PublicVIPBooking />} />
      </Route>
      
      {/* Authentication Route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      }>
        {/* Nested Admin Routes */}
        <Route index element={<Navigate to="/admin/analytics" replace />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="events" element={<EventManagement />} />
        <Route path="vip" element={<VIPManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* 404 Not Found */}
      <Route path="*" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏠 Go to Homepage
            </button>
            <p className="text-xs text-gray-500 mt-4">
              2025-08-03 04:59:40 UTC | Boujee Events
            </p>
          </div>
        </div>
      } />
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
            <AppLayout />
          </Router>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
