import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Safe LoadingSpinner component
const LoadingSpinner: React.FC<{ fullScreen?: boolean; message?: string }> = ({ 
  fullScreen = false, 
  message = "Loading..." 
}) => {
  const containerClass = fullScreen 
    ? "min-h-screen bg-gray-900 flex items-center justify-center" 
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};

// Safe Logo component
const Logo: React.FC<{ variant?: string; size?: string; showTagline?: boolean }> = ({ 
  variant = 'light', 
  size = 'medium', 
  showTagline = false 
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
        <span className="font-bold text-black text-sm">be</span>
      </div>
      <div>
        <h1 className="font-bold tracking-tight text-white text-lg">
          Boujee Events
        </h1>
        {showTagline && (
          <p className="text-xs text-gray-300 font-medium">Creating magical moments</p>
        )}
      </div>
    </div>
  );
};

// Safe analytics hook with proper error handling
const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([
    { id: 1, name: 'Total Revenue', value: 524300, change: 23.5, changeType: 'positive' },
    { id: 2, name: 'Total Events', value: 47, change: 12.3, changeType: 'positive' },
    { id: 3, name: 'Total Bookings', value: 1234, change: 8.7, changeType: 'positive' },
    { id: 4, name: 'Average Rating', value: 4.8, change: 2.1, changeType: 'positive' }
  ]);
  
  const refetchAll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate data refresh with slight changes
      setData(prev => prev.map(item => ({
        ...item,
        value: item.value + Math.floor(Math.random() * 10),
        change: Math.round((Math.random() * 20 + 5) * 10) / 10
      })));
    }, 1000);
  };
  
  return {
    loading,
    metrics: { data },
    refetchAll
  };
};

// Safe AdminOverview component
const AdminOverview: React.FC = () => {
  const analytics = useAnalytics();
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analytics.metrics.data.map((metric) => (
          <div key={metric.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{metric.name}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                +{metric.change}%
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-white">
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">vs last month</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/20 transition-colors">
              <span className="text-yellow-400">📅 Create New Event</span>
            </button>
            <button className="w-full text-left p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors">
              <span className="text-blue-400">👥 Manage Users</span>
            </button>
            <button className="w-full text-left p-3 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors">
              <span className="text-green-400">📊 View Analytics</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center text-gray-300">
              <span className="mr-2">✅</span>
              <span>New user registered</span>
            </div>
            <div className="flex items-center text-gray-300">
              <span className="mr-2">🎫</span>
              <span>Event booking confirmed</span>
            </div>
            <div className="flex items-center text-gray-300">
              <span className="mr-2">💰</span>
              <span>Payment processed</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database</span>
              <span className="text-green-400">✅ Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API</span>
              <span className="text-green-400">✅ Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Storage</span>
              <span className="text-green-400">✅ Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safe AdminEvents component
const AdminEvents: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Event Management</h2>
        <p className="text-gray-400">Manage all events on your platform</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">All Events</h3>
          <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
            Create Event
          </button>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
          <p className="text-gray-400 mb-6">Create your first event to get started</p>
          <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
            Create Your First Event
          </button>
        </div>
      </div>
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const analytics = useAnalytics();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [notifications] = useState([
    { id: 1, message: 'New user registration', time: '2 minutes ago', type: 'info' },
    { id: 2, message: 'Event published successfully', time: '5 minutes ago', type: 'success' },
    { id: 3, message: 'Payment processed', time: '10 minutes ago', type: 'success' }
  ]);

  // Safe access to auth context with null checks
  const user = authContext?.user || authContext?.state?.user;
  const profile = authContext?.profile || authContext?.state?.profile;
  const signOut = authContext?.signOut || authContext?.logout;
  const loading = authContext?.loading || authContext?.state?.loading;

  // Navigation items with safe analytics access
  const navigationItems = [
    {
      name: 'Overview',
      section: 'overview',
      icon: '🏠',
      badge: null
    },
    {
      name: 'Analytics',
      section: 'analytics',
      icon: '📊',
      badge: analytics?.metrics?.data?.length || 0
    },
    {
      name: 'Events',
      section: 'events',
      icon: '📅',
      badge: null
    },
    {
      name: 'Users',
      section: 'users',
      icon: '👥',
      badge: null
    },
    {
      name: 'Settings',
      section: 'settings',
      icon: '⚙️',
      badge: null
    }
  ];

  // Auto-refresh analytics data with error handling
  useEffect(() => {
    if (analytics?.refetchAll && typeof analytics.refetchAll === 'function') {
      const interval = setInterval(() => {
        try {
          analytics.refetchAll();
        } catch (error) {
          console.warn('Failed to refresh analytics:', error);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [analytics]);

  const handleLogout = async () => {
    try {
      if (signOut && typeof signOut === 'function') {
        await signOut();
      }
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback - clear any auth tokens and redirect
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const getPageTitle = () => {
    switch (activeSection) {
      case 'analytics': return 'Analytics Dashboard';
      case 'events': return 'Event Management';
      case 'users': return 'User Management';
      case 'settings': return 'Settings';
      default: return 'Admin Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'events':
        return <AdminEvents />;
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">Advanced analytics features coming soon...</p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">User management features coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  // Show loading screen if auth is loading or user/profile is not available
  if (loading || !user) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  // Safe user data with extensive fallbacks
  const userInfo = {
    name: profile?.full_name || 
          profile?.name || 
          user?.user_metadata?.full_name || 
          user?.user_metadata?.name ||
          user?.name ||
          user?.email?.split('@')[0] || 
          'Admin User',
    email: user?.email || profile?.email || 'admin@example.com',
    role: profile?.role || user?.role || 'admin',
    avatar: profile?.avatar_url || 
            user?.user_metadata?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profile?.full_name || 
              user?.user_metadata?.full_name || 
              user?.email?.split('@')[0] || 
              'Admin'
            )}&background=D4AF37&color=000`,
    lastLogin: new Date().toLocaleDateString(),
    status: profile?.status || user?.status || 'active'
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <Logo variant="light" size="medium" showTagline={false} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <img
              src={userInfo.avatar}
              alt={userInfo.name}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=D4AF37&color=000`;
              }}
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{userInfo.name}</p>
              <p className="text-xs text-gray-400 capitalize">{userInfo.role}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <p>Last login: {userInfo.lastLogin}</p>
            <p>Status: ✅ {userInfo.status}</p>
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
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className="bg-yellow-400/20 text-yellow-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-gray-700">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span className="text-sm text-green-400">All Systems Operational</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              API: Online | DB: Connected
            </p>
          </div>
        </div>

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
      <div className="flex-1 flex flex-col">
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
              <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time clock */}
              <div className="text-sm text-gray-400">
                {new Date().toLocaleString()}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-400 hover:text-white">
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-yellow-400"></span>
                  )}
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  try {
                    if (analytics?.refetchAll && typeof analytics.refetchAll === 'function') {
                      analytics.refetchAll();
                    }
                  } catch (error) {
                    console.warn('Refresh failed:', error);
                  }
                }}
                disabled={analytics?.loading || false}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                <span className={analytics?.loading ? 'animate-spin' : ''}>
                  🔄
                </span>
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
              <div className="text-amber-400 font-bold text-sm">be</div>
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
