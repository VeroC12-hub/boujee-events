import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, Volume2, VolumeX, Calendar, MapPin, Users, Sparkles } from 'lucide-react';

const Hero = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(0);
  
  // Featured events for the carousel
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
          {/* Add your video sources here - you can use multiple formats for browser compatibility */}
          <source src="/hero-video.mp4" type="video/mp4" />
          <source src="/hero-video.webm" type="video/webm" />
          
          {/* Fallback for browsers that don't support video */}
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920')"
            }}
          />
        </video>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
        {/* Logo Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="text-6xl font-bold text-luxury mb-4 logo-glow">be</div>
          <div className="text-sm tracking-[0.3em] text-primary/80 uppercase">Luxury Event Experiences</div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-5xl leading-tight animate-fade-in-up animation-delay-200">
          Where Luxury Meets
          <span className="text-luxury block">Unforgettable Moments</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl animate-fade-in-up animation-delay-400">
          Curated experiences for those who demand excellence. 
          From exclusive festivals to private galas, we create magic.
        </p>

        {/* Featured Event Carousel */}
        <div className="glass-effect rounded-2xl p-6 mb-8 max-w-2xl w-full animate-fade-in-up animation-delay-600">
          <div className="flex items-center justify-between mb-4">
            <span className="text-primary text-sm font-semibold tracking-wide uppercase">Next Featured Event</span>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          
          <div className="text-left">
            <h3 className="text-2xl font-bold text-white mb-2">{featuredEvents[currentEvent].title}</h3>
            <p className="text-primary mb-4">{featuredEvents[currentEvent].type}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {featuredEvents[currentEvent].date}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {featuredEvents[currentEvent].location}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {featuredEvents[currentEvent].attendees}
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentEvent ? 'w-8 bg-primary' : 'bg-white/30'
                }`}
                onClick={() => setCurrentEvent(index)}
              />
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up animation-delay-800">
          <button className="btn-luxury group relative overflow-hidden">
            <span className="relative z-10">Explore Exclusive Events</span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
          <button className="px-8 py-4 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-semibold">
            Become a Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 text-center animate-fade-in-up animation-delay-1000">
          <div>
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-gray-400">Exclusive Events</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">50K+</div>
            <div className="text-sm text-gray-400">VIP Members</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">98%</div>
            <div className="text-sm text-gray-400">Satisfaction</div>
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 right-8 p-3 glass-effect rounded-full text-white hover:text-primary transition-colors duration-300"
          title={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-primary" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
