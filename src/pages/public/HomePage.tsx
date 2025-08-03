import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, ArrowRight } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EventCard from '../../components/EventCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Mock featured events data - will be replaced with API calls
  const featuredEvents = [
    {
      id: '1',
      title: 'Luxury New Year Gala',
      description: 'An exclusive celebration with world-class entertainment',
      date: '2024-12-31',
      location: 'Budapest Convention Center',
      price: 150,
      image: '/placeholder.svg',
      category: 'Luxury Experiences',
      rating: 4.9,
      spotsLeft: 25
    },
    {
      id: '2', 
      title: 'Summer Music Festival',
      description: 'Three days of premium music and entertainment',
      date: '2024-06-15',
      location: 'Lake Balaton Resort',
      price: 220,
      image: '/placeholder.svg',
      category: 'Festivals',
      rating: 4.8,
      spotsLeft: 150
    },
    {
      id: '3',
      title: 'Corporate Leadership Summit',
      description: 'Networking event for business leaders',
      date: '2024-03-22',
      location: 'Hilton Budapest',
      price: 300,
      image: '/placeholder.svg', 
      category: 'Corporate',
      rating: 4.7,
      spotsLeft: 80
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/placeholder.svg')" }}
        />
        
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-luxury animate-fade-in">
            Boujee Events
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in animation-delay-400">
            Curated luxury experiences for the discerning clientele
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in animation-delay-800">
            <button 
              onClick={() => navigate('/events')}
              className="btn-luxury group"
            >
              Explore Events 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="px-8 py-4 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-lg font-semibold"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-luxury">
              Featured Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover our handpicked selection of exclusive events designed for extraordinary experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredEvents.map((event, index) => (
              <div 
                key={event.id}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 200}`}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/events')}
              className="btn-luxury"
            >
              View All Events
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center card-luxury">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-foreground">Curated Experiences</h3>
              <p className="text-muted-foreground">
                Every event is carefully selected and designed to provide unparalleled luxury and entertainment
              </p>
            </div>

            <div className="text-center card-luxury">
              <Users className="h-12 w-12 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-foreground">Exclusive Community</h3>
              <p className="text-muted-foreground">
                Join an elite network of discerning individuals who appreciate the finest experiences
              </p>
            </div>

            <div className="text-center card-luxury">
              <Star className="h-12 w-12 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-foreground">Premium Service</h3>
              <p className="text-muted-foreground">
                White-glove service and attention to detail in every aspect of your event experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-luxury">
              Event Categories
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose from our diverse range of premium event categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Festivals', icon: '🎵', description: 'Multi-day music and cultural celebrations' },
              { name: 'Luxury Experiences', icon: '✨', description: 'Exclusive high-end experiences' },
              { name: 'Parties', icon: '🎉', description: 'Sophisticated social gatherings' },
              { name: 'Corporate', icon: '🤝', description: 'Professional networking events' }
            ].map((category, index) => (
              <div 
                key={category.name}
                className={`card-luxury text-center cursor-pointer hover:scale-105 transition-transform animate-fade-in-up animation-delay-${index * 200}`}
                onClick={() => navigate(`/events?category=${encodeURIComponent(category.name)}`)}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;