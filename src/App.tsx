import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';

// Mock components for your main app (replace with your actual components)
const HomePage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to EventHub</h1>
      <p className="text-gray-600 mb-6">The premier event management platform</p>
      <div className="space-x-4">
        <a
          href="/events"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Events
        </a>
        <a
          href="/admin"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Admin Dashboard
        </a>
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
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </a>
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
            <p className="text-sm text-gray-500">Last login: 2025-08-03 02:00:05 UTC</p>
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
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </a>
          <a
            href="/admin"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Admin Dashboard
          </a>
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
            <a href="/" className="text-xl font-bold text-gray-900">
              EventHub
            </a>
            <a href="/events" className="text-gray-600 hover:text-gray-900">
              Events
            </a>
            <a href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </a>
            
            {/* Admin Link - Only show for admin users */}
            {isAdmin && (
              <a 
                href="/admin" 
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Admin Dashboard
              </a>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, VeroC12-hub
            </span>
            <span className="text-xs text-gray-400">
              2025-08-03 02:00:05 UTC
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main application routes */}
          <Route path="/" element={
            <>
              <Navigation />
              <HomePage />
            </>
          } />
          
          <Route path="/events" element={
            <>
              <Navigation />
              <EventsPage />
            </>
          } />
          
          <Route path="/profile" element={
            <>
              <Navigation />
              <ProfilePage />
            </>
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
