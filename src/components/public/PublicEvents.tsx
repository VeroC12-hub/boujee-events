import React from 'react';
import EventsShowcase from '../EventsShowcase';

const PublicEvents: React.FC = () => {
  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover exclusive experiences curated for those who appreciate the finest things in life
          </p>
        </div>
        <EventsShowcase />
      </div>
    </div>
  );
};

export default PublicEvents;