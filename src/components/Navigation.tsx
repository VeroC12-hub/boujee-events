import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  Home, 
  Calendar, 
  Ticket, 
  Upload, 
  TrendingUp, 
  LogIn, 
  UserPlus, 
  LogOut,
  Menu,
  X,
  Shield,
  Briefcase,
  User
} from 'lucide-react';

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'organizer': return <Briefcase className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: <Home className="h-4 w-4" />, public: true },
    { href: '/events', label: 'Events', icon: <Calendar className="h-4 w-4" />, public: true },
    ...(user ? [
      { href: '/dashboard/tickets', label: 'My Tickets', icon: <Ticket className="h-4 w-4" />, protected: true },
      { href: '/dashboard/files', label: 'Upload Files', icon: <Upload className="h-4 w-4" />, protected: true },
      { href: '/dashboard/progress', label: 'Progress', icon: <TrendingUp className="h-4 w-4" />, protected: true },
    ] : [
      { href: '/login', label: 'Sign In', icon: <LogIn className="h-4 w-4" />, public: true },
      { href: '/register', label: 'Sign Up', icon: <UserPlus className="h-4 w-4" />, public: true },
    ])
  ];

  return (
    <nav className="bg-card border-b border-border/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-3xl font-bold text-primary">be</div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-foreground">Boujee Events</h1>
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
                className="flex items-center space-x-2"
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
            
            {user && (
              <div className="flex items-center space-x-4 border-l border-border pl-4">
                <div className="flex items-center space-x-2">
                  {profile && getRoleIcon(profile.role)}
                  <span className="text-sm font-medium">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button variant="outline" onClick={handleSignOut} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
              
              {user && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    {profile && getRoleIcon(profile.role)}
                    <span className="text-sm font-medium">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
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
