// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './components/admin/Analytics';
import EventManagement from './components/admin/EventManagement';
import UserManagement from './components/admin/UserManagement';
import VIPManagement from './components/admin/VIPManagement';
import Settings from './components/admin/Settings';

// Toast notifications setup (if you're using react-hot-toast)
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Admin Routes - All Protected by ProtectedRoute */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }>
              {/* Nested admin routes */}
              <Route index element={<Navigate to="/admin/analytics" replace />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="events" element={<EventManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="vip" element={<VIPManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Organizer Routes */}
            <Route path="/organizer" element={
              <ProtectedRoute requiredRole="organizer">
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
                  <p>Coming soon...</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Member Routes */}
            <Route path="/member" element={
              <ProtectedRoute requiredRole="user">
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Member Dashboard</h1>
                  <p>Coming soon...</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Login route handled by ProtectedRoute - if not authenticated, shows login */}
            <Route path="/login" element={<Navigate to="/admin" replace />} />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
