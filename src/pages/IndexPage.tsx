import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'event' | 'booking' | 'user';
  message: string;
  timestamp: string;
  icon: string;
}

const IndexPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Mock stats for demonstration
      const mockStats: QuickStat[] = [
        {
          label: 'Total Events',
          value: '24',
          icon: '🎪',
          color: 'text-yellow-400'
        },
        {
          label: 'Active Users',
          value: '1,247',
          icon: '👥',
          color: 'text-blue-400'
        },
        {
          label: 'Revenue',
          value: '$45,780',
          icon: '💰',
          color: 'text-green-400'
        },
        {
          label: 'Bookings',
          value: '389',
          icon: '🎫',
          color: 'text-purple-400'
        }
      ];

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'event',
          message: 'New event "Summer Festival" was created',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          icon: '🎪'
        },
        {
          id: '2',
          type: 'booking',
          message: 'New booking for VIP Gala Night',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          icon: '🎫'
        },
        {
          id: '3',
          type: 'user',
          message: 'New user registered: sarah@example.com',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          icon: '👤'
        }
      ];

      // Try to load real data if Supabase is available
      if (supabase) {
        try {
          // Load events count
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('id', { count: 'exact' });

          if (!eventsError && eventsData) {
            mockStats[0].value = eventsData.length.toString();
          }

          // Load users count
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id', { count: 'exact' });

          if (!usersError && usersData) {
            mockStats[1].value = usersData.length.toString();
          }
        } catch (error) {
          console.error('Error loading real data:', error);
        }
      }

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDashboardPath = (): string => {
    if (!profile) return '/';
    
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'organizer':
        return '/organizer';
      case 'member':
        return '/member';
      default:
        return '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
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
              <h1 className="text-3xl font-bold text-yellow-400">
                {getGreeting()}{user ? `, ${profile?.full_name || 'User'}` : ''}! 
              </h1>
              <p className="text-gray-300 mt-1">
                {user 
                  ? `Welcome to your ${profile?.role || 'member'} dashboard`
                  : 'Welcome to Boujee Events - Premium Event Management'
                }
              </p>
            </div>
            {user && (
              <Link
                to={getUserDashboardPath()}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {user ? (
          // Authenticated User View
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className="text-3xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/events"
                  className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 hover:bg-blue-500/30 transition-colors"
                >
                  <div className="text-2xl mb-2">🎪</div>
                  <h4 className="font-semibold">Browse Events</h4>
                  <p className="text-sm text-gray-400">Discover amazing events</p>
                </Link>
                
                {(profile?.role === 'admin' || profile?.role === 'organizer') && (
                  <Link
                    to={profile.role === 'admin' ? '/admin' : '/organizer'}
                    className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 hover:bg-green-500/30 transition-colors"
                  >
                    <div className="text-2xl mb-2">➕</div>
                    <h4 className="font-semibold">Create Event</h4>
                    <p className="text-sm text-gray-400">Start planning your event</p>
                  </Link>
                )}
                
                <Link
                  to="/profile"
                  className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 hover:bg-purple-500/30 transition-colors"
                >
                  <div className="text-2xl mb-2">👤</div>
                  <h4 className="font-semibold">Profile</h4>
                  <p className="text-sm text-gray-400">Manage your account</p>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="text-white">{activity.message}</p>
                      <p className="text-sm text-gray-400">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Guest User View
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center py-12">
              <h2 className="text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
                  Premium Event Experiences
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Discover and create extraordinary events that leave lasting memories. 
                Join our exclusive community of event enthusiasts and organizers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 hover:text-black transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-4xl mb-4">🎪</div>
                <h3 className="text-xl font-semibold mb-3">Discover Events</h3>
                <p className="text-gray-400">
                  Browse curated premium events from music festivals to exclusive galas
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-4xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
                <p className="text-gray-400">
                  Seamless ticket purchasing with secure payment processing
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-4xl mb-4">👑</div>
                <h3 className="text-xl font-semibold mb-3">VIP Experience</h3>
                <p className="text-gray-400">
                  Access exclusive VIP packages and premium event experiences
                </p>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-gradient-to-r from-yellow-400/20 to-purple-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Join Our Community</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-xl text-gray-300 mb-6">
                Create your account today and start experiencing premium events.
              </p>
              <Link
                to="/signup"
                className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors"
              >
                Join Boujee Events
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;
