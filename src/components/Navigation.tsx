import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Home', public: true },
    { href: '/events', label: 'Events', public: true },
    ...(user ? [
      { href: '/dashboard/tickets', label: 'My Tickets' },
      { href: '/dashboard/files', label: 'Upload Files' },
      { href: '/dashboard/progress', label: 'Progress' },
      ...(profile?.role === 'admin' ? [
        { href: '/admin-dashboard', label: 'Admin Dashboard' }
      ] : [])
    ] : [
      { href: '/login', label: 'Sign In', public: true },
    ])
  ];

  return (
    <nav className="bg-card border-b sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-3xl font-bold text-primary">be</div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold">Boujee Events</h1>
              <p className="text-xs text-muted-foreground">Setting the new standard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "default" : "ghost"}
                onClick={() => navigate(item.href)}
              >
                {item.label}
              </Button>
            ))}
            
            {user && (
              <div className="flex items-center space-x-4 border-l border-border pl-4">
                <span className="text-sm font-medium">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <Button variant="outline" onClick={handleSignOut} size="sm">
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  onClick={() => {
                    navigate(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  {item.label}
                </Button>
              ))}
              
              {user && (
                <div className="pt-4 border-t border-border">
                  <p className="px-3 py-2 text-sm">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </p>
                  <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
