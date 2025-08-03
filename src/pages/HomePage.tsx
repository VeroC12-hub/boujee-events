import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Crown, Sparkles, Users, MapPin, Calendar, ArrowRight, Play,
  Shield, Award, ChevronDown, Volume2, VolumeX
} from 'lucide-react';

// Simple inline Header for HomePage (to avoid import issues)
const SimpleHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-yellow-400">be</div>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-white">Boujee Events</h1>
              <p className="text-xs text-gray-300">Setting the new standard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#events" className="text-white hover:text-yellow-400 transition-colors">Events</a>
            <a href="#about" className="text-white hover:text-yellow-400 transition-colors">About</a>
            <a href="#testimonials" className="text-white hover:text-yellow-400 transition-colors">Testimonials</a>
            <a href="#contact" className="text-white hover:text-yellow-400 transition-colors">Contact</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300">
              Get Tickets
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-white/20">
            <nav className="flex flex-col space-y-4">
              <a href="#events" className="text-white hover:text-yellow-400 transition-colors">Events</a>
              <a href="#about" className="text-white hover:text-yellow-400 transition-colors">About</a>
              <a href="#testimonials" className="text-white hover:text-yellow-400 transition-colors">Testimonials</a>
              <a href="#contact" className="text-white hover:text-yellow-400 transition-colors">Contact</a>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-2 rounded-full mt-4">
                Get Tickets
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Simple inline Footer for HomePage
const SimpleFooter = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl font-bold text-yellow-400">be</div>
              <div>
                <h3 className="text-xl font-semibold">Boujee Events</h3>
                <p className="text-sm text-gray-400">Setting the new standard</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Creating unforgettable luxury experiences across Europe. 
              From exclusive VIP events to world-class entertainment.
            </p>
            <div className="flex space-x-4">
              <button className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors">📸</button>
              <button className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors">🐦</button>
              <button className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors">📘</button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">VIP Events</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Corporate Galas</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Private Parties</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Yacht Experiences</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 info@boujeeevents.com</li>
              <li>📱 +33 1 23 45 67 89</li>
              <li>📍 Paris, France</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Boujee Events. All rights reserved. | 2025-08-03 19:52:32 UTC
          </p>
        </div>
      </div>
    </footer>
  );
};

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
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-yellow-400 mb-4">be</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Boujee Events
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl">
            Where Luxury Meets Unforgettable Experiences
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
        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => navigate('/events')}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold text-lg px-8 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            Explore Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          
          <button className="border-2 border-white/30 text-white font-semibold text-lg px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
            <Play className="mr-2 w-5 h-5" />
            Watch Highlights
          </button>
        </div>

        {/* Audio Control */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:text-yellow-400 transition-colors"
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
    <div className="min-h-screen bg-black">
      <SimpleHeader />
      <main>
        <Hero />
        {/* Add other sections here */}
      </main>
      <SimpleFooter />
    </div>
  );
};

export default HomePage;
