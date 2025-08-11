// src/components/events/EventStatusBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { Event, EVENT_STATUS } from '@/types/events';

interface EventStatusBadgeProps {
  status: Event['status'];
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const statusConfig = EVENT_STATUS[status];
  
  const getIcon = () => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-3 w-3" />;
      case 'draft':
        return <Clock className="h-3 w-3" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant="secondary"
      className={`
        ${statusConfig?.color || 'bg-gray-500'} 
        text-white 
        ${sizeClasses[size]} 
        flex items-center gap-1
        ${className}
      `}
    >
      {showIcon && getIcon()}
      {statusConfig?.label || status}
    </Badge>
  );
};
