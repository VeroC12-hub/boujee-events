import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showBackButton?: boolean;
  onBackToHome?: () => void;
  user?: any;
}

export function Header({ showBackButton, onBackToHome, user }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: adminUser, logout } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const currentUser = isAdminRoute ? adminUser : user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '#events', label: 'Events' },
    { href: '#about', label: 'About' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#contact', label: 'Contact' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-border/30 bg-gray-900/95 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Back Button or Logo */}
          <div className="flex items-center space-x-4">
            {showBackButton && onBackToHome ? (
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavigation('/')}
                className="flex items-center space-x-4"
              >
                {/* Use your real logo */}
                <img
                  src="/favicon.svg"
                  alt="Boujee Events Logo"
                  className="h-12 w-12 logo-glow"
                  onError={(e) => {
                    // Fallback to PNG favicon if SVG fails
                    e.currentTarget.src = '/favicon-32x32.png';
                    if (e.currentTarget.src.includes('favicon-32x32.png')) {
                      // If PNG also fails, show text logo
                      e.currentTarget.style.display = 'none';
                      const textLogo = e.currentTarget.nextElementSibling as HTMLElement;
                      if (textLogo) textLogo.style.display = 'block';
                    }
                  }}
                />
                <div className="text-3xl font-bold text-yellow-400 logo-glow" style={{ display: 'none' }}>be</div>
                <div className="hidden md:block text-left leading-tight">
                  <h1 className="text-lg font-semibold text-white">Boujee Events</h1>
                  <p className="text-xs text-gray-400">Setting the new standard</p>
                </div>
              </button>
            )}
          </div>

          {/* Desktop Navigation Links - Only show on home page */}
          <nav className={
            `hidden lg:flex items-center space-x-8 ${location.pathname === '/' && !showBackButton ? '' : 'lg:hidden'}`
          }>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Only show Sign Up for non-authenticated users on public pages */}
            {!currentUser && !isAdminRoute && (
              <button
                onClick={() => navigate('/login')}
                className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
              >
                Sign Up
              </button>
            )}

            {/* User Menu - Only for authenticated users */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {currentUser.email?.split('@')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-gray-800/95 rounded-lg p-4">
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-white hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {!currentUser && (
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-yellow-400 font-semibold"
                >
                  Sign Up
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
