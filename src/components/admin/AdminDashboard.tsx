import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Analytics from './Analytics';
import EventManagement from './EventManagement';
import UserManagement from './UserManagement';
import Settings from './Settings';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Overview', href: '/admin', icon: '🏠' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📊' },
    { name: 'Events', href: '/admin/events', icon: '📅' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">VeroC12-hub</p>
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-6 left-6">
          <Link
            to="/"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <span className="mr-2">←</span>
            Back to Main Site
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/events" element={<EventManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

// Admin Overview Component
const AdminOverview: React.FC = () => {
  const currentDateTime = '2025-08-03 02:42:09';
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back, Boujee-Admin! Current time: {currentDateTime} UTC</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600 mr-4">📅</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Events</h3>
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-500">+3 this week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl text-green-600 mr-4">👥</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-2xl font-bold text-green-600">1,234</p>
              <p className="text-sm text-gray-500">+12 today</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl text-purple-600 mr-4">💰</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-purple-600">$12,500</p>
              <p className="text-sm text-gray-500">+8% from last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-3xl text-orange-600 mr-4">🚀</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
              <p className="text-2xl font-bold text-orange-600">8</p>
              <p className="text-sm text-gray-500">Running now</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-3">
            {[
              { name: 'Tech Conference 2025', date: '2025-08-15', status: 'Active', attendees: 250 },
              { name: 'Summer Music Festival', date: '2025-08-20', status: 'Pending', attendees: 150 },
              { name: 'Art & Design Exhibition', date: '2025-08-25', status: 'Active', attendees: 89 },
              { name: 'Startup Pitch Night', date: '2025-08-30', status: 'Draft', attendees: 45 },
            ].map((event, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{event.name}</p>
                  <p className="text-sm text-gray-500">{event.date} • {event.attendees} attendees</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : event.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              to="/admin/events" 
              className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              🎉 Create New Event
            </Link>
            <Link 
              to="/admin/users" 
              className="block w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
            >
              👥 Manage Users
            </Link>
            <Link 
              to="/admin/analytics" 
              className="block w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              📊 View Analytics
            </Link>
            <Link 
              to="/admin/settings" 
              className="block w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors font-medium"
            >
              ⚙️ Platform Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
