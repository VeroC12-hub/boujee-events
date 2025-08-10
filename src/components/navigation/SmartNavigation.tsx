// src/components/navigation/SmartNavigation.tsx - Simple Dashboard Button
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SmartDashboardButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const SmartDashboardButton: React.FC<SmartDashboardButtonProps> = ({ 
  children, 
  className = "" 
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!user || !profile) {
      navigate('/login');
      return;
    }

    // Smart dashboard redirect based on user role
    switch (profile.role) {
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
        navigate('/member-dashboard');
        break;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
};
