import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, MapPin, Grid, List, SlidersHorizontal } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EventCard from '../../components/EventCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const EventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Mock events data - will be replaced with API calls
  const allEvents = [
    {
      id: '1',
      title: 'Luxury New Year Gala',
      description: 'An exclusive celebration with world-class entertainment, featuring live performances and gourmet dining',
      date: '2024-12-31',
      time: '20:00',
      location: 'Budapest Convention Center',
      address: '1123 Budapest, Alkotás utca 1-3',
      price: 150,
      image: '/placeholder.svg',
      category: 'Luxury Experiences',
      rating: 4.9,
      spotsLeft: 25,
      totalSpots: 200,
      organizer: 'Elite Events Budapest'
    },
    {
      id: '2',
      title: 'Summer Music Festival',
      description: 'Three days of premium music and entertainment with international artists',
      date: '2024-06-15',
      time: '14:00',
      location: 'Lake Balaton Resort',
      address: '8230 Balatonfüred, Széchenyi István utca 1',
      price: 220,
      image: '/placeholder.svg',
      category: 'Festivals',
      rating: 4.8,
      spotsLeft: 150,
      totalSpots: 5000,
      organizer: 'Balaton Events'
    },
    {
      id: '3',
      title: 'Corporate Leadership Summit',
      description: 'Networking event for business leaders and entrepreneurs',
      date: '2024-03-22',
      time: '09:00',
      location: 'Hilton Budapest',
      address: '1014 Budapest, Hess András tér 1-3',
      price: 300,
      image: '/placeholder.svg',
      category: 'Corporate',
      rating: 4.7,
      spotsLeft: 80,
      totalSpots: 150,
      organizer: 'Business Network Hungary'
    },
    {
      id: '4',
      title: 'VIP Wine Tasting Evening',
      description: 'Exclusive wine tasting with renowned sommeliers',
      date: '2024-04-10',
      time: '19:00',
      location: 'Four Seasons Hotel',
      address: '1051 Budapest, Széchenyi István tér 5-6',
      price: 180,
      image: '/placeholder.svg',
      category: 'Luxury Experiences',
      rating: 4.9,
      spotsLeft: 30,
      totalSpots: 50,
      organizer: 'Wine Society Budapest'
    },
    {
      id: '5',
      title: 'Rooftop Jazz Party',
      description: 'Sophisticated jazz evening with panoramic city views',
      date: '2024-05-18',
      time: '21:00',
      location: 'High Note Budapest',
      address: '1051 Budapest, Váci utca 47',
      price: 80,
      image: '/placeholder.svg',
      category: 'Parties',
      rating: 4.6,
      spotsLeft: 120,
      totalSpots: 200,
      organizer: 'Jazz Club Budapest'
    }
  ];

  const categories = ['all', 'Festivals', 'Luxury Experiences', 'Parties', 'Corporate'];
  const locations = ['all', 'Budapest', 'Lake Balaton', 'Debrecen', 'Szeged'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-100', label: 'Under €100' },
    { value: '100-200', label: '€100 - €200' },
    { value: '200-300', label: '€200 - €300' },
    { value: '300+', label: '€300+' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Popularity' }
  ];

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = allEvents.filter(event => {
      // Search filter
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;

      // Location filter
      const matchesLocation = selectedLocation === 'all' || 
                             event.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // Price filter
      let matchesPrice = true;
      if (priceRange !== 'all') {
        if (priceRange === '0-100') matchesPrice = event.price < 100;
        else if (priceRange === '100-200') matchesPrice = event.price >= 100 && event.price < 200;
        else if (priceRange === '200-300') matchesPrice = event.price >= 200 && event.price < 300;
        else if (priceRange === '300+') matchesPrice = event.price >= 300;
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return (b.totalSpots - b.spotsLeft) - (a.totalSpots - a.spotsLeft);
        case 'date':
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

    return filtered;
  }, [allEvents, searchTerm, selectedCategory, selectedLocation, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-background to-card/50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-luxury">
            Premium Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Discover and book exclusive events curated for the finest experiences
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 bg-card/30 sticky top-0 z-40 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>

              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Extended Filters */}
          {isFilterOpen && (
            <div className="mt-6 p-6 card-luxury">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location === 'all' ? 'All Locations' : location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedLocation('all');
                      setPriceRange('all');
                      setSortBy('date');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events Grid/List */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {filteredAndSortedEvents.length} Events Found
              </h2>
              <p className="text-muted-foreground">
                {searchTerm && `Showing results for "${searchTerm}"`}
              </p>
            </div>
          </div>

          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-12 card-luxury">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">No Events Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
                setPriceRange('all');
              }}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
                : 'space-y-6'
              }
            `}>
              {filteredAndSortedEvents.map(event => (
                <div key={event.id} className="animate-fade-in">
                  <EventCard event={event} viewMode={viewMode} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;