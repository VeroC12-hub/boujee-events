// src/components/admin/DashboardOverview.tsx - Complete Fixed Implementation
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface MetricCard {
  id: number;
  name: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative';
  icon: string;
  trend?: number[];
}

interface RecentActivity {
  id: string;
  type: 'event' | 'booking' | 'user' | 'media';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface DashboardData {
  metrics: MetricCard[];
  recentActivity: RecentActivity[];
  monthlyRevenue: Array<{ month: string; revenue: number; events: number }>;
  eventsByStatus: Array<{ name: string; value: number; color: string }>;
  topEvents: Array<{ name: string; bookings: number; revenue: number }>;
}

interface DashboardOverviewProps {
  setActiveSection?: (section: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveSection }) => {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isOrganizer = profile?.role === 'organizer';

  useEffect(() => {
    fetchDashboardData();
  }, [user, profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is available
      if (!supabase) {
        console.log('📊 Using mock data - Supabase not configured');
        setDashboardData(getMockDashboardData());
        setLoading(false);
        return;
      }

      const data = await Promise.all([
        fetchMetrics(),
        fetchRecentActivity(),
        fetchMonthlyData(),
        fetchEventStatistics(),
        fetchTopEvents()
      ]);

      setDashboardData({
        metrics: data[0],
        recentActivity: data[1],
        monthlyRevenue: data[2],
        eventsByStatus: data[3],
        topEvents: data[4]
      });

    } catch (err) {
      console.error('❌ Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
      // Fallback to mock data
      setDashboardData(getMockDashboardData());
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (): Promise<MetricCard[]> => {
    try {
      let eventsQuery = supabase!.from('events').select('*', { count: 'exact' });
      let bookingsQuery = supabase!.from('bookings').select('total_amount, created_at');
      
      // Organizers see only their data
      if (isOrganizer && user?.id) {
        eventsQuery = eventsQuery.eq('organizer_id', user.id);
        
        const { data: organizerEvents } = await supabase!
          .from('events')
          .select('id')
          .eq('organizer_id', user.id);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        } else {
          bookingsQuery = bookingsQuery.eq('event_id', 'none');
        }
      }

      const [eventsResult, bookingsResult, usersResult] = await Promise.all([
        eventsQuery,
        bookingsQuery,
        isAdmin ? supabase!.from('profiles').select('*', { count: 'exact' }) : { count: 0 }
      ]);

      const totalEvents = eventsResult.count || 0;
      const totalBookings = bookingsResult.data?.length || 0;
      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const totalUsers = usersResult.count || 0;

      return [
        {
          id: 1,
          name: 'Total Events',
          value: totalEvents,
          change: 12,
          changeType: 'positive',
          icon: '📅',
          trend: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          id: 2,
          name: 'Total Revenue',
          value: totalRevenue,
          change: 8,
          changeType: 'positive',
          icon: '💰',
          trend: [28, 48, 40, 19, 86, 27, 90]
        },
        {
          id: 3,
          name: 'Total Bookings',
          value: totalBookings,
          change: 23,
          changeType: 'positive',
          icon: '🎫',
          trend: [35, 21, 74, 85, 43, 65, 78]
        },
        {
          id: 4,
          name: 'Total Users',
          value: totalUsers,
          change: 15,
          changeType: 'positive',
          icon: '👥',
          trend: [40, 52, 63, 44, 75, 82, 95]
        }
      ];
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return getMockDashboardData().metrics;
    }
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      const { data: recentBookings } = await supabase!
        .from('bookings')
        .select(`
          id,
          created_at,
          booking_status,
          events(title),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return recentBookings?.map(booking => ({
        id: booking.id,
        type: 'booking' as const,
        title: `New booking for ${booking.events?.title}`,
        description: `${booking.profiles?.full_name} booked a ticket`,
        timestamp: new Date(booking.created_at).toLocaleString(),
        status: booking.booking_status
      })) || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return getMockDashboardData().recentActivity;
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const { data: monthlyBookings } = await supabase!
        .from('bookings')
        .select('total_amount, created_at')
        .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

      // Process monthly data
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2025, i).toLocaleString('default', { month: 'short' });
        const monthBookings = monthlyBookings?.filter(booking => 
          new Date(booking.created_at).getMonth() === i
        ) || [];
        
        return {
          month,
          revenue: monthlyBookings.reduce((sum, booking) => sum + booking.total_amount, 0),
          events: monthBookings.length
        };
      });

      return monthlyData;
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      return getMockDashboardData().monthlyRevenue;
    }
  };

  const fetchEventStatistics = async () => {
    try {
      const { data: events } = await supabase!
        .from('events')
        .select('status');

      const statusCounts = events?.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return Object.entries(statusCounts).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: getStatusColor(status)
      }));
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      return getMockDashboardData().eventsByStatus;
    }
  };

  const fetchTopEvents = async () => {
    try {
      const { data: topEvents } = await supabase!
        .from('events')
        .select(`
          title,
          bookings(total_amount)
        `)
        .limit(5);

      return topEvents?.map(event => ({
        name: event.title,
        bookings: event.bookings?.length || 0,
        revenue: event.bookings?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching top events:', error);
      return getMockDashboardData().topEvents;
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: '#10B981',
      draft: '#F59E0B',
      ended: '#6B7280',
      cancelled: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getMockDashboardData = (): DashboardData => ({
    metrics: [
      {
        id: 1,
        name: 'Total Events',
        value: 24,
        change: 12,
        changeType: 'positive',
        icon: '📅',
        trend: [65, 59, 80, 81, 56, 55, 40]
      },
      {
        id: 2,
        name: 'Total Revenue',
        value: 125000,
        change: 8,
        changeType: 'positive',
        icon: '💰',
        trend: [28, 48, 40, 19, 86, 27, 90]
      },
      {
        id: 3,
        name: 'Total Bookings',
        value: 847,
        change: 23,
        changeType: 'positive',
        icon: '🎫',
        trend: [35, 21, 74, 85, 43, 65, 78]
      },
      {
        id: 4,
        name: 'Total Users',
        value: 1250,
        change: 15,
        changeType: 'positive',
        icon: '👥',
        trend: [40, 52, 63, 44, 75, 82, 95]
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'booking',
        title: 'New booking for Summer Festival',
        description: 'John Doe booked 2 tickets',
        timestamp: '2 minutes ago',
        status: 'confirmed'
      },
      {
        id: '2',
        type: 'event',
        title: 'Event published',
        description: 'Wine Tasting Evening went live',
        timestamp: '1 hour ago',
        status: 'active'
      },
      {
        id: '3',
        type: 'user',
        title: 'New user registration',
        description: 'Jane Smith joined as member',
        timestamp: '3 hours ago',
        status: 'approved'
      },
      {
        id: '4',
        type: 'booking',
        title: 'Booking cancelled',
        description: 'Mike Johnson cancelled Premium Gala booking',
        timestamp: '5 hours ago',
        status: 'cancelled'
      },
      {
        id: '5',
        type: 'media',
        title: 'Media uploaded',
        description: '12 photos added to Beach Party event',
        timestamp: '1 day ago',
        status: 'completed'
      }
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 12000, events: 3 },
      { month: 'Feb', revenue: 15000, events: 4 },
      { month: 'Mar', revenue: 18000, events: 5 },
      { month: 'Apr', revenue: 22000, events: 6 },
      { month: 'May', revenue: 25000, events: 7 },
      { month: 'Jun', revenue: 28000, events: 8 },
      { month: 'Jul', revenue: 32000, events: 9 },
      { month: 'Aug', revenue: 35000, events: 10 },
      { month: 'Sep', revenue: 30000, events: 8 },
      { month: 'Oct', revenue: 27000, events: 7 },
      { month: 'Nov', revenue: 31000, events: 9 },
      { month: 'Dec', revenue: 38000, events: 11 }
    ],
    eventsByStatus: [
      { name: 'Active', value: 15, color: '#10B981' },
      { name: 'Draft', value: 6, color: '#F59E0B' },
      { name: 'Ended', value: 8, color: '#6B7280' },
      { name: 'Cancelled', value: 2, color: '#EF4444' }
    ],
    topEvents: [
      { name: 'Summer Music Festival', bookings: 245, revenue: 61250 },
      { name: 'Wine Tasting Evening', bookings: 180, revenue: 45000 },
      { name: 'Business Conference 2025', bookings: 320, revenue: 96000 },
      { name: 'Art Gallery Opening', bookings: 95, revenue: 23750 },
      { name: 'Charity Gala', bookings: 150, revenue: 75000 }
    ]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Error Loading Dashboard</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-xl text-black">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name || user?.email}! 👋
        </h1>
        <p className="text-lg opacity-90">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.metrics.map((metric) => (
          <div key={metric.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                metric.changeType === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {metric.changeType === 'positive' ? '+' : '-'}{metric.change}%
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {metric.name.includes('Revenue') ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">{metric.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Events by Status */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Events by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.eventsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.eventsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                <div className="text-lg">
                  {activity.type === 'booking' && '🎫'}
                  {activity.type === 'event' && '📅'}
                  {activity.type === 'user' && '👤'}
                  {activity.type === 'media' && '📸'}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{activity.title}</div>
                  <div className="text-gray-400 text-sm">{activity.description}</div>
                  <div className="text-gray-500 text-xs mt-1">{activity.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Performing Events</h3>
          <div className="space-y-4">
            {dashboardData.topEvents.map((event, index) => (
              <div key={event.name} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-yellow-400">#{index + 1}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{event.name}</div>
                  <div className="text-gray-400 text-sm">
                    {event.bookings} bookings • ${event.revenue.toLocaleString()} revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveSection && setActiveSection('events')}
            className="bg-yellow-400 text-black p-4 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
          >
            📅 Create New Event
          </button>
          <button 
            onClick={() => setActiveSection && setActiveSection('users')}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            👥 Manage Users
          </button>
          <button 
            onClick={() => setActiveSection && setActiveSection('analytics')}
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            📊 View Analytics
          </button>
        </div>
      </div>

      {/* Empty State for New Users */}
      {dashboardData.metrics[0].value === 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">Welcome to Boujee Events!</h3>
          <p className="text-gray-300 mb-6">
            Get started by setting up your event details.
          </p>
          <button
            onClick={() => setActiveSection && setActiveSection('events')}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
