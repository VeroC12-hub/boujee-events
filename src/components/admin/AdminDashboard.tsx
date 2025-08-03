import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useVIPManagement } from '../../hooks/useVIP';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: authState, logout } = useAuth();
  const analytics = useAnalytics();
  const vipData = useVIPManagement();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New VIP reservation received', time: '2 minutes ago', type: 'info' },
    { id: 2, message: 'Event published successfully', time: '5 minutes ago', type: 'success' },
    { id: 3, message: 'Payment processed', time: '10 minutes ago', type: 'success' }
  ]);

  // Navigation items with real-time data and VIP section
  const navigationItems = [
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: '📊',
      badge: analytics.metrics.data?.length || 0,
      description: 'Dashboard & Reports'
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: '📅',
      badge: null,
      description: 'Manage Events'
    },
    {
      name: 'VIP Management',
      path: '/admin/vip',
      icon: '🌟',
      badge: vipData.reservations?.filter(r => r.status === 'pending').length || null,
      description: 'Premium Reservations',
      isNew: true
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: '👥',
      badge: null,
      description: 'User Management'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: '⚙️',
      badge: null,
      description: 'Platform Settings'
    }
  ];

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      analytics.refetchAll();
      vipData.refetchAll();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [analytics.refetchAll, vipData.refetchAll]);

  const handleLogout = async () => {
    try {
      await logout();
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
    if (path.includes('vip')) return 'VIP Management';
    if (path.includes('users')) return 'User Management';
    if (path.includes('settings')) return 'Platform Settings';
    return 'Admin Dashboard';
  };

  const getPageIcon = () => {
    const path = location.pathname;
    if (path.includes('analytics')) return '📊';
    if (path.includes('events')) return '📅';
    if (path.includes('vip')) return '🌟';
    if (path.includes('users')) return '👥';
    if (path.includes('settings')) return '⚙️';
    return '🏠';
  };

  if (!authState.user) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl">🎫</span>
            <span className="ml-2 text-xl font-bold text-gray-900">EventHub</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <img
              src={authState.user.avatar}
              alt={authState.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{authState.user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{authState.user.role}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
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
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{item.icon}</span>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {item.isNew && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                      NEW
                    </span>
                  )}
                  {item.badge && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* VIP Quick Stats */}
        {vipData.analytics && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-900">VIP Revenue</div>
                  <div className="text-lg font-bold text-purple-700">
                    ${vipData.analytics.totalRevenue?.toLocaleString()}
                  </div>
                </div>
                <span className="text-2xl">🌟</span>
              </div>
              <div className="mt-2 text-xs text-purple-600">
                {vipData.analytics.totalReservations} total reservations
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span className="text-sm text-green-800">All Systems Operational</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              API: Online | DB: Connected | VIP: Active
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                ☰
              </button>
              <div className="flex items-center">
                <span className="text-xl mr-2">{getPageIcon()}</span>
                <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time clock */}
              <div className="text-sm text-gray-500">
                2025-08-03 04:59:40 UTC
              </div>

              {/* VIP Notifications */}
              {vipData.reservations?.some(r => r.status === 'pending') && (
                <div className="relative">
                  <button 
                    onClick={() => navigate('/admin/vip')}
                    className="relative p-2 text-purple-600 hover:text-purple-700 bg-purple-50 rounded-lg"
                    title="Pending VIP Reservations"
                  >
                    <span className="text-xl">🌟</span>
                    <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-400 text-white text-xs flex items-center justify-center">
                      {vipData.reservations.filter(r => r.status === 'pending').length}
                    </span>
                  </button>
                </div>
              )}

              {/* Regular Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <span className="text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                  )}
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  analytics.refetchAll();
                  vipData.refetchAll();
                  if ((window as any).toast) {
                    (window as any).toast.success('Data refreshed');
                  }
                }}
                disabled={analytics.loading || vipData.tiersLoading}
                className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <span className={analytics.loading || vipData.tiersLoading ? 'animate-spin' : ''}>
                  🔄
                </span>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <img
                  src={authState.user.avatar}
                  alt={authState.user.name}
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                <span className="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
          <div className="flex items-center text-sm text-gray-600">
            <span>🏠 Admin</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{getPageTitle()}</span>
            {location.pathname.includes('vip') && (
              <>
                <span className="mx-2">›</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs">
                  🌟 Premium
                </span>
              </>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              EventHub Admin Dashboard v1.0 | Connected to Mock API + VIP System
            </div>
            <div className="flex items-center space-x-4">
              <span>User: {authState.user.name}</span>
              <span>•</span>
              <span>2025-08-03 04:59:40 UTC</span>
              {vipData.analytics && (
                <>
                  <span>•</span>
                  <span className="text-purple-600 font-medium">
                    🌟 ${vipData.analytics.totalRevenue?.toLocaleString()} VIP Revenue
                  </span>
                </>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
