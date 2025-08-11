// src/pages/MemberDashboard.tsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Star, Clock, MapPin, Ticket, TrendingUp, Heart } from 'lucide-react';
import PublicNavbar from '@/components/navigation/PublicNavbar';
import { EventCard } from '@/components/events/EventCard';
import { eventService } from '@/services/enhancedEventService';
import { Event } from '@/types/events';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const MemberDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberStats, setMemberStats] = useState({
    bookingsCount: 0,
    favoriteEvents: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load upcoming and featured events
      const [upcoming, featured] = await Promise.all([
        eventService.getUpcomingEvents(6),
        eventService.getFeaturedEvents(3)
      ]);
      
      setUpcomingEvents(upcoming);
      setFeaturedEvents(featured);

      // TODO: Load real member stats from bookings table
      // For now, using mock data until booking system is implemented
      setMemberStats({
        bookingsCount: 0,
        favoriteEvents: 0,
        totalSpent: 0,
        loyaltyPoints: 150
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    if (price === 0) return 'FREE';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PublicNavbar />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Member'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover and join exclusive luxury events
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Bookings</p>
                  <p className="text-2xl font-bold">{memberStats.bookingsCount}</p>
                </div>
                <Ticket className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorite Events</p>
                  <p className="text-2xl font-bold">{memberStats.favoriteEvents}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold">${memberStats.totalSpent}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loyalty Points</p>
                  <p className="text-2xl font-bold">{memberStats.loyaltyPoints}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Events */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Events
              </span>
              <Button variant="outline" onClick={() => navigate('/events')}>
                View All Events
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featuredEvents.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Featured Events
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Check back soon for exclusive featured events
                </p>
                <Button onClick={() => navigate('/events')}>
                  Browse All Events
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Upcoming Events
              </span>
              <Button variant="outline" onClick={() => navigate('/events')}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Upcoming Events
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  New events are added regularly. Check back soon!
                </p>
                <Button onClick={() => navigate('/events')}>
                  Browse All Events
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} 
                       className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => navigate(`/events/${event.id}`)}>
                    <div className="mb-3">
                      <h3 className="font-semibold line-clamp-2 mb-1">{event.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(event.event_date)} at {event.event_time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{event.venue}, {event.location}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{formatPrice(event.price, event.currency)}</span>
                        <span className="text-xs">{event.current_attendees}/{event.capacity} attending</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}/book`);
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/events')}
              >
                <Calendar className="h-6 w-6" />
                Browse Events
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/profile')}
              >
                <Users className="h-6 w-6" />
                My Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/gallery')}
              >
                <Star className="h-6 w-6" />
                Event Gallery
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/events')}
              >
                <Heart className="h-6 w-6" />
                My Favorites
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Member Benefits Card */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Member Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold mb-1">Early Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get first access to exclusive events
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl mb-2">💎</div>
                <h3 className="font-semibold mb-1">VIP Treatment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Special perks and premium experiences
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl mb-2">🎁</div>
                <h3 className="font-semibold mb-1">Rewards</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earn points and unlock exclusive rewards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
