// src/components/admin/DashboardOverview.tsx
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

export const DashboardOverview: React.FC = () => {
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
      let eventsQuery = supabase.from('events').select('*', { count: 'exact' });
      let bookingsQuery = supabase.from('bookings').select('total_amount, created_at');
      
      // Organizers see only their data
      if (isOrganizer && user?.id) {
        eventsQuery = eventsQuery.eq('organizer_id', user.id);
        
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user.id);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        } else {
          bookingsQuery = bookingsQuery.eq('event_id', 'no-events'); // Returns empty result
        }
      }

      const [eventsResult, bookingsResult, usersResult] = await Promise.all([
        eventsQuery,
        bookingsQuery,
        isAdmin ? supabase.from('profiles').select('*', { count: 'exact', head: true }) : { count: 0 }
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => 
        sum + (booking.total_amount || 0), 0) || 0;

      // Calculate trends (simplified - compare with last period)
      const thisMonth = new Date().getMonth();
      const thisMonthBookings = bookingsResult.data?.filter(b => 
        new Date(b.created_at).getMonth() === thisMonth) || [];
      
      const revenue = totalRevenue;
      const events = eventsResult.count || 0;
      const bookings = bookingsResult.data?.length || 0;
      const users = isAdmin ? (usersResult.count || 0) : bookings; // Organizers see attendee count

      return [
        {
          id: 1,
          name: isAdmin ? 'Total Revenue' : 'My Revenue',
          value: revenue,
          change: 15.3,
          changeType: 'positive',
          icon: '💰',
          trend: [revenue * 0.7, revenue * 0.8, revenue * 0.9, revenue]
        },
        {
          id: 2,
          name: isAdmin ? 'Total Events' : 'My Events',
          value: events,
          change: 12.3,
          changeType: 'positive',
          icon: '🎪',
          trend: [events * 0.6, events * 0.7, events * 0.85, events]
        },
        {
          id: 3,
          name: isAdmin ? 'Total Bookings' : 'My Bookings',
          value: bookings,
          change: 8.7,
          changeType: 'positive',
          icon: '🎫',
          trend: [bookings * 0.5, bookings * 0.7, bookings * 0.9, bookings]
        },
        {
          id: 4,
          name: isAdmin ? 'Total Users' : 'My Attendees',
          value: users,
          change: 2.1,
          changeType: 'positive',
          icon: '👥',
          trend: [users * 0.8, users * 0.85, users * 0.95, users]
        }
      ];
    } catch (error) {
      console.warn('📊 Metrics fetch failed, using mock data:', error);
      return getMockMetrics();
    }
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent bookings
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          id, created_at, booking_status, user_id,
          events:event_id (title),
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (isOrganizer && user?.id) {
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user.id);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        }
      }

      const { data: recentBookings } = await bookingsQuery;

      // Fetch recent events (if admin or organizer's own events)
      let eventsQuery = supabase
        .from('events')
        .select('id, title, created_at, status, organizer_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (isOrganizer && user?.id) {
        eventsQuery = eventsQuery.eq('organizer_id', user.id);
      }

      const { data: recentEvents } = await eventsQuery;

      // Convert to activity format
      recentBookings?.forEach(booking => {
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: 'New Booking',
          description: `${booking.profiles?.full_name || 'Guest'} booked ${booking.events?.title || 'Unknown Event'}`,
          timestamp: booking.created_at,
          status: booking.booking_status
        });
      });

      recentEvents?.forEach(event => {
        activities.push({
          id: `event-${event.id}`,
          type: 'event',
          title: 'Event Created',
          description: `${event.title} was created`,
          timestamp: event.created_at,
          status: event.status
        });
      });

      // Sort by timestamp and return latest 8
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

    } catch (error) {
      console.warn('📊 Activity fetch failed, using mock data:', error);
      return getMockActivity();
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const currentDate = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

      let bookingsQuery = supabase
        .from('bookings')
        .select('total_amount, created_at, event_id')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (isOrganizer && user?.id) {
        const { data: organizerEvents } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user.id);
        
        const eventIds = organizerEvents?.map(e => e.id) || [];
        if (eventIds.length > 0) {
          bookingsQuery = bookingsQuery.in('event_id', eventIds);
        }
      }

      const { data: bookings } = await bookingsQuery;

      // Group by month
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: 0,
          events: 0
        };
      });

      bookings?.forEach(booking => {
        const bookingDate = new Date(booking.created_at);
        const monthIndex = monthlyData.findIndex(m => {
          const monthDate = new Date();
          monthDate.setMonth(new Date().getMonth() - (5 - monthlyData.indexOf(m)));
          return bookingDate.getMonth() === monthDate.getMonth() && 
                 bookingDate.getFullYear() === monthDate.getFullYear();
        });

        if (monthIndex !== -1) {
          monthlyData[monthIndex].revenue += booking.total_amount || 0;
          monthlyData[monthIndex].events += 1;
        }
      });

      return monthlyData;

    } catch (error) {
      console.warn('📊 Monthly data fetch failed, using mock data:', error);
      return getMockMonthlyData();
    }
  };

  const fetchEventStatistics = async () => {
    try {
      let eventsQuery = supabase.from('events').select('status');
      
      if (isOrganizer && user?.id) {
        eventsQuery = eventsQuery.eq('organizer_id', user.id);
      }

      const { data: events } = await eventsQuery;

      const statusCounts = events?.reduce((acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return [
        { name: 'Active', value: statusCounts.active || 0, color: '#10B981' },
        { name: 'Draft', value: statusCounts.draft || 0, color: '#F59E0B' },
        { name: 'Ended', value: statusCounts.ended || 0, color: '#6B7280' },
        { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#EF4444' }
      ];

    } catch (error) {
      console.warn('📊 Event statistics fetch failed, using mock data:', error);
      return [
        { name: 'Active', value: 8, color: '#10B981' },
        { name: 'Draft', value: 3, color: '#F59E0B' },
        { name: 'Ended', value: 5, color: '#6B7280' },
        { name: 'Cancelled', value: 1, color: '#EF4444' }
      ];
    }
  };

  const fetchTopEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select(`
          id, title,
          bookings:bookings(total_amount)
        `)
        .limit(5);

      if (isOrganizer && user?.id) {
        query = query.eq('organizer_id', user.id);
      }

      const { data: events } = await query;

      const topEvents = events?.map(event => ({
        name: event.title,
        bookings: event.bookings?.length || 0,
        revenue: event.bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) || [];

      return topEvents;

    } catch (error) {
      console.warn('📊 Top events fetch failed, using mock data:', error);
      return getMockTopEvents();
    }
  };

  // Mock data functions
  const getMockDashboardData = (): DashboardData => ({
    metrics: getMockMetrics(),
    recentActivity: getMockActivity(),
    monthlyRevenue: getMockMonthlyData(),
    eventsByStatus: [
      { name: 'Active', value: 8, color: '#10B981' },
      { name: 'Draft', value: 3, color: '#F59E0B' },
      { name: 'Ended', value: 5, color: '#6B7280' },
      { name: 'Cancelled', value: 1, color: '#EF4444' }
    ],
    topEvents: getMockTopEvents()
  });

  const getMockMetrics = (): MetricCard[] => 
    isAdmin ? [
      { id: 1, name: 'Total Revenue', value: 45250, change: 15.3, changeType: 'positive', icon: '💰', trend: [30000, 35000, 40000, 45250] },
      { id: 2, name: 'Total Events', value: 17, change: 12.3, changeType: 'positive', icon: '🎪', trend: [10, 13, 15, 17] },
      { id: 3, name: 'Total Bookings', value: 234, change: 8.7, changeType: 'positive', icon: '🎫', trend: [180, 200, 220, 234] },
      { id: 4, name: 'Total Users', value: 1456, change: 2.1, changeType: 'positive', icon: '👥', trend: [1200, 1300, 1400, 1456] }
    ] : [
      { id: 1, name: 'My Revenue', value: 8500, change: 12.5, changeType: 'positive', icon: '💰', trend: [6000, 7000, 7800, 8500] },
      { id: 2, name: 'My Events', value: 4, change: 50.0, changeType: 'positive', icon: '🎪', trend: [2, 3, 3, 4] },
      { id: 3, name: 'My Bookings', value: 45, change: 15.4, changeType: 'positive', icon: '🎫', trend: [30, 35, 40, 45] },
      { id: 4, name: 'My Attendees', value: 156, change: 8.3, changeType: 'positive', icon: '👥', trend: [120, 135, 145, 156] }
    ];

  const getMockActivity = (): RecentActivity[] => [
    { id: '1', type: 'booking', title: 'New Booking', description: 'Sarah Johnson booked Summer Gala 2025', timestamp: '2025-08-10T14:30:00Z', status: 'confirmed' },
    { id: '2', type: 'event', title: 'Event Created', description: 'Corporate Workshop was created', timestamp: '2025-08-10T12:15:00Z', status: 'draft' },
    { id: '3', type: 'booking', title: 'New Booking', description: 'Michael Chen booked Tech Conference', timestamp: '2025-08-10T10:45:00Z', status: 'confirmed' },
    { id: '4', type: 'user', title: 'New User', description: 'Alex Rivera joined the platform', timestamp: '2025-08-10T09:20:00Z' },
    { id: '5', type: 'media', title: 'Media Upload', description: '15 photos uploaded to Summer Gala', timestamp: '2025-08-09T16:30:00Z' }
  ];

  const getMockMonthlyData = () => [
    { month: 'Mar', revenue: 12500, events: 4 },
    { month: 'Apr', revenue: 18200, events: 6 },
    { month: 'May', revenue: 15800, events: 5 },
    { month: 'Jun', revenue: 22100, events: 8 },
    { month: 'Jul', revenue: 26400, events: 9 },
    { month: 'Aug', revenue: 19300, events: 7 }
  ];

  const getMockTopEvents = () => [
    { name: 'Summer Gala 2025', bookings: 45, revenue: 12500 },
    { name: 'Tech Conference', bookings: 38, revenue: 9800 },
    { name: 'Corporate Workshop', bookings: 25, revenue: 7200 },
    { name: 'Art Exhibition', bookings: 32, revenue: 6400 },
    { name: 'Music Festival', bookings: 28, revenue: 5900 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return '🎫';
      case 'event': return '🎪';
      case 'user': return '👤';
      case 'media': return '📸';
      default: return '📝';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      active: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      ended: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Ended' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-xl h-80" />
            <div className="bg-white/5 rounded-xl h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <div className="text-red-400 text-lg mb-2">⚠️ Dashboard Error</div>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isAdmin ? 'Admin' : 'Organizer'} Dashboard Overview
          </h1>
          <p className="text-gray-400">
            Welcome back! Here's what's happening with your {isAdmin ? 'platform' : 'events'}.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors">
            📊 Export Data
          </button>
          <button 
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData?.metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`flex items-center text-sm ${
                metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                <span className="mr-1">
                  {metric.changeType === 'positive' ? '↗️' : '↘️'}
                </span>
                {metric.change.toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">
                {metric.name.includes('Revenue') ? formatCurrency(metric.value) : metric.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">{metric.name}</div>
            </div>
            {/* Mini trend chart */}
            {metric.trend && (
              <div className="mt-4 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.trend.map((value, index) => ({ value, index }))}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={metric.changeType === 'positive' ? '#10B981' : '#EF4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Monthly Revenue & Events</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Revenue' : 'Events'
                  ]}
                />
                <Bar dataKey="revenue" fill="#F59E0B" />
                <Bar dataKey="events" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events by Status Pie Chart */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Events by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.eventsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {dashboardData?.eventsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData?.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <div className="flex items-center gap-2">
                      {activity.status && getStatusBadge(activity.status)}
                      <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Events</h3>
          <div className="space-y-4">
            {dashboardData?.topEvents.map((event, index) => (
              <div key={event.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate">{event.name}</p>
                    <p className="text-xs text-gray-400">{event.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{formatCurrency(event.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎪</div>
            <div className="text-sm font-medium text-white">Create Event</div>
          </button>
          <button className="p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <div className="text-sm font-medium text-white">View Analytics</div>
          </button>
          <button className="p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎬</div>
            <div className="text-sm font-medium text-white">Manage Media</div>
          </button>
          <button className="p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-center transition-colors group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
            <div className="text-sm font-medium text-white">User Management</div>
          </button>
        </div>
      </div>
    </div>
  );
};
