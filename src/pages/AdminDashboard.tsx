import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: authState, logout } = useAuth();
  const analytics = useAnalytics();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New user registration', time: '2 minutes ago', type: 'info' },
    { id: 2, message: 'Event published successfully', time: '5 minutes ago', type: 'success' },
    { id: 3, message: 'Payment processed', time: '10 minutes ago', type: 'success' }
  ]);

  // Navigation items with real-time data
  const navigationItems = [
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: '📊',
      badge: analytics.metrics.data?.length || 0
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: '📅',
      badge: null
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
      badge: null
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: '⚙️',
      badge: null
    }
  ];

  // Auto-refresh analytics data
  useEffect(() => {
    const interval = setInterval(() => {
      analytics.refetchAll();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [analytics.refetchAll]);

  const handleLogout = async () => {
    try {
      await logout();
      // Toast notification will be shown by the auth context
      if ((window as any).toast) {
        (window as any).toast.success('Logged out successfully');
      }
    } catch (error) {
      if ((window as any).toast) {
        (window as any).toast.error('Logout failed');
      }
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('analytics')) return 'Analytics Dashboard';
    if (path.includes('events')) return 'Event Management';
    if (path.includes('users')) return 'User Management';
    if (path.includes('settings')) return 'Platform Settings';
    return 'Admin Dashboard';
  };

  if (!authState.user) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background text-white flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center">
            <span className="text-2xl">🎫</span>
            <span className="ml-2 text-xl font-bold text-primary">Boujee Events</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center">
            <img
              src={authState.user.avatar}
              alt={authState.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{authState.user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{authState.user.role}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <p>Last login: {authState.user.lastLogin}</p>
            <p>Status: ✅ {authState.user.status}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-black font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-border">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-primary mr-2">✅</span>
              <span className="text-sm text-primary">All Systems Operational</span>
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
        <header className="bg-card border-b border-border">
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
                2025-08-03 03:52:31 UTC
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-400 hover:text-white">
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary"></span>
                  )}
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  analytics.refetchAll();
                  if ((window as any).toast) {
                    (window as any).toast.success('Data refreshed');
                  }
                }}
                disabled={analytics.loading}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                <span className={analytics.loading ? 'animate-spin' : ''}>
                  🔄
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-card border-t border-border px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              Boujee Events Admin Dashboard v1.0 | Connected to Mock API
            </div>
            <div>
              User: {authState.user.name} | 2025-08-03 03:52:31 UTC
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
