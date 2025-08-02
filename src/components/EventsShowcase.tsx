import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Music, Briefcase, Sparkles, Ship, X, ChevronDown, Crown, Zap, Diamond } from 'lucide-react';
import LuxuryEventCard from './LuxuryEventCard';

const EventsShowcase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sample events data
  const events = [
    {
      id: '1',
      title: 'Sunset Yacht Gala',
      category: 'VIP Experience',
      date: 'Dec 15, 2025',
      time: '6:00 PM',
      venue: 'Royal Marina',
      location: 'Monaco',
      image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800',
      description: 'An exclusive evening aboard a luxury yacht',
      lineup: ['DJ Khaled', 'David Guetta', 'Martin Garrix'],
      exclusive: true,
      soldOut: false,
      tiers: [
        {
          name: 'Premium',
          price: '$750',
          perks: ['Deck Access', 'Premium Bar', 'Sunset Views'],
          available: 50,
          icon: <Zap className="w-5 h-5" />,
          color: 'bg-gray-600'
        },
        {
          name: 'VIP',
          price: '$1,500',
          perks: ['Upper Deck', 'Champagne Service', 'Meet & Greet'],
          available: 20,
          icon: <Crown className="w-5 h-5" />,
          color: 'bg-primary'
        },
        {
          name: 'Platinum',
          price: '$3,000',
          perks: ['Captain\'s Table', 'Private Bar', 'Helicopter Arrival'],
          available: 5,
          icon: <Diamond className="w-5 h-5" />,
          color: 'bg-accent'
        }
      ]
    },
    {
      id: '2',
      title: 'Golden Hour Festival',
      category: 'Festival',
      date: 'Mar 20-22, 2025',
      time: '2:00 PM',
      venue: 'Paradise Beach',
      location: 'Ibiza',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      description: '3-day luxury music festival on private beaches',
      lineup: ['Calvin Harris', 'Tiësto', 'Armin van Buuren', 'Diplo'],
      exclusive: false,
      soldOut: false,
      tiers: [
        {
          name: 'General',
          price: '$450',
          perks: ['3-Day Pass', 'Beach Access', 'Food Courts'],
          available: 500,
          icon: <Zap className="w-5 h-5" />,
          color: 'bg-gray-600'
        },
        {
          name: 'VIP',
          price: '$1,200',
          perks: ['VIP Areas', 'Premium Bars', 'Artist Lounges'],
          available: 100,
          icon: <Crown className="w-5 h-5" />,
          color: 'bg-primary'
        },
        {
          name: 'Platinum',
          price: '$2,500',
          perks: ['Backstage Access', 'Villa Accommodation', 'Private Beach'],
          available: 25,
          icon: <Diamond className="w-5 h-5" />,
          color: 'bg-accent'
        }
      ]
    },
    {
      id: '3',
      title: 'Executive Summit Gala',
      category: 'Corporate',
      date: 'Feb 10, 2025',
      time: '7:00 PM',
      venue: 'The Ritz-Carlton',
      location: 'Dubai',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      description: 'High-profile networking event for industry leaders',
      exclusive: true,
      soldOut: false,
      tiers: [
        {
          name: 'Executive',
          price: '$1,000',
          perks: ['Gala Dinner', 'Keynote Access', 'Networking'],
          available: 100,
          icon: <Zap className="w-5 h-5" />,
          color: 'bg-gray-600'
        },
        {
          name: 'VIP',
          price: '$2,000',
          perks: ['Private Dining', 'VIP Lounge', 'Gift Bag'],
          available: 30,
          icon: <Crown className="w-5 h-5" />,
          color: 'bg-primary'
        },
        {
          name: 'Platinum',
          price: '$5,000',
          perks: ['Royal Table', 'Private Meetings', 'Concierge Service'],
          available: 10,
          icon: <Diamond className="w-5 h-5" />,
          color: 'bg-accent'
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'festival', name: 'Festivals', icon: <Music className="w-4 h-4" /> },
    { id: 'vip', name: 'VIP Experience', icon: <Crown className="w-4 h-4" /> },
    { id: 'corporate', name: 'Corporate', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'yacht', name: 'Yacht Parties', icon: <Ship className="w-4 h-4" /> }
  ];

  const locations = ['all', 'Monaco', 'Ibiza', 'Dubai', 'Mykonos', 'Miami', 'Saint-Tropez'];
  const priceRanges = [
    { id: 'all', name: 'All Prices' },
    { id: 'budget', name: 'Under $500' },
    { id: 'mid', name: '$500 - $1,500' },
    { id: 'premium', name: '$1,500 - $3,000' },
    { id: 'luxury', name: '$3,000+' }
  ];

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           event.category.toLowerCase().includes(selectedCategory);
    const matchesLocation = selectedLocation === 'all' || event.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover <span className="text-luxury">Exclusive Events</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From intimate yacht parties to grand festivals, find your perfect luxury experience
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors duration-300"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 bg-card border border-border rounded-xl text-white hover:border-primary transition-colors duration-300 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 p-6 bg-card rounded-xl border border-border animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-400 mb-3 block">Category</label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
                          selectedCategory === category.id 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {category.icon}
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-400 mb-3 block">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none transition-colors duration-300"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location === 'all' ? 'All Locations' : location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-400 mb-3 block">Price Range</label>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <button
                        key={range.id}
                        onClick={() => setPriceRange(range.id)}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                          priceRange === range.id 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {range.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setPriceRange('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-sm text-gray-400 hover:text-primary transition-colors duration-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            Showing <span className="text-primary font-semibold">{filteredEvents.length}</span> exclusive events
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-primary transition-colors">
              Upcoming
            </button>
            <button className="px-4 py-2 text-sm text-primary border-b-2 border-primary">
              Featured
            </button>
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-primary transition-colors">
              Price: Low to High
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, index) => (
            <div 
              key={event.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <LuxuryEventCard event={event} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Load More */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn-luxury">
              Load More Exclusive Events
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsShowcase;
