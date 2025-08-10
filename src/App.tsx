// src/App.tsx - Fixed version
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import only the pages that exist
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // ✅ Changed from RegisterPage to SignupPage
import AdminDashboard from './pages/AdminDashboard';

// If you have other existing pages, import them here
// import EventsPage from './pages/EventsPage';
// import ProfilePage from './pages/ProfilePage';

// Simple placeholder components for pages that don't exist yet
const EventsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md w-full mx-4">
      <h1 className="text-2xl font-bold text-white mb-4">Events</h1>
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
      <h1 className="text-2xl font-bold text-white mb-4">Gallery</h1>
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
      <h1 className="text-2xl font-bold text-white mb-4">About</h1>
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
      <h1 className="text-2xl font-bold text-white mb-4">Contact</h1>
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} /> {/* ✅ Use SignupPage */}
            <Route path="/signup" element={<SignupPage />} /> {/* ✅ Also support /signup route */}
            
            {/* Dashboard Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/organizer-dashboard" element={<AdminDashboard />} />
            <Route path="/member-dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
                    <button
                      onClick={() => window.location.href = '/'}
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
