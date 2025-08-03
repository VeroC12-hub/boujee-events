import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';

// Mock components for your main app
const HomePage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to EventHub</h1>
      <p className="text-gray-600 mb-6">The premier event management platform</p>
      <div className="space-x-4">
        <Link
          to="/events"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Events
        </Link>
        <Link
          to="/admin"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Admin Dashboard
        </Link>
      </div>
    </div>
  </div>
);

const EventsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Events</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Events listing will go here...</p>
        <div className="mt-4">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const ProfilePage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">VeroC12-hub</h2>
            <p className="text-gray-600">Administrator</p>
            <p className="text-sm text-gray-500">Last login: 2025-08-03 02:03:22 UTC</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">veroc12@example.com</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900">Platform Administrator</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="text-gray-900">January 2025</p>
          </div>
        </div>
        <div className="mt-6 space-x-4">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </Link>
          <Link
            to="/admin"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// Navigation Component
const Navigation: React.FC = () => {
  const isAdmin = true; // Replace with real admin check logic

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              EventHub
            </Link>
            <Link to="/events" className="text-gray-600 hover:text-gray-900">
              Events
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            
            {/* Admin Link - Only show for admin users */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, VeroC12-hub
            </span>
            <span className="text-xs text-gray-400">
              2025-08-03 02:03:22 UTC
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Layout component for pages with navigation
const LayoutWithNav: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navigation />
    {children}
  </>
);

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main application routes with navigation */}
          <Route path="/" element={
            <LayoutWithNav>
              <HomePage />
            </LayoutWithNav>
          } />
          
          <Route path="/events" element={
            <LayoutWithNav>
              <EventsPage />
            </LayoutWithNav>
          } />
          
          <Route path="/profile" element={
            <LayoutWithNav>
              <ProfilePage />
            </LayoutWithNav>
          } />
          
          {/* Admin Dashboard Routes - No navigation bar for admin */}
          <Route path="/admin/*" element={<AdminDashboard />} />
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
