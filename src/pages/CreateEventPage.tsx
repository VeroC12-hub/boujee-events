// src/pages/CreateEventPage.tsx
import React from 'react';
import { EventCreationForm } from '@/components/events/EventCreationForm';
import { useNavigate } from 'react-router-dom';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EventCreationForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
