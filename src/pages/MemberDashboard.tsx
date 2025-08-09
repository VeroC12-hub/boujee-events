import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  quantity: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
  ticketType: 'general' | 'vip' | 'premium';
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  image: string;
  category: string;
  featured: boolean;
}

interface LoyaltyTier {
  name: string;
  benefits: string[];
  color: string;
  icon: string;
}

const MemberDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'events' | 'loyalty'>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const loyaltyTiers: Record<string, LoyaltyTier> = {
    'Platinum': {
      name: 'Platinum',
      benefits: [
        'Priority booking access',
        '20% discount on all events',
        'Exclusive VIP events',
        'Personal concierge service',
        'Free event upgrades'
      ],
      color: 'bg-purple-500',
      icon: '💎'
    },
    'Diamond': {
      name: 'Diamond',
      benefits: [
        'All Platinum benefits',
        'Backstage access to select events',
        '25% discount on all events',
        'Private event invitations',
        'Dedicated account manager',
        'Annual luxury gift package'
      ],
      color: 'bg-blue-500',
      icon: '💎'
    }
  };

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setLoading(true);

      // Mock bookings data
      const mockBookings: Booking[] = [
        {
          id: 'booking_1',
          eventId: 'event_1',
          eventTitle: 'Summer Music Festival 2025',
          eventDate: '2025-08-15',
          eventTime: '18:00',
          eventLocation: 'Central Park, New York',
          quantity: 2,
          totalAmount: 300,
          status: 'confirmed',
          bookingDate: '2025-01-10',
          ticketType: 'general'
        },
        {
          id: 'booking_2',
          eventId: 'event_2',
          eventTitle: 'Exclusive Wine Tasting Evening',
          eventDate: '2025-09-20',
          eventTime: '19:30',
          eventLocation: 'The Plaza Hotel, New York',
          quantity: 1,
          totalAmount: 250,
          status: 'confirmed',
          bookingDate: '2025-02-05',
          ticketType: 'vip'
        },
        {
          id: 'booking_3',
          eventId: 'event_3',
          eventTitle: 'Tech Innovation Summit',
          eventDate: '2025-10-12',
          eventTime: '09:00',
          eventLocation: 'San Francisco Convention Center',
          quantity: 1,
          totalAmount: 399,
          status: 'pending',
          bookingDate: '2025-03-01',
          ticketType: 'premium'
        }
      ];

      // Mock recommended events
      const mockEvents: Event[] = [
        {
          id: 'event_4',
          title: 'VIP Gala Night',
          date: '2025-11-05',
          location: 'Beverly Hills Hotel',
          price: 500,
          image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38',
          category: 'VIP Experience',
          featured: true
        },
        {
          id: 'event_5',
          title: 'Rooftop Pool Party',
          date: '2025-07-30',
          location: 'Downtown Miami',
          price: 75,
          image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec',
          category: 'Party',
          featured: false
        }
      ];

      setBookings(mockBookings);
      setRecommendedEvents(mockEvents);
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTier = (): LoyaltyTier => {
    const tierName = profile?.loyaltyTier || 'Platinum';
    return loyaltyTiers[tierName] || loyaltyTiers['Platinum'];
  };

  const getUpcomingBookings = (): Booking[] => {
    const now = new Date();
    return bookings.filter(booking => 
      new Date(booking.eventDate) > now && booking.status === 'confirmed'
    );
  };

  const getTotalSpent = (): number => {
    return bookings
      .filter(booking => booking.status === 'confirmed')
      .reduce((total, booking) => total + booking.totalAmount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">👤</div>
          <div className="text-white text-xl">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-yellow-400/20 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">Member Dashboard</h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {profile?.full_name || 'Member'}!
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Member since</div>
              <div className="font-semibold">
                {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-yellow-400">{bookings.length}</div>
            <div className="text-gray-300">Total Bookings</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-green-400">{getUpcomingBookings().length}</div>
            <div className="text-gray-300">Upcoming Events</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-blue-400">{formatCurrency(getTotalSpent())}</div>
            <div className="text-gray-300">Total Spent</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-purple-400">{getCurrentTier().icon}</div>
            <div className="text-gray-300">{getCurrentTier().name} Member</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-8">
          <div className="border-b border-white/10">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: '📊' },
                { key: 'bookings', label: 'My Bookings', icon: '🎫' },
                { key: 'events', label: 'Recommended', icon: '⭐' },
                { key: 'loyalty', label: 'Loyalty Program', icon: '👑' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Account Overview</h3>
                
                {/* Upcoming Events */}
                <div>
                  <h4 className="font-medium mb-3">Upcoming Events</h4>
                  {getUpcomingBookings().length > 0 ? (
                    <div className="space-y-3">
                      {getUpcomingBookings().slice(0, 3).map((booking) => (
                        <div key={booking.id} className="bg-white/5 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold">{booking.eventTitle}</h5>
                              <p className="text-sm text-gray-400">
                                {formatDate(booking.eventDate)} at {booking.eventTime}
                              </p>
                              <p className="text-sm text-gray-400">{booking.eventLocation}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📅</div>
                      <p className="text-gray-400">No upcoming events</p>
                      <Link
                        to="/events"
                        className="inline-block mt-4 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                      >
                        Browse Events
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      to="/events"
                      className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 hover:bg-blue-500/30 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">🎪</div>
                      <div className="font-semibold">Browse Events</div>
                    </Link>
                    <Link
                      to="/profile"
                      className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 hover:bg-green-500/30 transition-colors text-center"
                    >
                      <div className="text-2xl mb-2">👤</div>
                      <div className="font-semibold">Update Profile</div>
                    </Link>
                    <button className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-500/30 transition-colors text-center">
                      <div className="text-2xl mb-2">🎁</div>
                      <div className="font-semibold">Redeem Points</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">My Bookings</h3>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold">{booking.eventTitle}</h4>
                            <p className="text-gray-400">Booking #{booking.id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Event Details</p>
                            <p>{formatDate(booking.eventDate)} at {booking.eventTime}</p>
                            <p>{booking.eventLocation}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Booking Details</p>
                            <p>Quantity: {booking.quantity} tickets</p>
                            <p>Total: {formatCurrency(booking.totalAmount)}</p>
                            <p>Type: {booking.ticketType}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                            View Tickets
                          </button>
                          {booking.status === 'confirmed' && (
                            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎫</div>
                    <h4 className="text-xl font-semibold mb-2">No bookings yet</h4>
                    <p className="text-gray-400 mb-6">Start exploring our amazing events!</p>
                    <Link
                      to="/events"
                      className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      Browse Events
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Recommended Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recommended for You</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedEvents.map((event) => (
                    <div key={event.id} className="bg-white/5 rounded-lg overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold mb-2">{event.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">
                          {formatDate(event.date)}
                        </p>
                        <p className="text-sm text-gray-400 mb-4">{event.location}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-yellow-400">
                            {formatCurrency(event.price)}
                          </span>
                          <Link
                            to={`/event/${event.id}`}
                            className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loyalty Program Tab */}
            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Loyalty Program</h3>
                
                {/* Current Tier */}
                <div className="bg-gradient-to-r from-yellow-400/20 to-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{getCurrentTier().icon}</div>
                      <div>
                        <h4 className="text-xl font-bold">{getCurrentTier().name} Member</h4>
                        <p className="text-gray-300">Your current tier</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold mb-2">Your Benefits</h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getCurrentTier().benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tier Comparison */}
                <div>
                  <h4 className="font-semibold mb-4">All Membership Tiers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(loyaltyTiers).map((tier) => (
                      <div
                        key={tier.name}
                        className={`border rounded-lg p-6 ${
                          tier.name === getCurrentTier().name
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="text-2xl">{tier.icon}</div>
                          <div>
                            <h5 className="font-semibold">{tier.name}</h5>
                            {tier.name === getCurrentTier().name && (
                              <span className="text-xs text-yellow-400">Current Tier</span>
                            )}
                          </div>
                        </div>
                        
                        <ul className="space-y-2">
                          {tier.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
