import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, Users, DollarSign, TrendingUp, Plus, Upload, 
  Play, Image, FileVideo, Youtube, Settings, Bell,
  BarChart3, Eye, MapPin, MessageSquare, Mail, Database,
  ArrowLeft, RefreshCw, Download, Share2, Edit, Trash2,
  CheckCircle, AlertCircle, Clock, Star, Search, Filter
} from 'lucide-react';

// Simple loading component
const LoadingSpinner: React.FC<{ fullScreen?: boolean; message?: string }> = ({ 
  fullScreen = false, 
  message = 'Loading...' 
}) => (
  <div className={fullScreen ? 'min-h-screen flex items-center justify-center bg-gray-900' : 'flex items-center justify-center p-8'}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// Mock data - no API calls
const mockMetrics = {
  data: [
    { id: 1, name: 'Total Revenue', value: 524300, change: 15.3, changeType: 'positive' },
    { id: 2, name: 'Total Events', value: 47, change: 12.3, changeType: 'positive' },
    { id: 3, name: 'Total Bookings', value: 1234, change: 8.7, changeType: 'positive' },
    { id: 4, name: 'Total Users', value: 856, change: 2.1, changeType: 'positive' }
  ]
};

const mockRecentActivity = [
  {
    id: 'booking-1',
    message: 'New booking for Summer Festival',
    time: new Date().toLocaleDateString(),
    type: 'booking',
    icon: '🎫'
  },
  {
    id: 'user-1',
    message: 'John Doe joined the platform',
    time: new Date().toLocaleDateString(),
    type: 'user',
    icon: '👤'
  },
  {
    id: 'booking-2',
    message: 'VIP ticket purchased for Gala Night',
    time: new Date().toLocaleDateString(),
    type: 'booking',
    icon: '🎫'
  }
];

const mockEvents = [
  {
    id: 1,
    title: 'Summer Music Festival',
    status: 'live',
    date: 'Aug 15, 2025',
    venue: 'Central Park',
    booked: 145,
    capacity: 200,
    revenue: 125000,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
  },
  {
    id: 2,
    title: 'Tech Conference 2025',
    status: 'draft',
    date: 'Sep 20, 2025',
    venue: 'Convention Center',
    booked: 0,
    capacity: 500,
    revenue: 0,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
  }
];

// Overview Component
const AdminOverview: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockMetrics.data.map((metric) => (
          <div key={metric.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{metric.name}</h3>
              <div className={`text-sm ${metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                {metric.changeType === 'positive' ? '+' : '-'}{metric.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {metric.name.includes('Revenue') ? `€${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last month</p>
          </div>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center text-gray-300">
                <span className="mr-2">{activity.icon}</span>
                <div className="flex-1">
                  <span className="text-sm">{activity.message}</span>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-yellow-400 text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </button>
            <button className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Media
            </button>
            <button className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Events Management Component
const AdminEvents: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Events Management</h2>
          <p className="text-gray-400">Create and manage your events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <div key={event.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors">
            <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'live' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'
                }`}>
                  {event.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {event.date}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.venue}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {event.booked}/{event.capacity} attendees
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  €{event.revenue.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((event.booked / event.capacity) * 100)}% filled
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Event</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-400">Event creation form would go here</p>
              <button
                onClick={() => setShowCreateForm(false)}
                className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'events':
        return <AdminEvents />;
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Analytics</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">Analytics dashboard coming soon!</p>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Media Management</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">Media management coming soon!</p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">User management coming soon!</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">Settings panel coming soon!</p>
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  // Check if user is admin
  if (!user || !profile) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { name: 'Overview', section: 'overview', icon: '🏠' },
    { name: 'Analytics', section: 'analytics', icon: '📊' },
    { name: 'Events', section: 'events', icon: '📅' },
    { name: 'Media', section: 'media', icon: '🎬' },
    { name: 'Users', section: 'users', icon: '👥' },
    { name: 'Settings', section: 'settings', icon: '⚙️' }
  ];

  const userInfo = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Admin',
    email: user?.email || 'admin@example.com',
    role: profile?.role || 'admin',
    avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Admin')}&background=D4AF37&color=000`
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">be</div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-white">Boujee Events</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <img
              src={userInfo.avatar}
              alt={userInfo.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{userInfo.name}</p>
              <p className="text-xs text-gray-400 capitalize">{userInfo.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeSection === item.section;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSection(item.section);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white mr-4"
              >
                ☰
              </button>
              <h1 className="text-xl font-semibold text-white">
                {navigationItems.find(item => item.section === activeSection)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleString()}
              </div>
              <button className="p-2 text-gray-400 hover:text-white">
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="text-yellow-400 font-bold text-sm">be</div>
              <span>Boujee Events Admin Dashboard v1.0 | Status: Connected</span>
            </div>
            <div>
              User: {userInfo.name} | {new Date().toLocaleString()}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
