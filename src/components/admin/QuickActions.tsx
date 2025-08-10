// src/components/admin/QuickActions.tsx
import React from 'react';

interface QuickActionButton {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  action: () => void;
}

interface QuickActionsProps {
  onActionClick: (action: string) => void;
  isAdmin?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, isAdmin = false }) => {
  
  const quickActions: QuickActionButton[] = [
    {
      id: 'create-event',
      title: 'Create Event',
      description: 'Start planning a new luxury event',
      icon: '🏠',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      textColor: 'text-white',
      action: () => onActionClick('create-event')
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Monitor performance and insights',
      icon: '📊',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      textColor: 'text-white',
      action: () => onActionClick('view-analytics')
    },
    {
      id: 'manage-media',
      title: 'Manage Media',
      description: 'Upload and organize event media',
      icon: '🎬',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      textColor: 'text-white',
      action: () => onActionClick('manage-media')
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: isAdmin ? 'Manage all platform users' : 'View user information',
      icon: '👥',
      bgColor: isAdmin ? 'bg-orange-600' : 'bg-gray-600',
      hoverColor: isAdmin ? 'hover:bg-orange-700' : 'hover:bg-gray-700',
      textColor: 'text-white',
      action: () => onActionClick('user-management')
    }
  ];

  // Filter actions based on role
  const availableActions = isAdmin 
    ? quickActions 
    : quickActions.filter(action => action.id !== 'user-management' || action.id === 'user-management');

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        <span className="text-sm text-gray-400">
          {availableActions.length} actions available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`
              relative overflow-hidden group
              ${action.bgColor} ${action.hoverColor} ${action.textColor}
              rounded-xl p-6 transition-all duration-300
              transform hover:scale-105 hover:shadow-xl
              border border-white/10
              focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900
            `}
            disabled={!isAdmin && action.id === 'user-management'}
          >
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{action.icon}</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300" />
              </div>
              
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                {action.title}
              </h3>
              
              <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                {action.description}
              </p>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </button>
        ))}
      </div>

      {/* Action Status Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">
            All systems operational
          </span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Quick Action with Loading States
interface EnhancedQuickActionProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  hoverColor: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge?: {
    text: string;
    color: string;
  };
}

export const EnhancedQuickAction: React.FC<EnhancedQuickActionProps> = ({
  id,
  title,
  description,
  icon,
  bgColor,
  hoverColor,
  isLoading = false,
  disabled = false,
  onClick,
  badge
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden group
        ${bgColor} ${hoverColor}
        rounded-xl p-6 transition-all duration-300
        transform hover:scale-105 hover:shadow-xl
        border border-white/10 text-white
        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900
        ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}
      `}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
          {badge.text}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <div className="w-2 h-2 bg-white/30 rounded-full group-hover:scale-150 transition-transform duration-300" />
        </div>
        
        <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
          {description}
        </p>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    </button>
  );
};
