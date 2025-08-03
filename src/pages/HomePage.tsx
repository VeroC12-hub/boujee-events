import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Crown, Sparkles, Users, MapPin, Calendar, ArrowRight, Play,
  Shield, Award, ChevronDown, Volume2, VolumeX, Search, Filter, UserPlus, LogIn
} from 'lucide-react';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import EventDiscovery from '@/components/EventDiscovery';
import PublicAuth from '@/components/PublicAuth';
import UserProfile from '@/components/UserProfile';
import { PublicUserProvider, usePublicUser } from '@/contexts/PublicUserContext';
import { Event } from '@/types/api';

// Hero Section Component
const Hero = ({ onExploreEvents, onShowAuth }: { 
  onExploreEvents: () => void;
  onShowAuth: (mode: 'login' | 'register') => void;
}) => {
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
          <button 
            onClick={onExploreEvents}
            className="btn-luxury group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Explore Exclusive Events
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
          <button 
            onClick={() => onShowAuth('register')}
            className="px-8 py-4 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-semibold flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
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

// Premium Features Section
const PremiumFeatures = () => {
  const features = [
    {
      icon: <Crown className="w-8 h-8 text-primary" />,
      title: "Exclusive VIP Access",
      description: "Curated experiences for discerning guests with unparalleled luxury and sophistication."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Bespoke Event Planning",
      description: "Tailored experiences crafted to perfection, from intimate gatherings to grand celebrations."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Elite Network",
      description: "Connect with like-minded individuals in an exclusive community of luxury event enthusiasts."
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Premium Experience
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Redefining <span className="text-luxury">Luxury Events</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We don't just organize events—we create transformative experiences that leave lasting impressions and forge meaningful connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card-luxury group hover:scale-105 transition-all duration-500 text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Events Section using EventCard component
const EventsSection = ({ onExploreEvents }: { onExploreEvents: () => void }) => {
  const navigate = useNavigate();
  
  const events: Partial<Event>[] = [
    {
      id: '1',
      title: "Sunset Yacht Gala",
      subtitle: "An exclusive evening aboard a luxury yacht",
      date: "Dec 15, 2025",
      time: "6:00 PM",
      venue: "Royal Marina",
      location: "Monaco",
      image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800",
      price: "From $750",
      category: "VIP Experience" as any,
      rating: 4.9,
      attendees: 150,
      isVip: true,
      isPremium: true
    },
    {
      id: '2',
      title: "Golden Hour Festival",
      subtitle: "3-day luxury music experience",
      date: "Mar 20-22, 2025",
      time: "2:00 PM",
      venue: "Paradise Beach",
      location: "Ibiza",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      price: "From $450",
      category: "Festival" as any,
      rating: 4.8,
      attendees: 2000,
      isVip: true,
      isPremium: false
    },
    {
      id: '3',
      title: "Executive Summit Gala",
      subtitle: "High-profile networking event",
      date: "Feb 10, 2025",
      time: "7:00 PM",
      venue: "The Ritz-Carlton",
      location: "Dubai",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      price: "From $1,000",
      category: "Corporate" as any,
      rating: 5.0,
      attendees: 300,
      isVip: true,
      isPremium: true
    }
  ];

  return (
    <section id="events" className="py-20 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Upcoming <span className="text-luxury">Exclusive Events</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover our carefully curated selection of luxury experiences designed for the discerning elite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event as any} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={onExploreEvents}
            className="btn-luxury group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Discover All Events
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  const navigate = useNavigate();
  
  return (
    <section id="about" className="py-20 px-4 md:px-6 lg:px-8 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              About Boujee Events
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Setting the New <span className="text-luxury">Standard</span>
            </h2>
            
            <p className="text-lg text-gray-400 mb-6 leading-relaxed">
              Boujee Events redefines modern event planning with digital-first, luxury-driven experiences. 
              From beach festivals to high-end socials, we design moments that stand out and scale effortlessly.
            </p>
            
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Our commitment to excellence has made us the preferred choice for industry leaders, 
              celebrities, and discerning individuals who demand nothing but the finest.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">10+</div>
                <div className="text-sm text-gray-400">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-gray-400">Events Delivered</div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/login')}
              className="btn-luxury"
            >
              Learn More About Us
            </button>
          </div>

          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"
              alt="Luxury Event"
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Alexandra Chen",
      role: "CEO, Luxury Brands International",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      content: "Boujee Events transformed our corporate gala into an unforgettable experience. The attention to detail and luxury service exceeded all expectations.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Entertainment Mogul",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      content: "Working with Boujee Events was seamless. They understood our vision and delivered a world-class event that our guests are still talking about.",
      rating: 5
    },
    {
      name: "Sofia Dubois",
      role: "Fashion Industry Executive",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      content: "The team's expertise in luxury event curation is unmatched. Every detail was perfect, from the venue to the final farewell.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by <span className="text-luxury">Industry Leaders</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it—hear from the visionaries who've experienced the Boujee difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="card-luxury group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Call to Action Section
const CTASection = ({ onShowAuth }: { onShowAuth: (mode: 'login' | 'register') => void }) => {
  const navigate = useNavigate();
  
  return (
    <section id="contact" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Experience <span className="text-luxury">Excellence?</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join the elite circle of discerning individuals who demand nothing but the finest in luxury event experiences.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => onShowAuth('register')}
            className="btn-luxury group relative overflow-hidden px-8 py-4 text-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Become a Member
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
          
          <button className="px-8 py-4 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-semibold text-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            Watch Our Story
          </button>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Exclusive Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200" />
            <span>No Setup Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400" />
            <span>24/7 Concierge</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="py-8 px-4 md:px-6 lg:px-8 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold text-luxury mb-4">be</div>
            <p className="text-gray-400 text-sm mb-4">
              Setting the new standard in luxury event experiences.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-primary" />
              <span>Premium & Secure</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">VIP Events</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Corporate Galas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Private Parties</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Yacht Experiences</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Concierge</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-6 text-center text-sm text-gray-500">
          © 2025 NexaCore Innovations. Built by Godwin Ocloo. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

// Main HomePage Component
const HomePageContent = () => {
  const [showEventDiscovery, setShowEventDiscovery] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, user } = usePublicUser();
  
  const handleExploreEvents = () => {
    setShowEventDiscovery(true);
  };

  const handleBackToHome = () => {
    setShowEventDiscovery(false);
  };

  const handleEventSelect = (event: Event) => {
    // In a real app, this would navigate to event detail page
    console.log('Selected event:', event);
    // For now, just show an alert
    alert(`Selected: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}`);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    // You could show a welcome message or redirect
  };

  const handleShowAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleShowProfile = () => {
    if (isAuthenticated) {
      setShowProfile(true);
    } else {
      handleShowAuth('login');
    }
  };

  // Auth Modal
  if (showAuth) {
    return (
      <PublicAuth
        initialMode={authMode}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // User Profile
  if (showProfile && isAuthenticated) {
    return (
      <div className="overflow-x-hidden min-h-screen bg-background">
        <Header 
          onBackToHome={() => setShowProfile(false)} 
          showBackButton 
          user={user}
          onShowAuth={handleShowAuth}
          onShowProfile={handleShowProfile}
        />
        <div className="pt-20">
          <UserProfile onClose={() => setShowProfile(false)} />
        </div>
        <Footer />
      </div>
    );
  }

  // Event Discovery
  if (showEventDiscovery) {
    return (
      <div className="overflow-x-hidden min-h-screen bg-background">
        <Header 
          onBackToHome={handleBackToHome} 
          showBackButton 
          user={user}
          onShowAuth={handleShowAuth}
          onShowProfile={handleShowProfile}
        />
        <div className="pt-20">
          <EventDiscovery onEventSelect={handleEventSelect} />
        </div>
        <Footer />
      </div>
    );
  }

  // Main Homepage
  return (
    <div className="overflow-x-hidden">
      <Header 
        user={user}
        onShowAuth={handleShowAuth}
        onShowProfile={handleShowProfile}
      />
      <Hero onExploreEvents={handleExploreEvents} onShowAuth={handleShowAuth} />
      <PremiumFeatures />
      <EventsSection onExploreEvents={handleExploreEvents} />
      <AboutSection />
      <TestimonialsSection />
      <CTASection onShowAuth={handleShowAuth} />
      <Footer />
    </div>
  );
};

const HomePage = () => {
  return (
    <PublicUserProvider>
      <HomePageContent />
    </PublicUserProvider>
  );
};

export default HomePage;
