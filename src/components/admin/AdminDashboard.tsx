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
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card shadow-luxury transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center">
            <img 
              src="/be-logo.png" 
              alt="Boujee Events Logo" 
              className="w-8 h-8 logo-glow"
            />
            <span className="ml-2 text-xl font-bold text-luxury">Boujee Events</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
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
              className="w-10 h-10 rounded-full border-2 border-primary/20"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">{authState.user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{authState.user.role}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
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
                    ? 'bg-primary/10 text-primary border-r-4 border-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{item.icon}</span>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {item.isNew && (
                    <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs px-2 py-1 rounded-full mr-2">
                      NEW
                    </span>
                  )}
                  {item.badge && (
                    <span className="bg-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
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
          <div className="p-4 border-t border-border">
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
        <header className="bg-card shadow-elegant border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground mr-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ☰
              </button>
              <div className="flex items-center">
                <span className="text-xl mr-2">{getPageIcon()}</span>
                <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Real-time clock - hidden on mobile */}
              <div className="hidden sm:block text-sm text-muted-foreground">
                2025-08-03 04:59:40 UTC
              </div>

              {/* VIP Notifications */}
              {vipData.reservations?.some(r => r.status === 'pending') && (
                <div className="relative">
                  <button 
                    onClick={() => navigate('/admin/vip')}
                    className="relative p-2 text-primary hover:text-accent bg-primary/10 rounded-lg transition-colors"
                    title="Pending VIP Reservations"
                  >
                    <span className="text-lg sm:text-xl">🌟</span>
                    <span className="absolute -top-1 -right-1 block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                      {vipData.reservations.filter(r => r.status === 'pending').length}
                    </span>
                  </button>
                </div>
              )}

              {/* Regular Notifications */}
              <div className="relative">
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                  <span className="text-lg sm:text-xl">🔔</span>
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-destructive"></span>
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
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 hover:bg-muted rounded-lg transition-colors"
              >
                <span className={`text-lg ${analytics.loading || vipData.tiersLoading ? 'animate-spin' : ''}`}>
                  🔄
                </span>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <img
                  src={authState.user.avatar}
                  alt={authState.user.name}
                  className="w-8 h-8 rounded-full border-2 border-primary/20"
                />
                <span className="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full bg-green-400 border-2 border-card"></span>
              </div>

              {/* Logout Button - Mobile */}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Logout"
              >
                <span className="text-lg">🚪</span>
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border px-4 sm:px-6 py-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>🏠 Admin</span>
            <span className="mx-2">›</span>
            <span className="text-foreground">{getPageTitle()}</span>
            {location.pathname.includes('vip') && (
              <>
                <span className="mx-2">›</span>
                <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-1 rounded text-xs">
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
        <footer className="bg-card border-t border-border px-4 sm:px-6 py-4">
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
