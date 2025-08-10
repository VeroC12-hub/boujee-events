// src/App.tsx - Complete routing with all new pages
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import all pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import ProfilePage from './pages/ProfilePage';

// Dashboard pages - Import your existing dashboard components
import IntegratedAdminDashboard from './pages/AdminDashboard'; // Your updated admin dashboard
// import OrganizerDashboard from './pages/OrganizerDashboard'; // If you have this
// import MemberDashboard from './pages/MemberDashboard'; // If you have this

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute'; // If you have this
import { RoleBasedRoute } from './components/routing/RoleBasedRoute'; // If you have this

// Create a simple protected route wrapper if you don't have the above components
const SimpleProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  // This is a simplified version - replace with your actual ProtectedRoute component
  return <>{children}</>;
};

// Simple role-based route wrapper
const SimpleRoleBasedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[] 
}> = ({ children, allowedRoles }) => {
  // This is a simplified version - replace with your actual RoleBasedRoute component
  return <>{children}</>;
};

// Placeholder dashboard components (replace with your actual components)
const OrganizerDashboard: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Organizer Dashboard</h1>
      <p className="text-gray-400 mb-6">Coming Soon - Replace with your actual OrganizerDashboard component</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
      >
        Go Back
      </button>
    </div>
  </div>
);

const MemberDashboard: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Member Dashboard</h1>
      <p className="text-gray-400 mb-6">Coming Soon - Replace with your actual MemberDashboard component</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            {/* Home page - always public but shows different content for logged in users */}
            <Route path="/" element={<HomePage />} />
            
            {/* Separate public pages */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* ===== AUTH ROUTES ===== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* ===== PROTECTED ROUTES ===== */}
            {/* Profile - accessible to all authenticated users */}
            <Route 
              path="/profile" 
              element={
                <SimpleProtectedRoute>
                  <ProfilePage />
                </SimpleProtectedRoute>
              } 
            />

            {/* ===== ROLE-BASED DASHBOARD ROUTES ===== */}
            
            {/* Admin Dashboard - Only for admins */}
            <Route 
              path="/admin-dashboard" 
              element={
                <SimpleRoleBasedRoute allowedRoles={['admin']}>
                  <IntegratedAdminDashboard />
                </SimpleRoleBasedRoute>
              } 
            />

            {/* Organizer Dashboard - For organizers */}
            <Route 
              path="/organizer-dashboard" 
              element={
                <SimpleRoleBasedRoute allowedRoles={['admin', 'organizer']}>
                  <OrganizerDashboard />
                </SimpleRoleBasedRoute>
              } 
            />

            {/* Member Dashboard - For members */}
            <Route 
              path="/member-dashboard" 
              element={
                <SimpleRoleBasedRoute allowedRoles={['admin', 'organizer', 'member']}>
                  <MemberDashboard />
                </SimpleRoleBasedRoute>
              } 
            />

            {/* ===== LEGACY ROUTE REDIRECTS ===== */}
            {/* Redirect old dashboard route to smart routing */}
            <Route 
              path="/dashboard" 
              element={<Navigate to="/" replace />} 
            />

            {/* ===== CATCH-ALL ROUTE ===== */}
            {/* 404 Page */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
                    <p className="text-gray-400 mb-8">
                      The page you're looking for doesn't exist.
                    </p>
                    <div className="space-x-4">
                      <button 
                        onClick={() => window.history.back()}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                      >
                        Go Back
                      </button>
                      <button 
                        onClick={() => window.location.href = '/'}
                        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        Go Home
                      </button>
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
