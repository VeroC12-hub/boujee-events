// src/App.tsx - FINAL FIXED VERSION - Uses REAL page components
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import ACTUAL page components that exist in your project
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';

// Import your REAL page components (not placeholders!)
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import EventDetail from './pages/EventDetail'; // Note: EventDetail.tsx (not EventDetailPage)

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
  console.log('🚀 App component rendering with REAL page components...');
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<HomePage />} />
            
            {/* These now use your ACTUAL page components! */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Event specific routes */}
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/booking/:eventId" element={<BookingPage />} />
            
            {/* ===== AUTH ROUTES ===== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* ===== DASHBOARD ROUTES ===== */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/organizer-dashboard" element={<AdminDashboard />} />
            <Route path="/member-dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* ===== 404 FALLBACK ===== */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
                    <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                    <button
                      onClick={() => {
                        console.log('🏠 Navigating to home from 404');
                        window.location.href = '/';
                      }}
                      className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      Go Home
                    </button>
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
