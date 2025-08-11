// src/components/events/EventGrid.tsx
import React from 'react';
import { Event } from '@/types/events';
import { EventCard } from './EventCard';

interface EventGridProps {
  events: Event[];
  showActions?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onStatusChange?: (event: Event, status: Event['status']) => void;
  className?: string;
}

export const EventGrid: React.FC<EventGridProps> = ({
  events,
  showActions = false,
  onEdit,
  onDelete,
  onStatusChange,
  className = ''
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No events found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No events match your current criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};
