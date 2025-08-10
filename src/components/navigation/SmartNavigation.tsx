// src/components/navigation/SmartNavigation.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SmartDashboardButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const SmartDashboardButton: React.FC<SmartDashboardButtonProps> = ({ 
  className = "", 
  children = "Dashboard" 
}) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleDashboardClick = () => {
    if (!user) {
      // Not logged in - go to login
      navigate('/login');
      return;
    }

    // Route based on user role
    switch (profile?.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'organizer':
        navigate('/organizer-dashboard');
        break;
      case 'member':
        navigate('/member-dashboard');
        break;
      default:
        // Fallback for users without proper role
        navigate('/profile');
        break;
    }
  };

  return (
    <button
      onClick={handleDashboardClick}
      className={className}
    >
      {children}
    </button>
  );
};
