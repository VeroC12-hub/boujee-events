import React from 'react';
import Hero from '../Hero';
import EventsShowcase from '../EventsShowcase';
import AboutSection from '../AboutSection';

const PublicHomepage: React.FC = () => {
  return (
    <div>
      <Hero />
      <EventsShowcase />
      <AboutSection />
    </div>
  );
};

export default PublicHomepage;