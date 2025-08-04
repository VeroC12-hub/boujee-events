import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, MapPin, Users, Star, Heart, 
  SlidersHorizontal, Grid, List, ChevronDown, Tag, Clock
} from 'lucide-react';
import { Event } from '../types/api';

interface EventDiscoveryProps {
  events?: Event[];
  onEventSelect?: (event: Event) => void;
}

const EventDiscovery: React.FC<EventDiscoveryProps> = ({ 
  events = [], 
  onEventSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'popularity' | 'rating'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Mock events data for demonstration
  const mockEvents: Event[] = [
    {
      id: '1',
      title: "Midnight in Paradise",
      subtitle: "New Year's Ultimate VIP Experience",
      description: "Ring in the new year with an exclusive celebration featuring world-class entertainment, premium dining, and breathtaking views.",
      date: "2025-12-31",
      time: "20:00",
      endDate: "2026-01-01",
      endTime: "03:00",
      location: "Maldives",
      venue: "Private Island Resort",
      organizer: "Luxury Events Co.",
      organizerId: "org1",
      attendees: 487,
      maxAttendees: 500,
      status: "published" as const,
      category: "Luxury Experience" as const,
      price: 1500,
      priceMax: 3000,
      image: "https://images.unsplash.com/photo-1551818255-e6e10975cd67?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1551818255-e6e10975cd67?w=800",
        "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800"
      ],
      rating: 4.9,
      totalRatings: 156,
      isVip: true,
      isPremium: true,
      isFeatured: true,
      tags: ["luxury", "vip", "new-year", "exclusive"],
      coordinates: { lat: 4.1755, lng: 73.5093 },
      ticketTiers: [
        {
          id: "t1",
          name: "VIP Access",
          description: "Premium experience with all amenities",
          price: 1500,
          maxQuantity: 300,
          currentSold: 287,
          isActive: true,
          benefits: ["Premium bar", "Exclusive dining", "VIP seating"],
          color: "#8B5CF6",
          priority: 1
        }
      ],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01"
    },
    {
      id: '2',
      title: "Golden Hour Festival",
      subtitle: "3-Day Luxury Music Experience",
      description: "An immersive festival featuring world-renowned artists, gourmet food, and luxury accommodations.",
      date: "2025-03-20",
      time: "14:00",
      endDate: "2025-03-22",
      endTime: "23:00",
      location: "Ibiza",
      venue: "Paradise Beach Resort",
      organizer: "Festival Productions",
      organizerId: "org2",
      attendees: 1850,
      maxAttendees: 2000,
      status: "published" as const,
      category: "Festival" as const,
      price: 450,
      priceMax: 1200,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
      rating: 4.8,
      totalRatings: 234,
      isVip: true,
      isPremium: false,
      isFeatured: true,
      tags: ["festival", "music", "beach", "3-day"],
      coordinates: { lat: 38.9067, lng: 1.4206 },
      schedule: [
        {
          id: "s1",
          date: "2025-03-20",
          startTime: "14:00",
          endTime: "18:00",
          stage: "Main Stage",
          performer: "Opening Act",
          description: "Festival kickoff with local artists",
          type: "performance"
        }
      ],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01"
    },
    {
      id: '3',
      title: "Executive Summit Gala",
      subtitle: "High-Profile Networking Event",
      description: "Connect with industry leaders in an elegant setting featuring keynote speakers and premium networking opportunities.",
      date: "2025-02-10",
      time: "19:00",
      endTime: "23:30",
      location: "Dubai",
      venue: "The Ritz-Carlton",
      organizer: "Corporate Events Ltd",
      organizerId: "org3",
      attendees: 275,
      maxAttendees: 300,
      status: "published" as const,
      category: "Corporate" as const,
      price: 1000,
      priceMax: 2500,
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      rating: 5.0,
      totalRatings: 89,
      isVip: true,
      isPremium: true,
      isFeatured: false,
      tags: ["corporate", "networking", "luxury", "business"],
      coordinates: { lat: 25.2048, lng: 55.2708 },
      ageLimit: 21,
      dressCode: "Black tie",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01"
    }
  ];

  const displayEvents = events.length > 0 ? events : mockEvents;

  // Get unique values for filters
  const categories = ['all', ...new Set(displayEvents.map(event => event.category))];
  const locations = ['all', ...new Set(displayEvents.map(event => event.location))];

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = displayEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || event.location === selectedLocation;
      const matchesPrice = event.price >= priceRange[0] && event.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'popularity':
          return b.attendees - a.attendees;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'date':
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    return filtered;
  }, [displayEvents, searchTerm, selectedCategory, selectedLocation, priceRange, sortBy]);

  const toggleFavorite = (eventId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
    } else {
      newFavorites.add(eventId);
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (min: number, max?: number) => {
    if (max && max !== min) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    return `From $${min.toLocaleString()}`;
  };

  const formatDate = (date: string, endDate?: string) => {
    const start = new Date(date);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    
    if (endDate && endDate !== date) {
      const end = new Date(endDate);
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    }
    
    return start.toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Discover <span className="text-luxury">Exclusive Events</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Find your next unforgettable experience from our curated collection of luxury events
        </p>
      </div>

      {/* Search and Controls */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search events, locations, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-primary text-black border-primary' 
                : 'bg-background border-border text-foreground hover:bg-muted'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="popularity">Sort by Popularity</option>
            <option value="rating">Sort by Rating</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-background border border-border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-foreground'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-primary text-black' : 'text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="2000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date Filter</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              >
                <option value="all">All Dates</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="nextMonth">Next Month</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-foreground">
          <span className="font-semibold">{filteredEvents.length}</span> events found
        </p>
        <div className="text-sm text-muted-foreground">
          Showing results for luxury events
        </div>
      </div>

      {/* Events Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className={`card-luxury group hover:scale-105 transition-all duration-500 overflow-hidden cursor-pointer ${
              viewMode === 'list' ? 'flex gap-6' : ''
            }`}
            onClick={() => onEventSelect?.(event)}
          >
            {/* Event Image */}
            <div className={`relative overflow-hidden rounded-lg ${
              viewMode === 'list' ? 'w-64 h-48 flex-shrink-0' : 'h-64 mb-4'
            }`}>
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Event Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {event.isFeatured && (
                  <span className="bg-primary text-black px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </span>
                )}
                {event.isVip && (
                  <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    VIP
                  </span>
                )}
                <span className="bg-accent text-black px-2 py-1 rounded-full text-xs font-semibold">
                  {event.category}
                </span>
              </div>

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(event.id);
                }}
                className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <Heart 
                  className={`h-4 w-4 ${favorites.has(event.id) ? 'fill-red-500 text-red-500' : ''}`} 
                />
              </button>

              {/* Price */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full">
                <span className="font-bold text-sm">
                  {formatPrice(event.price, event.priceMax)}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className={`space-y-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                {event.subtitle && (
                  <p className="text-muted-foreground text-sm">{event.subtitle}</p>
                )}
              </div>

              {/* Rating */}
              {event.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(event.rating!) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {event.rating} ({event.totalRatings} reviews)
                  </span>
                </div>
              )}

              {/* Event Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {formatDate(event.date, event.endDate)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  {event.time} {event.endTime && `- ${event.endTime}`}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {event.venue ? `${event.venue}, ${event.location}` : event.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  {event.attendees.toLocaleString()} attending • {event.maxAttendees - event.attendees} spots left
                </div>
              </div>

              {/* Tags */}
              {event.tags && (
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                  {event.tags.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                      +{event.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground text-sm line-clamp-2">
                {event.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button className="btn-luxury flex-1">
                  Get Tickets
                </button>
                <button className="px-4 py-2 border border-primary text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms to find more events.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLocation('all');
              setPriceRange([0, 2000]);
            }}
            className="btn-luxury"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDiscovery;