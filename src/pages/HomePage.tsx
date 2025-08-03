import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Crown, Sparkles, Users, MapPin, Calendar, ArrowRight, Play,
  Shield, Award, ChevronDown, Volume2, VolumeX
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventCard from '../components/EventCard';
// Remove the @/types import if it's causing issues, or fix the path
// import { Event } from '../types';

// Hero Section Component
const Hero = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(0);
  
  const featuredEvents = [
    {
      title: "Midnight in Paradise",
      date: "Dec 31, 2025",
      location: "Private Island, Maldives",
      attendees: "500 VIP Guests",
      type: "New Year's Gala"
    },
    {
      title: "Golden Hour Festival",
      date: "Mar 15, 2025",
      location: "Château de Versailles",
      attendees: "2000 Exclusive",
      type: "Music Festival"
    },
    {
      title: "The Yacht Week Elite",
      date: "Jul 20-27, 2025",
      location: "French Riviera",
      attendees: "200 Curated",
      type: "Sailing Experience"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        <video
          className="object-cover w-full h-full"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
          
          {/* Fallback image */}
          <img 
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920"
            alt="Luxury Event"
            className="w-full h-full object-cover"
          />
        </video>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
        {/* Logo Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="text-6xl font-bold text-luxury mb-4 logo-glow">be</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Boujee Events
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">
            Where Luxury Meets Unforgettable Experiences
          </p>
        </div>

        {/* Featured Event Carousel */}
        <div className="mb-12 animate-slide-up">
          <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-sm text-accent mb-2 uppercase tracking-wide">
              {featuredEvents[currentEvent].type}
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              {featuredEvents[currentEvent].title}
            </h3>
            <div className="flex flex-wrap justify-center gap-6 text-gray-300">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {featuredEvents[currentEvent].date}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {featuredEvents[currentEvent].location}
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {featuredEvents[currentEvent].attendees}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up">
          <button
            onClick={() => navigate('/events')}
            className="btn-luxury text-lg px-8 py-4 flex items-center"
          >
            Explore Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          
          <button className="btn-outline text-lg px-8 py-4 flex items-center">
            <Play className="mr-2 w-5 h-5" />
            Watch Highlights
          </button>
        </div>

        {/* Audio Control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 right-8 glass-effect p-3 rounded-full text-white hover:text-accent transition-colors"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        {/* Add other sections here */}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
