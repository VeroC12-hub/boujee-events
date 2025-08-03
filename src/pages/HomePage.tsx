import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Crown, Sparkles, Users, MapPin, Calendar, ArrowRight, Play,
  Shield, Award, ChevronDown, Volume2, VolumeX
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Event } from '@/types';

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
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Boujee Events
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">
            Setting the new standard in luxury event experiences
          </p>
        </div>

        {/* Featured Event Carousel */}
        <div className="mb-12 max-w-4xl w-full">
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-primary/20">
            <div className="text-sm text-primary mb-2 uppercase tracking-wide">
              {featuredEvents[currentEvent].type}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {featuredEvents[currentEvent].title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                {featuredEvents[currentEvent].date}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                {featuredEvents[currentEvent].location}
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                {featuredEvents[currentEvent].attendees}
              </div>
            </div>
          </div>
          
          {/* Event indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentEvent(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentEvent ? 'bg-primary' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button className="btn-luxury flex items-center">
            <Crown className="w-5 h-5 mr-2" />
            Explore VIP Events
          </button>
          <button className="btn-secondary flex items-center">
            <Play className="w-5 h-5 mr-2" />
            Watch Our Story
          </button>
        </div>

        {/* Audio Control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 right-8 p-3 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </div>
      </div>
    </section>
  );
};

// Premium Features Section
const PremiumFeatures = () => {
  const features = [
    {
      icon: <Crown className="w-8 h-8" />,
      title: "VIP Experiences",
      description: "Exclusive access to luxury venues and premium services"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Curated Events",
      description: "Hand-picked events for the most discerning clientele"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Premium Security",
      description: "Top-tier security and privacy for all attendees"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "World-Class Service",
      description: "Exceptional service that exceeds expectations"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Why Choose Boujee Events?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the pinnacle of luxury event planning with our premium services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-luxury transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Events Section
const EventsSection = () => {
  const upcomingEvents = [
    {
      id: "1",
      title: "Luxury Yacht Party",
      date: "2025-08-15",
      location: "Monaco Harbor",
      price: 299,
      image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=500",
      attendees: 150,
      category: "Luxury"
    },
    {
      id: "2", 
      title: "Rooftop Gala Dinner",
      date: "2025-08-22",
      location: "Budapest Skyline",
      price: 199,
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500",
      attendees: 200,
      category: "Dining"
    },
    {
      id: "3",
      title: "Private Concert Series",
      date: "2025-09-05",
      location: "Vienna Opera House",
      price: 449,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
      attendees: 80,
      category: "Music"
    }
  ];

  return (
    <section id="events" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Upcoming Events
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover our carefully curated selection of premium experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-luxury">
            View All Events
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Setting New Standards in Luxury Events
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Since our founding, Boujee Events has been at the forefront of luxury event planning, 
              creating unforgettable experiences that exceed expectations.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Premium Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Guests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">25+</div>
                <div className="text-sm text-muted-foreground">Luxury Venues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">5★</div>
                <div className="text-sm text-muted-foreground">Client Rating</div>
              </div>
            </div>
            <button className="btn-luxury">
              Learn More About Us
            </button>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f29c8bc9eb?w=600"
              alt="Luxury Event"
              className="rounded-2xl shadow-luxury"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl" />
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
      name: "Sofia Andersson",
      role: "CEO, Nordic Enterprises",
      content: "Absolutely exceptional! Every detail was perfect, from the venue to the service.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      rating: 5
    },
    {
      name: "Marcus Chen",
      role: "Investment Director",
      content: "Boujee Events transformed our corporate gala into an unforgettable experience.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 5
    },
    {
      name: "Isabella Rodriguez",
      role: "Fashion Designer",
      content: "The attention to detail and luxury touches made our event truly special.",
      avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground">
            Hear from those who have experienced our premium services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-luxury transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-foreground mb-6">
          Ready to Create Your Next Luxury Event?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Let us help you create an unforgettable experience that exceeds all expectations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-luxury">
            <Crown className="w-5 h-5 mr-2" />
            Plan Your Event
          </button>
          <button className="btn-secondary">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Consultation
          </button>
        </div>
      </div>
    </section>
  );
};

// Main HomePage Component
const HomePage = () => {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <Hero />
      <PremiumFeatures />
      <EventsSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
