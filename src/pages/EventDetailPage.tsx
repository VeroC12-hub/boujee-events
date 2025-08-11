// src/pages/EventDetailPage.tsx
import React from 'react';
import { EventDetailView } from '@/components/events/EventDetailView';

export const EventDetailPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <EventDetailView showEditButton={true} />
    </div>
  );
};
