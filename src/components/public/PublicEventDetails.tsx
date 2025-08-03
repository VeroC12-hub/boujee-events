import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Star, Crown, Zap, Diamond, ArrowLeft } from 'lucide-react';
import { usePublicEvent } from '../../hooks/usePublicEvents';
import LoadingSpinner from '../common/LoadingSpinner';

const PublicEventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = usePublicEvent(id || '');

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The event you\'re looking for doesn\'t exist or is no longer available.'}
          </p>
          <button
            onClick={() => navigate('/events')}
            className="btn-luxury"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const vipTiers = [
    {
      name: 'Premium',
      price: Math.floor(event.price * 0.8),
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-gray-600',
      perks: ['General Access', 'Standard Seating', 'Event Welcome Drink']
    },
    {
      name: 'VIP',
      price: Math.floor(event.price * 1.5),
      icon: <Crown className="w-5 h-5" />,
      color: 'bg-primary',
      perks: ['VIP Area Access', 'Premium Seating', 'Complimentary Bar', 'Meet & Greet']
    },
    {
      name: 'Platinum',
      price: Math.floor(event.price * 2.5),
      icon: <Diamond className="w-5 h-5" />,
      color: 'bg-accent',
      perks: ['Exclusive Lounge', 'Private Bar', 'Concierge Service', 'VIP Transportation']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <button
              onClick={() => navigate('/events')}
              className="mb-6 flex items-center text-white hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Events
            </button>
            
            <div className="max-w-4xl">
              <div className="inline-block px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full text-primary text-sm font-medium mb-4">
                {event.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {event.title}
              </h1>
              <p className="text-xl text-gray-200 mb-6 max-w-2xl">
                {event.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                    <div className="text-sm text-gray-300">{event.time}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                    <div className="text-sm text-gray-300">Venue Location</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">{event.attendees} / {event.maxAttendees}</div>
                    <div className="text-sm text-gray-300">Attendees</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-foreground mb-6">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {event.description}
              </p>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">What to Expect</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  Luxury experience crafted for discerning guests
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  Premium entertainment and world-class service
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  Exclusive networking opportunities
                </li>
                <li className="flex items-start">
                  <Star className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  Gourmet dining and premium beverages
                </li>
              </ul>
            </div>
          </div>

          {/* VIP Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">Select Your Experience</h3>
              
              <div className="space-y-4">
                {vipTiers.map((tier, index) => (
                  <div
                    key={tier.name}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${tier.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                          {tier.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{tier.name}</div>
                          <div className="text-2xl font-bold text-primary">${tier.price.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                      {tier.perks.map((perk, perkIndex) => (
                        <li key={perkIndex} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={() => navigate(`/vip-booking/${event.id}?tier=${tier.name.toLowerCase()}`)}
                      className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors group-hover:bg-primary group-hover:text-white"
                    >
                      Select {tier.name}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Limited availability - Book now to secure your spot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEventDetails;