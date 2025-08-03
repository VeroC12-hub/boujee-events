import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentEvent, setCurrentEvent] = useState(0);
  
  const featuredEvents = [
    {
      title: "Midnight in Paradise",
      date: "Dec 31, 2025",
      location: "Private Island, Maldives",
      type: "New Year's Gala"
    },
    {
      title: "Golden Hour Festival", 
      date: "Mar 15, 2025",
      location: "Château de Versailles",
      type: "Music Festival"
    },
    {
      title: "The Yacht Week Elite",
      date: "Jul 20-27, 2025", 
      location: "French Riviera",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-yellow-400/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-yellow-400">be</div>
              <div>
                <h1 className="text-xl font-semibold text-white">Boujee Events</h1>
                <p className="text-xs text-gray-300">Setting the new standard</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#events" className="text-white hover:text-yellow-400 transition-colors">Events</a>
              <a href="#about" className="text-white hover:text-yellow-400 transition-colors">About</a>
              <a href="#contact" className="text-white hover:text-yellow-400 transition-colors">Contact</a>
            </nav>

            {/* Admin Link */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
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
            <div className="text-8xl font-bold text-yellow-400 mb-4">be</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Boujee Events
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
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
                  <span className="mr-2">📅</span>
                  {featuredEvents[currentEvent].date}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  {featuredEvents[currentEvent].location}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg px-8 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105">
              Explore Events →
            </button>
            
            <button className="border-2 border-white/30 text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300">
              ▶ Watch Highlights
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-8 text-white/60 text-2xl">↓</div>
        </div>
      </section>

      {/* Events Preview Section */}
      <section id="events" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Upcoming <span className="text-yellow-400">Luxury</span> Events
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105">
                <div className="h-48 bg-gradient-to-br from-yellow-400/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-6xl">🎭</span>
                </div>
                <div className="p-6">
                  <div className="text-yellow-400 text-sm uppercase tracking-wide mb-2">
                    {event.type}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-yellow-400 text-black font-semibold py-2 rounded-lg hover:bg-yellow-500 transition-colors">
                    Get Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-white/10 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-3xl font-bold text-yellow-400">be</div>
            <div>
              <h3 className="text-xl font-semibold text-white">Boujee Events</h3>
              <p className="text-sm text-gray-400">Setting the new standard</p>
            </div>
          </div>
          
          <p className="text-gray-400 mb-4">
            Creating unforgettable luxury experiences across Europe
          </p>
          
          <div className="flex justify-center space-x-6 mb-6">
            <button className="text-gray-400 hover:text-yellow-400 transition-colors">📸 Instagram</button>
            <button className="text-gray-400 hover:text-yellow-400 transition-colors">🐦 Twitter</button>
            <button className="text-gray-400 hover:text-yellow-400 transition-colors">📘 Facebook</button>
          </div>
          
          <div className="border-t border-white/10 pt-6">
            <p className="text-gray-500 text-sm">
              © 2025 Boujee Events. All rights reserved. | 2025-08-03 19:58:20 UTC | User: VeroC12-hub
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
