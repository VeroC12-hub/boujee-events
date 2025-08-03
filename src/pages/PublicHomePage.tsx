import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Star, Heart, MessageCircle, Share2, 
  Filter, Search, ArrowRight, Play, Users, Clock, 
  Ticket, TrendingUp, Award, Music, Camera, Briefcase,
  ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';

const PublicHome: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredEventIndex, setFeaturedEventIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with real API calls
  const featuredEvents = [
    {
      id: 1,
      title: "Budapest Summer Music Festival 2025",
      category: "Festival",
      date: "August 15-17, 2025",
      location: "Sziget Island, Budapest",
      image: "/api/placeholder/800/400",
      price: "From €89",
      description: "Three days of non-stop music featuring international and local artists",
      rating: 4.8,
      attendees: 1200,
      tags: ["Music", "Outdoor", "Multi-day"],
      highlights: ["50+ Artists", "Food Court", "VIP Areas"]
    },
    {
      id: 2,
      title: "Luxury Wine Tasting Experience",
      category: "Luxury Experience",
      date: "September 5, 2025",
      location: "Tokaj Wine Region",
      image: "/api/placeholder/800/400",
      price: "From €150",
      description: "Exclusive wine tasting in Hungary's premier wine region",
      rating: 4.9,
      attendees: 50,
      tags: ["Wine", "Luxury", "Exclusive"],
      highlights: ["Premium Wines", "Expert Sommelier", "Gourmet Dinner"]
    },
    {
      id: 3,
      title: "Danube Corporate Gala Night",
      category: "Corporate",
      date: "October 10, 2025",
      location: "Four Seasons Hotel, Budapest",
      image: "/api/placeholder/800/400",
      price: "From €200",
      description: "Elegant corporate networking event with stunning Danube views",
      rating: 4.7,
      attendees: 300,
      tags: ["Corporate", "Networking", "Formal"],
      highlights: ["Networking", "3-Course Dinner", "Live Jazz"]
    }
  ];

  const upcomingEvents = [
    {
      id: 4,
      title: "Rooftop Summer Party",
      category: "Party",
      date: "Aug 20, 2025",
      time: "20:00",
      location: "Sky Bar, Budapest",
      image: "/api/placeholder/300/200",
      price: "€45",
      rating: 4.6,
      likes: 234,
      comments: 12
    },
    {
      id: 5,
      title: "Tech Innovation Conference",
      category: "Corporate",
      date: "Sep 1, 2025",
      time: "09:00",
      location: "Bálna Budapest",
      image: "/api/placeholder/300/200",
      price: "€120",
      rating: 4.8,
      likes: 189,
      comments: 8
    },
    {
      id: 6,
      title: "Autumn Jazz Festival",
      category: "Festival",
      date: "Oct 5-7, 2025",
      time: "18:00",
      location: "Palace of Arts",
      image: "/api/placeholder/300/200",
      price: "€75",
      rating: 4.9,
      likes: 445,
      comments: 23
    }
  ];

  const categories = [
    { id: 'all', label: 'All Events', icon: Calendar, color: '#D4AF37' },
    { id: 'festival', label: 'Festivals', icon: Music, color: '#4F46E5' },
    { id: 'luxury', label: 'Luxury', icon: Award, color: '#059669' },
    { id: 'party', label: 'Parties', icon: Camera, color: '#DC2626' },
    { id: 'corporate', label: 'Corporate', icon: Briefcase, color: '#7C3AED' }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Enthusiast",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      text: "Boujee Events consistently delivers exceptional experiences. The attention to detail is incredible!"
    },
    {
      name: "Marcus Weber",
      role: "Corporate Manager",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      text: "Our company events have never been better. Professional, elegant, and always memorable."
    },
    {
      name: "Elena Kovács",
      role: "Festival Lover",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      text: "From intimate gatherings to massive festivals, they know how to create magic."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFeaturedEventIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  const currentFeaturedEvent = featuredEvents[featuredEventIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ 
            backgroundImage: `url(${currentFeaturedEvent.image})`,
            filter: 'brightness(0.4)'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Boujee Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Setting the new standard for luxury experiences in Hungary
          </p>
          
          {/* Featured Event Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                Featured Event
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{currentFeaturedEvent.title}</h3>
            <div className="flex items-center justify-center space-x-4 text-sm mb-4">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {currentFeaturedEvent.date}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {currentFeaturedEvent.location}
              </span>
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                {currentFeaturedEvent.rating}
              </span>
            </div>
            <p className="text-gray-200 mb-4">{currentFeaturedEvent.description}</p>
            <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
              View Details & Buy Tickets
            </button>
          </div>

          {/* Featured Event Navigation */}
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => setFeaturedEventIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex space-x-2">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setFeaturedEventIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === featuredEventIndex ? 'bg-amber-500' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={() => setFeaturedEventIndex((prev) => (prev + 1) % featuredEvents.length)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-600">Discover extraordinary experiences waiting for you</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
              >
                <category.icon className="h-5 w-5 mr-2" />
                {category.label}
              </button>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, venues, or artists..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              <ChevronDown className="h-5 w-5 ml-2" />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>All Locations</option>
                    <option>Budapest</option>
                    <option>Debrecen</option>
                    <option>Szeged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>Any Price</option>
                    <option>Under €50</option>
                    <option>€50 - €100</option>
                    <option>€100 - €200</option>
                    <option>€200+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option>Any Rating</option>
                    <option>4.5+ Stars</option>
                    <option>4.0+ Stars</option>
                    <option>3.5+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{event.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-600">{event.price}</span>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {event.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {event.comments}
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] transition-transform">
                    View Details & Buy Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-8 py-3 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
              Load More Events
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gradient-to-r from-amber-500 to-yellow-500 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">What Our Guests Say</h2>
          <p className="text-xl text-white/90 mb-12">Real experiences from real people</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div className="text-left">
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-white/80">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-300 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Unforgettable Memories?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied guests who trust Boujee Events for their special occasions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform">
              Browse All Events
            </button>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicHome;
