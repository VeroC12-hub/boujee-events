import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';

// Mock components for your main app
const HomePage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to EventHub</h1>
      <p className="text-gray-600 mb-6">The premier event management platform</p>
      <p className="text-sm text-gray-500 mb-6">Current time: 2025-08-03 02:42:09 UTC</p>
      <p className="text-sm text-gray-600 mb-8">Logged in as: VeroC12-hub</p>
      <div className="space-x-4">
        <Link
          to="/events"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Events
        </Link>
        <Link
          to="/profile"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          My Profile
        </Link>
        <Link
          to="/admin"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          🚀 Admin Dashboard
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
        <p className="text-gray-600 mb-4">Events listing will go here...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Tech Conference 2025', date: '2025-08-15', price: '$199' },
            { title: 'Summer Music Festival', date: '2025-08-20', price: '$89' },
            { title: 'Art Exhibition', date: '2025-08-25', price: '$25' },
            { title: 'Startup Pitch Night', date: '2025-08-30', price: 'Free' },
          ].map((event, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <p className="text-gray-600 text-sm">{event.date}</p>
              <p className="text-blue-600 font-medium mt-2">{event.price}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
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
          <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">VeroC12-hub</h2>
            <p className="text-gray-600">Platform Administrator</p>
            <p className="text-sm text-gray-500">Last login: 2025-08-03 02:42:09 UTC</p>
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
            🚀 Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// Navigation Component
const Navigation: React.FC = () => {
  const isAdmin = true;

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
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                🚀 Admin Dashboard
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, VeroC12-hub
            </span>
            <span className="text-xs text-gray-400">
              2025-08-03 02:42:09 UTC
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
          
          <Route path="/admin/*" element={<AdminDashboard />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
