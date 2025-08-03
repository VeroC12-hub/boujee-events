import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentEvent, setCurrentEvent] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Featured events - this will be connected to admin panel
  const [featuredEvents, setFeaturedEvents] = useState([
    {
      id: 1,
      title: "Midnight in Paradise",
      date: "Dec 31, 2025",
      location: "Private Island, Maldives",
      type: "New Year's Gala",
      image: "/api/placeholder/800/400",
      price: "From €2,500",
      description: "An exclusive New Year celebration in paradise"
    },
    {
      id: 2,
      title: "Golden Hour Festival", 
      date: "Mar 15, 2025",
      location: "Château de Versailles",
      type: "Music Festival",
      image: "/api/placeholder/800/400",
      price: "From €150",
      description: "World-class musicians in a historic setting"
    },
    {
      id: 3,
      title: "The Yacht Week Elite",
      date: "Jul 20-27, 2025", 
      location: "French Riviera",
      type: "Sailing Experience",
      image: "/api/placeholder/800/400",
      price: "From €5,000",
      description: "Luxury sailing adventure along the Mediterranean"
    }
  ]);

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
    const interval = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % featuredEvents.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  const handleBookTicket = (eventId: number) => {
    navigate(`/book/${eventId}`);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center px-4">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/src/be-logo.png" 
              alt="Boujee Events Logo" 
              className="h-24 w-auto mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <div className="text-8xl font-bold text-yellow-400 mb-4" style={{ display: 'none' }}>be</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Boujee Events
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
              Where Luxury Meets Unforgettable Experiences. Premium events, exclusive venues, and memories that last a lifetime.
            </p>
          </div>

          {/* Featured Event Carousel */}
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
              <div className="text-sm text-yellow-400 mb-2 uppercase tracking-wide">
                {featuredEvents[currentEvent].type}
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {featuredEvents[currentEvent].title}
              </h3>
              <p className="text-gray-300 mb-4">
                {featuredEvents[currentEvent].description}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-gray-300 mb-6">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  {featuredEvents[currentEvent].date}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  {featuredEvents[currentEvent].location}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💰</span>
                  {featuredEvents[currentEvent].price}
                </div>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center space-x-2 mb-6">
                {featuredEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentEvent(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentEvent ? 'bg-yellow-400' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => handleBookTicket(featuredEvents[currentEvent].id)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg px-8 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105"
            >
              Book Tickets →
            </button>
            
            <button 
              onClick={() => scrollToSection('events')}
              className="border-2 border-white/30 text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300"
            >
              View All Events
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={() => scrollToSection('services')}
            className="w-8 h-8 text-white/60 text-2xl hover:text-white transition-colors"
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
            {featuredEvents.map((event, index) => (
              <div key={event.id} className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-purple-500/20 flex items-center justify-center">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-purple-500/20 flex items-center justify-center" style={{ display: 'none' }}>
                    <span className="text-6xl">🎭</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-yellow-400 mb-2 uppercase tracking-wide">
                    {event.type}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-300 mb-4">{event.description}</p>
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
                      <div className="text-lg font-bold text-yellow-400">{event.price}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookTicket(event.id)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            What Our Guests Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.review}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.event}</div>
                </div>
              </div>
            ))}
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
