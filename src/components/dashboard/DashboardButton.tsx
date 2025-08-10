// src/components/dashboard/DashboardButton.tsx - Working button component
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardButtonProps {
  title: string;
  description?: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  className?: string;
}

export const DashboardButton: React.FC<DashboardButtonProps> = ({
  title,
  description,
  icon,
  href,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const navigate = useNavigate();

  const getVariantClasses = () => {
    const base = 'transition-all duration-200 transform hover:scale-105 active:scale-95';
    
    switch (variant) {
      case 'primary':
        return `${base} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl`;
      case 'secondary':
        return `${base} bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30`;
      case 'success':
        return `${base} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg`;
      case 'warning':
        return `${base} bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-lg`;
      case 'danger':
        return `${base} bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg`;
      default:
        return `${base} bg-gray-500 text-white hover:bg-gray-600`;
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (onClick) {
      console.log('🖱️ Button clicked:', title);
      onClick();
    } else if (href) {
      console.log('🔗 Navigating to:', href);
      navigate(href);
    } else {
      console.warn('⚠️ Button has no action:', title);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        p-6 rounded-2xl text-left w-full
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          {description && (
            <p className="text-sm opacity-80 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="text-2xl opacity-60">→</div>
      </div>
    </button>
  );
};

// Action Button Component for quick actions
interface ActionButtonProps {
  title: string;
  icon?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon,
  onClick,
  variant = 'secondary',
  disabled = false,
  loading = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-white/10 hover:bg-white/20 text-white border border-white/20';
    }
  };

  return (
    <button
      onClick={() => {
        if (!disabled && !loading) {
          console.log('🎯 Action button clicked:', title);
          onClick();
        }
      }}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${getVariantClasses()}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        flex items-center gap-2
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span>{icon}</span>
      )}
      {title}
    </button>
  );
};

// Enhanced Dashboard Navigation
interface DashboardNavProps {
  currentPath: string;
  userRole: 'admin' | 'organizer' | 'member';
}

export const DashboardNav: React.FC<DashboardNavProps> = ({ currentPath, userRole }) => {
  const navigate = useNavigate();

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Overview', icon: '📊' },
      { path: '/events', label: 'Events', icon: '🎪' },
      { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    const roleSpecificItems = {
      admin: [
        { path: '/admin-dashboard', label: 'Admin Panel', icon: '⚙️' },
        { path: '/admin/users', label: 'User Management', icon: '👥' },
        { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { path: '/admin/media', label: 'Media Management', icon: '🖼️' },
      ],
      organizer: [
        { path: '/organizer-dashboard', label: 'Organizer Panel', icon: '🎯' },
        { path: '/organizer/events', label: 'My Events', icon: '📅' },
        { path: '/organizer/create', label: 'Create Event', icon: '➕' },
      ],
      member: [
        { path: '/member-dashboard', label: 'Member Panel', icon: '🎭' },
        { path: '/member/tickets', label: 'My Tickets', icon: '🎫' },
        { path: '/member/bookings', label: 'My Bookings', icon: '📋' },
      ]
    };

    return [...baseItems, ...roleSpecificItems[userRole]];
  };

  return (
    <nav className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {getNavItems().map((item) => (
          <button
            key={item.path}
            onClick={() => {
              console.log('🧭 Navigation:', item.path);
              navigate(item.path);
            }}
            className={`
              p-3 rounded-lg text-center transition-all
              ${currentPath === item.path 
                ? 'bg-yellow-400 text-black font-semibold' 
                : 'bg-white/10 text-white hover:bg-white/20'
              }
              hover:scale-105 active:scale-95
            `}
          >
            <div className="text-xl mb-1">{item.icon}</div>
            <div className="text-xs font-medium">{item.label}</div>
          </button>
        ))}
      </div>
    </nav>
  );
};
