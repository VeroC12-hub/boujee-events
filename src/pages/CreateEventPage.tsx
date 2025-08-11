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

// src/pages/EventManagementPage.tsx
import React from 'react';
import { EventManagementDashboard } from '@/components/events/EventManagementDashboard';

export const EventManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <EventManagementDashboard />
    </div>
  );
};

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
