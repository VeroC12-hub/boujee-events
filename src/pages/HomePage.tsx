import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HomePageEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  type: string;
  image: string;
  price: string;
  description: string;
  status: string;
  ticketsSold: number;
  maxCapacity: number;
  featured: boolean;
  tags: string[];
  basePrice: number;
  organizerId: string;
}

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<HomePageEvent[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<HomePageEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Mock event data with proper typing
      const mockEvents: HomePageEvent[] = [
        {
          id: 1,
          title: 'Summer Music Festival 2025',
          date: '2025-08-15',
          location: 'Central Park, New York',
          type: 'Festival',
          image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
          price: '$150',
          description: 'The ultimate summer music experience featuring top artists from around the world.',
          status: 'published',
          ticketsSold: 7500,
          maxCapacity: 10000,
          featured: true,
          tags: ['music', 'festival', 'outdoor'],
          basePrice: 150,
          organizerId: 'org_1'
        },
        {
          id: 2,
          title: 'Exclusive Wine Tasting Evening',
          date: '2025-09-20',
          location: 'The Plaza Hotel, New York',
          type: 'Luxury Experience',
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
          price: '$250',
          description: 'An intimate evening of premium wine tasting with renowned sommeliers.',
          status: 'published',
          ticketsSold: 35,
          maxCapacity: 50,
          featured: false,
          tags: ['wine', 'luxury', 'tasting'],
          basePrice: 250,
          organizerId: 'org_2'
        },
        {
          id: 3,
          title: 'Tech Innovation Summit',
          date: '2025-10-12',
          location: 'San Francisco Convention Center',
          type: 'Corporate',
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          price: '$399',
          description: 'Leading technology conference featuring innovative startups and industry giants.',
          status: 'published',
          ticketsSold: 1200,
          maxCapacity: 2000,
          featured: false,
          tags: ['technology', 'innovation', 'business'],
          basePrice: 399,
          organizerId: 'org_3'
        },
        {
          id: 4,
          title: 'VIP Gala Night',
          date: '2025-11-05',
          location: 'Beverly Hills Hotel',
          type: 'VIP Experience',
          image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38',
          price: '$500',
          description: 'An exclusive black-tie gala featuring celebrity performances and luxury dining.',
          status: 'published',
          ticketsSold: 180,
          maxCapacity: 300,
          featured: true,
          tags: ['vip', 'gala', 'luxury'],
          basePrice: 500,
          organizerId: 'org_4'
        },
        {
          id: 5,
          title: 'Rooftop Pool Party',
          date: '2025-07-30',
          location: 'Downtown Miami',
          type: 'Party',
          image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec',
          price: '$75',
          description: 'Summer rooftop party with DJs, cocktails, and stunning city views.',
          status: 'published',
          ticketsSold: 650,
          maxCapacity: 800,
          featured: false,
          tags: ['party', 'rooftop', 'summer'],
          basePrice: 75,
          organizerId: 'org_5'
        }
      ];
      
      setEvents(mockEvents);
      
      // Set featured event
      const featured = mockEvents.find(event => event.featured);
      setFeaturedEvent(featured || null);
      
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId: number) => {
    // Navigate to event details
    window.location.href = `/event/${eventId}`;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           event.type.toLowerCase() === selectedCategory.toLowerCase();
    const isPublished = event.status === 'published';
    
    return matchesSearch && matchesCategory && isPublished;
  });

  const categories = ['all', ...Array.from(new Set(events.map(event => event.type)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">✨</div>
          <div className="text-white text-xl">Loading amazing events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-500/20" />
        <div className="relative container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
              Boujee Events
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the finest curated events where luxury meets unforgettable moments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors"
            >
              Explore Events
            </Link>
            <Link
              to="/auth"
              className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Event</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 max-w-4xl mx-auto">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium mb-4">
                    {featuredEvent.type}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{featuredEvent.title}</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2">📅</span>
                      <span>{new Date(featuredEvent.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2">📍</span>
                      <span>{featuredEvent.location}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2">🎫</span>
                      <span>{featuredEvent.ticketsSold} / {featuredEvent.maxCapacity} tickets sold</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6">{featuredEvent.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-yellow-400">{featuredEvent.price}</span>
                    <button
                      onClick={() => handleEventClick(featuredEvent.id)}
                      className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Upcoming Events</h2>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-sm">
                        {event.type}
                      </span>
                    </div>
                    {event.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-block px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <span className="mr-2">📅</span>
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <span className="mr-2">📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <span className="mr-2">🎫</span>
                        <span>{event.ticketsSold} / {event.maxCapacity} sold</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-yellow-400">{event.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.id);
                        }}
                        className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Availability</span>
                        <span>{Math.round((event.ticketsSold / event.maxCapacity) * 100)}% sold</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(event.ticketsSold / event.maxCapacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Luxury?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of discerning individuals who trust Boujee Events for their most memorable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/events"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-colors"
            >
              Browse All Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
