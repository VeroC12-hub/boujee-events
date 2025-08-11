// src/App.tsx - UPDATED WITH EVENT MANAGEMENT ROUTES
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import EXISTING page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import EventDetail from './pages/EventDetail';

// Import NEW Event Management Components
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { EventManagementPage } from './pages/EventManagementPage';
import { EventDetailPage } from './pages/EventDetailPage';

// Import Enhanced Dashboard Components
import OrganizerDashboard from './pages/OrganizerDashboard';
import MemberDashboard from './pages/MemberDashboard';

// Protected Route Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

// Component to handle dashboard redirects
const DashboardRedirect: React.FC = () => {
  return <Navigate to="/admin-dashboard" replace />;
};

function App() {
  console.log('🚀 App component rendering with Event Management System...');
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<HomePage />} />
            
            {/* Existing public pages */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* ===== EVENT ROUTES (NEW) ===== */}
            
            {/* Event Management - Admin/Organizer Routes */}
            <Route 
              path="/admin/events" 
              element={
                <ProtectedRoute>
                  <EventManagementPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Event Creation */}
            <Route 
              path="/events/create" 
              element={
                <ProtectedRoute>
                  <CreateEventPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Event Editing */}
            <Route 
              path="/events/:eventId/edit" 
              element={
                <ProtectedRoute>
                  <EditEventPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Event Detail - Enhanced Version */}
            <Route path="/events/:eventId" element={<EventDetailPage />} />
            
            {/* Legacy Event Detail (keeping for compatibility) */}
            <Route path="/events/:id" element={<EventDetail />} />
            
            {/* Event Booking */}
            <Route path="/booking/:eventId" element={<BookingPage />} />
            <Route path="/events/:eventId/book" element={<BookingPage />} />
            
            {/* ===== AUTH ROUTES ===== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* ===== DASHBOARD ROUTES ===== */}
            
            {/* Admin Dashboard */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Organizer Dashboard */}
            <Route 
              path="/organizer-dashboard" 
              element={
                <ProtectedRoute>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Member Dashboard */}
            <Route 
              path="/member-dashboard" 
              element={
                <ProtectedRoute>
                  <MemberDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Generic Dashboard Redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* ===== PROFILE & SETTINGS ===== */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Profile Settings</h1>
                      <p className="text-gray-400 mb-6">Profile management coming soon!</p>
                      <button
                        onClick={() => window.history.back()}
                        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* ===== 404 FALLBACK ===== */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
                    <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                    <div className="space-x-4">
                      <button
                        onClick={() => {
                          console.log('🏠 Navigating to home from 404');
                          window.location.href = '/';
                        }}
                        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        Go Home
                      </button>
                      <button
                        onClick={() => {
                          console.log('📋 Navigating to events from 404');
                          window.location.href = '/events';
                        }}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        View Events
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
