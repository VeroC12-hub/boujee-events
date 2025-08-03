import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, Event } from '../services/eventService';
import { newsletterService } from '../services/newsletterService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentEvent, setCurrentEvent] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dynamic events from admin panel
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(0);

  const services = [
    {
      icon: "🎭",
      title: "Luxury Events",
      description: "Exclusive gatherings in the world's most prestigious venues"
    },
    {
      icon: "🏖️",
      title: "Destination Experiences",
      description: "Curated adventures in breathtaking locations worldwide"
    },
    {
      icon: "🎵",
      title: "Music Festivals",
      description: "Premium access to the hottest music events and festivals"
    },
    {
      icon: "⛵",
      title: "VIP Experiences",
      description: "Behind-the-scenes access and exclusive perks"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      event: "Monaco Grand Prix Weekend",
      review: "Absolutely incredible experience! Every detail was perfect.",
      rating: 5
    },
    {
      name: "Michael Chen",
      event: "Ibiza Villa Experience",
      review: "Boujee Events exceeded all expectations. Pure luxury!",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      event: "Paris Fashion Week",
      review: "Professional, seamless, and unforgettable. Highly recommend!",
      rating: 5
    }
  ];

  useEffect(() => {
    // Load events from admin-managed data
    const loadEvents = () => {
      const featured = eventService.getFeaturedEvents();
      const all = eventService.getAllEvents();
      setFeaturedEvents(featured);
      setAllEvents(all);
    };

    // Load newsletter subscriber count
    const loadNewsletterData = () => {
      const count = newsletterService.getActiveSubscriberCount();
      setSubscriberCount(count);
    };

    loadEvents();
    loadNewsletterData();

    // Listen for storage changes to update events in real-time
    const handleStorageChange = () => {
      loadEvents();
      loadNewsletterData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % featuredEvents.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleBookTicket = (eventId: number) => {
    navigate(`/book/${eventId}`);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterLoading(true);
    setNewsletterMessage('');

    try {
      const result = await newsletterService.subscribe(newsletterEmail);
      setNewsletterMessage(result.message);
      
      if (result.success) {
        setNewsletterEmail('');
        setSubscriberCount(newsletterService.getActiveSubscriberCount());
        
        // Show success toast if available
        if ((window as any).toast) {
          (window as any).toast.success('Successfully subscribed to newsletter!');
        }
      } else {
        // Show error toast if available
        if ((window as any).toast) {
          (window as any).toast.error(result.message);
        }
      }
    } catch (error) {
      setNewsletterMessage('An error occurred. Please try again.');
      if ((window as any).toast) {
        (window as any).toast.error('Newsletter subscription failed');
      }
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-yellow-400/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <img 
                src="/src/be-logo.png" 
                alt="Boujee Events Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                  // Fallback to text logo if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }}>
                <div className="text-3xl font-bold text-yellow-400">be</div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Boujee Events</h1>
                <p className="text-xs text-gray-300">Setting the new standard</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('events')}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                Events
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                Contact
              </button>
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => scrollToSection('events')}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Book Now
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white hover:text-yellow-400"
            >
              ☰
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-white/20">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    scrollToSection('events');
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:text-yellow-400 transition-colors text-left"
                >
                  Events
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('services');
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:text-yellow-400 transition-colors text-left"
                >
                  Services
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('about');
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:text-yellow-400 transition-colors text-left"
                >
                  About
                </button>
                <button 
                  onClick={() => {
                    scrollToSection('contact');
                    setIsMenuOpen(false);
                  }}
                  className="text-white hover:text-yellow-400 transition-colors text-left"
                >
                  Contact
                </button>
                <button
                  onClick={() => {
                    scrollToSection('events');
                    setIsMenuOpen(false);
                  }}
                  className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors w-fit"
                >
                  Book Now
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <section className="relative h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-yellow-400/30 to-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400/60 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400/60 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '4s'}}></div>
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce" style={{animationDelay: '3s', animationDuration: '5s'}}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Logo with enhanced styling */}
          <div className="mb-8">
            <img 
              src="/src/be-logo.png" 
              alt="Boujee Events Logo" 
              className="h-24 w-auto mx-auto mb-4 drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <div className="text-8xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4 drop-shadow-lg" style={{ display: 'none' }}>be</div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent mb-6 leading-tight">
              Boujee Events
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              Where Luxury Meets Unforgettable Experiences. Premium events, exclusive venues, and memories that last a lifetime.
            </p>
          </div>

          {/* Enhanced Featured Event Carousel */}
          {featuredEvents.length > 0 && (
            <div className="mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto border border-white/20 shadow-2xl">
                <div className="text-sm text-yellow-400 mb-2 uppercase tracking-wide font-semibold">
                  {featuredEvents[currentEvent]?.type || 'Featured Event'}
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {featuredEvents[currentEvent]?.title || 'Loading...'}
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {featuredEvents[currentEvent]?.description || 'Loading event details...'}
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-gray-300 mb-6">
                  <div className="flex items-center bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="mr-2">📅</span>
                    {featuredEvents[currentEvent]?.date || 'TBD'}
                  </div>
                  <div className="flex items-center bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="mr-2">📍</span>
                    {featuredEvents[currentEvent]?.location || 'TBD'}
                  </div>
                  <div className="flex items-center bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="mr-2">💰</span>
                    {featuredEvents[currentEvent]?.price || 'TBD'}
                  </div>
                </div>
                
                {/* Enhanced Carousel Indicators */}
                <div className="flex justify-center space-x-2 mb-6">
                  {featuredEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEvent(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentEvent 
                          ? 'bg-yellow-400 w-8 shadow-lg shadow-yellow-400/50' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced CTA Buttons */}
          {featuredEvents.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => handleBookTicket(featuredEvents[currentEvent]?.id || 1)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg px-8 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-yellow-400/25"
              >
                Book Tickets →
              </button>
              
              <button 
                onClick={() => scrollToSection('events')}
                className="border-2 border-white/30 text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl"
              >
                View All Events
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={() => scrollToSection('services')}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 text-2xl hover:text-white hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            ↓
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Our Premium Services
          </h2>
          <p className="text-xl text-gray-300 text-center mb-16 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we create extraordinary experiences tailored to your vision.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-300">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Preview Section */}
      <section id="events" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Upcoming Luxury Events
          </h2>
          <p className="text-xl text-gray-300 text-center mb-16">
            Discover our carefully curated selection of premium experiences
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(allEvents.length > 0 ? allEvents : featuredEvents).map((event, index) => (
              <div key={event.id} className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/20">
                <div className="relative aspect-video bg-gradient-to-br from-yellow-400/20 to-purple-500/20 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-purple-500/20 flex items-center justify-center" style={{ display: 'none' }}>
                    <span className="text-6xl">🎭</span>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <button
                        onClick={() => handleBookTicket(event.id)}
                        className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-sm text-yellow-400 mb-2 uppercase tracking-wide font-semibold">
                    {event.type}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">{event.title}</h3>
                  <p className="text-gray-300 mb-4 group-hover:text-gray-200 transition-colors duration-300">{event.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-400">
                      <div className="flex items-center mb-1">
                        <span className="mr-2">📅</span>
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        {event.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">{event.price}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookTicket(event.id)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform group-hover:scale-105"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced Carousel */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            What Our Guests Say
          </h2>
          <p className="text-xl text-gray-300 text-center mb-16">
            Hear from our satisfied clients about their luxury experiences
          </p>
          
          {/* Testimonials Carousel */}
          <div className="relative max-w-4xl mx-auto mb-8">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mx-4">
                      <div className="text-center">
                        <div className="flex justify-center mb-6">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-2xl mx-1">⭐</span>
                          ))}
                        </div>
                        <blockquote className="text-gray-300 text-lg mb-6 italic leading-relaxed">
                          "{testimonial.review}"
                        </blockquote>
                        <div className="border-t border-white/10 pt-6">
                          <div className="font-semibold text-white text-xl">{testimonial.name}</div>
                          <div className="text-yellow-400 text-sm mt-1">{testimonial.event}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Controls */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-yellow-400 w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Testimonial Navigation Arrows */}
          <div className="flex justify-center space-x-8 mt-6">
            <button
              onClick={() => setCurrentTestimonial((prev) => 
                prev === 0 ? testimonials.length - 1 : prev - 1
              )}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => 
                (prev + 1) % testimonials.length
              )}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-400/10 to-purple-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Stay in the Loop</h2>
          <p className="text-xl text-gray-300 mb-8">
            Be the first to know about exclusive events, VIP experiences, and special offers
          </p>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={newsletterLoading}
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={newsletterLoading || !newsletterEmail.trim()}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-8 py-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:transform-none"
              >
                {newsletterLoading ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
            
            {newsletterMessage && (
              <p className={`text-sm mt-4 ${newsletterMessage.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
                {newsletterMessage}
              </p>
            )}
            
            <p className="text-sm text-gray-400 mt-4">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
          
          {/* Social Proof */}
          <div className="mt-8 text-gray-300">
            <p className="text-sm">
              Join over {subscriberCount > 0 ? subscriberCount.toLocaleString() : '10,000'} luxury event enthusiasts
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-8">About Boujee Events</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            For over a decade, Boujee Events has been crafting extraordinary experiences for discerning clients worldwide. 
            From intimate soirées to grand celebrations, we specialize in creating moments that transcend the ordinary.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-gray-300">Events Produced</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-gray-300">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">10k+</div>
              <div className="text-gray-300">Happy Guests</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Get In Touch</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-4 text-xl">📧</span>
                  <div>
                    <div className="text-white font-semibold">Email</div>
                    <a href="mailto:hello@boujeeevents.com" className="text-gray-300 hover:text-yellow-400 transition-colors">
                      hello@boujeeevents.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-4 text-xl">📱</span>
                  <div>
                    <div className="text-white font-semibold">Phone</div>
                    <a href="tel:+1234567890" className="text-gray-300 hover:text-yellow-400 transition-colors">
                      +1 (234) 567-8900
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-4 text-xl">📍</span>
                  <div>
                    <div className="text-white font-semibold">Headquarters</div>
                    <div className="text-gray-300">New York, London, Monaco</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Quick Inquiry</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <textarea
                  rows={4}
                  placeholder="Tell us about your event..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <img 
                src="/src/be-logo.png" 
                alt="Boujee Events Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'block';
                }}
              />
              <div className="text-2xl font-bold text-yellow-400" style={{ display: 'none' }}>be</div>
              <div>
                <h3 className="text-xl font-bold text-white">Boujee Events</h3>
                <p className="text-sm text-gray-400">Setting the new standard</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 mb-8">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
              📸 Instagram
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
              🐦 Twitter
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
              📘 Facebook
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
              💼 LinkedIn
            </a>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Boujee Events. All rights reserved. | 2025-08-03 21:38:31 UTC | Premium Event Management
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
