import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, profile, logout, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Use logout if available, otherwise use signOut
      if (logout) {
        await logout();
      } else if (signOut) {
        await signOut();
      }
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Events', href: '/events', icon: '🎪' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
    { name: 'Contact', href: '/contact', icon: '📞' }
  ];

  const userNavigation = user ? [
    ...(profile?.role === 'admin' ? [
      { name: 'Admin Dashboard', href: '/admin', icon: '⚡' }
    ] : []),
    ...(profile?.role === 'organizer' ? [
      { name: 'Organizer Dashboard', href: '/organizer', icon: '📊' }
    ] : []),
    { name: 'Member Dashboard', href: '/member', icon: '👤' },
    { name: 'Profile', href: '/profile', icon: '⚙️' }
  ] : [];

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-yellow-400/20 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl">✨</div>
              <span className="text-xl font-bold text-yellow-400">
                Boujee Events
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-yellow-400 text-black'
                      : 'text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400'
                    }
                  `}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors duration-200">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-semibold">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span>{profile?.full_name || 'User'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="text-sm font-medium text-white">
                          {profile?.full_name || 'User'}
                        </div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                        {profile?.role && (
                          <div className="text-xs text-yellow-400 capitalize">
                            {profile.role}
                          </div>
                        )}
                      </div>

                      {/* Navigation Links */}
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors duration-200"
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                        </Link>
                      ))}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
                      >
                        <span className="mr-2">🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/auth"
                    className="text-gray-300 hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-yellow-400 text-black hover:bg-yellow-500 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 rounded-lg mt-2">
              {/* Main Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-yellow-400 text-black'
                      : 'text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

              {/* User Section */}
              {user ? (
                <>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="px-3 py-2">
                      <div className="text-base font-medium text-white">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>

                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
                  >
                    <span className="mr-2">🚪</span>
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="border-t border-gray-700 pt-4 space-y-1">
                  <Link
                    to="/auth"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-yellow-400 text-black hover:bg-yellow-500 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
