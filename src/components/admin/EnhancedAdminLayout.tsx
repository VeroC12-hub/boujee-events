import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, DollarSign, Users, Settings, Bell, Search, 
  Menu, X, Home, Plus, Eye, MapPin, Ticket, MessageSquare, 
  Mail, Upload, Database, TrendingUp, Star, Shield, UserCheck,
  ChevronDown, LogOut, Moon, Sun
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const EnhancedAdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract colors from logo (placeholder - you'll implement actual extraction)
  const logoColors = {
    primary: '#D4AF37', // Gold
    secondary: '#F5F5DC', // Beige
    accent: '#B8860B', // Dark Goldenrod
    background: '#FFFEF7' // Ivory
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin', color: logoColors.primary },
    { icon: Calendar, label: 'Events', path: '/admin/events', color: '#4F46E5' },
    { icon: MapPin, label: 'Venues', path: '/admin/venues', color: '#059669' },
    { icon: Ticket, label: 'Tickets', path: '/admin/tickets', color: '#DC2626' },
    { icon: Users, label: 'Users', path: '/admin/users', color: '#7C3AED' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', color: '#EA580C' },
    { icon: MessageSquare, label: 'Comments', path: '/admin/comments', color: '#0891B2' },
    { icon: Mail, label: 'Newsletter', path: '/admin/newsletter', color: '#BE185D' },
    { icon: Database, label: 'Google Drive', path: '/admin/drive', color: '#65A30D' },
    { icon: Upload, label: 'Media Library', path: '/admin/media', color: '#9333EA' },
    { icon: Settings, label: 'Settings', path: '/admin/settings', color: '#6B7280' },
  ];

  const quickStats = [
    { label: 'Active Events', value: '12', change: '+2', icon: Calendar, color: logoColors.primary },
    { label: 'Total Revenue', value: '€45,230', change: '+15%', icon: DollarSign, color: '#059669' },
    { label: 'Tickets Sold', value: '1,234', change: '+8%', icon: Ticket, color: '#DC2626' },
    { label: 'New Users', value: '89', change: '+23%', icon: Users, color: '#7C3AED' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-background'}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-border'}
        border-r shadow-lg
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img 
              src="/be-logo.png" 
              alt="Boujee Events" 
              className="h-10 w-auto"
              style={{ filter: `drop-shadow(0 0 10px ${logoColors.primary}50)` }}
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold" style={{ color: logoColors.primary }}>
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Event Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-border dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-background dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                  <span className="text-xs text-green-600 dark:text-green-400">{stat.change}</span>
                </div>
                <div className="mt-1">
                  <p className="text-sm font-semibold dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center px-6 py-3 text-left transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-r-3 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-background dark:hover:bg-gray-700'
                }
              `}
              style={isActive(item.path) ? { borderRightColor: item.color } : {}}
            >
              <item.icon 
                className="h-5 w-5 mr-3" 
                style={{ color: isActive(item.path) ? item.color : undefined }}
              />
              <span className="font-medium">{item.label}</span>
              {item.label === 'Comments' && notifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-border dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <img
              src="/api/placeholder/32/32"
              alt="Admin User"
              className="h-8 w-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white dark:text-white truncate">
                VeroC12-hub
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-500">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-border dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-white dark:text-white">
                  {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Quick Actions */}
              <button 
                onClick={() => navigate('/admin/events/new')}
                className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: logoColors.primary }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default EnhancedAdminLayout;
