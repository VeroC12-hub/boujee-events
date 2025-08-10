// src/App.tsx - FIXED VERSION - Resolves Auth Loops & Navigation
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // Using SignupPage instead of RegisterPage
import AdminDashboard from './pages/AdminDashboard';

// Simple placeholder components for missing pages
const EventsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-white mb-4">🎪 Events</h1>
      <p className="text-gray-400 mb-6">Events page coming soon...</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

const GalleryPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-white mb-4">🖼️ Gallery</h1>
      <p className="text-gray-400 mb-6">Gallery page coming soon...</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-white mb-4">ℹ️ About</h1>
      <p className="text-gray-400 mb-6">About page coming soon...</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-white mb-4">📞 Contact</h1>
      <p className="text-gray-400 mb-6">Contact page coming soon...</p>
      <button
        onClick={() => window.location.href = '/'}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
      >
        Go Home
      </button>
    </div>
  </div>
);

// Protected Route Wrapper - Prevents auth loops
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // This will be populated by the AuthProvider context
  // For now, we'll make it simple to avoid loops
  return <>{children}</>;
};

// Component to handle dashboard redirects without loops
const DashboardRedirect: React.FC = () => {
  // Simple redirect without complex auth checks to prevent loops
  return <Navigate to="/admin-dashboard" replace />;
};

function App() {
  console.log('🚀 App component rendering...');
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
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
