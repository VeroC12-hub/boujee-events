// src/pages/EditEventPage.tsx
import React from 'react';
import { EventEditForm } from '@/components/events/EventEditForm';
import { useNavigate } from 'react-router-dom';

export const EditEventPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EventEditForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
