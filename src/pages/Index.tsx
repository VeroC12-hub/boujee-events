import React from "react";
import { Star, Crown, Sparkles, Users, MapPin, Calendar, ArrowRight, Play, Volume2, TrendingUp, Shield, Award } from "lucide-react";

// Inline Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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

// Hero Component
const Hero = () => {
  const [currentEvent, setCurrentEvent] = React.useState(0);
  
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

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/20 to-purple-600/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
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

        {/* Featured Event Display */}
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
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold text-lg px-8 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
            Explore Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          
          <button className="border-2 border-white/30 text-white font-semibold text-lg px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
            <Play className="mr-2 w-5 h-5" />
            Watch Highlights
          </button>
        </div>
      </div>
    </section>
  );
};

// Simple Footer
const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="text-2xl font-bold text-yellow-400">be</div>
          <div>
            <h3 className="text-lg font-semibold">Boujee Events</h3>
            <p className="text-sm text-gray-400">Setting the new standard</p>
          </div>
        </div>
        <p className="text-gray-400">
          © 2025 Boujee Events. All rights reserved. | 2025-08-03 19:52:32 UTC
        </p>
      </div>
    </footer>
  );
};

const IndexPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <Hero />
        {/* Add other sections here */}
      </main>
      <Footer />
    </div>
  );
};

export default IndexPage;
