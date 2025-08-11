// src/pages/EditEventPage.tsx
import React from 'react';
import { EventEditForm } from '@/components/events/EventEditForm';
import PublicNavbar from '@/components/navigation/PublicNavbar';

const EditEventPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
        <EventEditForm />
      </div>
    </div>
  );
};

export default EditEventPage;

// src/pages/CreateEventPage.tsx
import React from 'react';
import { EventCreationForm } from '@/components/events/EventCreationForm';
import PublicNavbar from '@/components/navigation/PublicNavbar';

const CreateEventPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
        <EventCreationForm />
      </div>
    </div>
  );
};

export default CreateEventPage;

// src/pages/EventManagementPage.tsx
import React from 'react';
import { EventManagementDashboard } from '@/components/events/EventManagementDashboard';
import PublicNavbar from '@/components/navigation/PublicNavbar';

const EventManagementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
        <EventManagementDashboard />
      </div>
    </div>
  );
};

export default EventManagementPage;

// src/pages/EventDetailPage.tsx
import React from 'react';
import { EventDetailView } from '@/components/events/EventDetailView';
import PublicNavbar from '@/components/navigation/PublicNavbar';

const EventDetailPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
        <EventDetailView showEditButton={true} />
      </div>
    </div>
  );
};

export default EventDetailPage;
