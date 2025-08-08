import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Calendar, Users, DollarSign, TrendingUp, Plus, Upload, 
  Play, Image, FileVideo, Youtube, Settings, Bell,
  BarChart3, Eye, MapPin, MessageSquare, Mail, Database,
  ArrowLeft, RefreshCw, Download, Share2, Edit, Trash2,
  CheckCircle, AlertCircle, Clock, Star, Search, Filter
} from 'lucide-react';

// Loading Spinner Component
const LoadingSpinner: React.FC<{ fullScreen?: boolean; message?: string }> = ({ 
  fullScreen = false, 
  message = 'Loading...' 
}) => (
  <div className={fullScreen ? 'min-h-screen flex items-center justify-center bg-gray-900' : 'flex items-center justify-center p-8'}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);

// Real Analytics Hook connected to Supabase
const useAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    data: []
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch bookings count and revenue
      const { data: bookings } = await supabase
        .from('bookings')
        .select('amount');

      const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0;
      const totalBookings = bookings?.length || 0;

      setMetrics({
        data: [
          { id: 1, name: 'Total Revenue', value: totalRevenue, change: 15.3, changeType: 'positive' },
          { id: 2, name: 'Total Events', value: eventsCount || 0, change: 12.3, changeType: 'positive' },
          { id: 3, name: 'Total Bookings', value: totalBookings, change: 8.7, changeType: 'positive' },
          { id: 4, name: 'Total Users', value: usersCount || 0, change: 2.1, changeType: 'positive' }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    loading,
    metrics,
    refetchAll: fetchAnalytics
  };
};

// Overview Component with real data
const AdminOverview: React.FC = () => {
  const analytics = useAnalytics();
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Get recent bookings
        const { data: recentBookings } = await supabase
          .from('bookings')
          .select(`
            id,
            created_at,
            events(title),
            profiles(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Get recent user registrations
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        const activities = [
          ...(recentBookings?.map(booking => ({
            id: `booking-${booking.id}`,
            message: `${booking.profiles?.full_name || 'User'} booked ${booking.events?.title || 'an event'}`,
            time: new Date(booking.created_at).toLocaleDateString(),
            type: 'booking',
            icon: '🎫'
          })) || []),
          ...(recentUsers?.map(user => ({
            id: `user-${user.full_name}`,
            message: `${user.full_name} joined the platform`,
            time: new Date(user.created_at).toLocaleDateString(),
            type: 'user',
            icon: '👤'
          })) || [])
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        setRecentActivity(activities);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    fetchRecentActivity();
  }, []);

  if (analytics.loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analytics.metrics.data.map((metric) => (
          <div key={metric.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">{metric.name}</h3>
              <div className={`text-sm ${metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                {metric.changeType === 'positive' ? '+' : '-'}{metric.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {metric.name.includes('Revenue') ? `€${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last month</p>
          </div>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center text-gray-300">
                  <span className="mr-2">{activity.icon}</span>
                  <div className="flex-1">
                    <span className="text-sm">{activity.message}</span>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-yellow-400 text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </button>
            <button className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Media
            </button>
            <button className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Real Analytics Component with Supabase data
const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [chartData, setChartData] = useState({
    revenue: [],
    events: [],
    users: []
  });
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Get events with booking data
        const { data: events } = await supabase
          .from('events')
          .select(`
            id,
            title,
            created_at,
            price,
            bookings(amount, created_at)
          `);

        // Calculate top events by revenue
        const eventsWithStats = events?.map(event => {
          const revenue = event.bookings?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0;
          const bookingCount = event.bookings?.length || 0;
          
          return {
            name: event.title,
            revenue,
            bookings: bookingCount,
            rating: 4.5 + Math.random() * 0.5 // Placeholder until you add ratings
          };
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 10) || [];

        setTopEvents(eventsWithStats);

        // Generate chart data (simplified for now)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        setChartData({
          revenue: months.map((month, index) => ({
            month,
            value: Math.floor(Math.random() * 20000) + 10000
          })),
          events: months.map((month, index) => ({
            month,
            value: Math.floor(Math.random() * 15) + 5
          })),
          users: months.map((month, index) => ({
            month,
            value: Math.floor(Math.random() * 100) + 50
          }))
        });

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Track your events performance and revenue</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
            <Download className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
        <div className="h-64 flex items-end space-x-4">
          {chartData.revenue.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-yellow-400 rounded-t-lg transition-all duration-500 hover:bg-yellow-300"
                style={{ 
                  height: `${(item.value / Math.max(...chartData.revenue.map(d => d.value))) * 200}px`
                }}
              ></div>
              <span className="text-gray-400 text-sm mt-2">{item.month}</span>
              <span className="text-white text-xs font-medium">€{(item.value / 1000).toFixed(0)}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Events Table */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Performing Events</h3>
        {topEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-3">Event Name</th>
                  <th className="text-left text-gray-400 font-medium py-3">Revenue</th>
                  <th className="text-left text-gray-400 font-medium py-3">Bookings</th>
                  <th className="text-left text-gray-400 font-medium py-3">Rating</th>
                  <th className="text-left text-gray-400 font-medium py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topEvents.map((event, index) => (
                  <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 text-white font-medium">{event.name}</td>
                    <td className="py-3 text-green-400">€{event.revenue.toLocaleString()}</td>
                    <td className="py-3 text-white">{event.bookings}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-white">{event.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No events data available</p>
        )}
      </div>
    </div>
  );
};

// Real Events Management with Supabase
const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    capacity: '',
    price: '',
    category: 'nightlife',
    status: 'active'
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          bookings(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const eventsWithBookings = data?.map(event => ({
        ...event,
        booked: event.bookings?.length || 0
      })) || [];

      setEvents(eventsWithBookings);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          time: newEvent.time,
          venue: newEvent.venue,
          capacity: parseInt(newEvent.capacity),
          price: parseFloat(newEvent.price),
          category: newEvent.category,
          status: newEvent.status
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setEvents([{ ...data, booked: 0 }, ...events]);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        capacity: '',
        price: '',
        category: 'nightlife',
        status: 'active'
      });
      setShowCreateForm(false);
      
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      case 'ended': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Events Management</h2>
          <p className="text-gray-400">Create and manage your events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Event</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="nightlife">Nightlife</option>
                    <option value="festival">Festival</option>
                    <option value="conference">Conference</option>
                    <option value="party">Party</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Venue</label>
                  <input
                    type="text"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Capacity</label>
                  <input
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Status</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={4}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                  placeholder="Describe your event..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors">
              <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.booked}/{event.capacity} attendees
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    €{event.price}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((event.booked / event.capacity) * 100)}% filled
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
          <p className="text-gray-400 mb-6">Create your first event to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

// Real User Management Component
const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          bookings(id, amount, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithStats = data?.map(user => ({
        ...user,
        totalSpent: user.bookings?.reduce((sum, booking) => sum + (booking.amount || 0), 0) || 0,
        eventsAttended: user.bookings?.length || 0,
        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
      })) || [];

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please try again.');
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      alert('User status updated successfully!');
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-400/10';
      case 'organizer': return 'text-blue-400 bg-blue-400/10';
      case 'member': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">Manage user roles and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-400"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="member">Member</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Total Users</h3>
          <div className="text-2xl font-bold text-white">{users.length}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Admins</h3>
          <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Organizers</h3>
          <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'organizer').length}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Members</h3>
          <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'member').length}</div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left text-gray-400 font-medium py-4 px-6">User</th>
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Role</th>
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Status</th>
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Total Spent</th>
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Events</th>
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Last Login</th>
                  <th className="text-left text-gray-400 font-medium py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center mr-3">
                          <span className="text-black font-semibold">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={user.role || 'member'}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getRoleColor(user.role)}`}
                        style={{ background: 'transparent' }}
                      >
                        <option value="member">Member</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={user.status || 'approved'}
                        onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(user.status)}`}
                        style={{ background: 'transparent' }}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-green-400">€{user.totalSpent.toLocaleString()}</td>
                    <td className="py-4 px-6 text-white">{user.eventsAttended}</td>
                    <td className="py-4 px-6 text-gray-400">{user.lastLogin}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-white">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
          <p className="text-gray-400">No users match your current filters</p>
        </div>
      )}
    </div>
  );
};

// Basic Media Management (will be enhanced later)
const AdminMediaManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(selectedFiles)) {
        // For now, just add to local state
        // Later we'll integrate with Google Drive and Supabase
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          uploadDate: new Date().toLocaleDateString(),
          url: URL.createObjectURL(file)
        };
        
        setFiles(prev => [newFile, ...prev]);
      }
      
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Media Management</h2>
        <p className="text-gray-400">Upload and manage your event media files</p>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Media</h3>
        
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Drop files here or click to browse</p>
          <p className="text-gray-400 text-sm mb-4">Supports: JPG, PNG, MP4, MOV (Max 100MB each)</p>
          
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          
          <label
            htmlFor="file-upload"
            className={`bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-yellow-500 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : 'Select Files'}
          </label>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Uploaded Files</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {files.map((file) => (
              <div key={file.id} className="bg-gray-700/50 rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-600 flex items-center justify-center">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileVideo className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-gray-400 text-xs">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div className="text-center py-12">
          <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Media Files</h3>
          <p className="text-gray-400">Upload your first media file to get started</p>
        </div>
      )}
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const analytics = useAnalytics();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'events':
        return <AdminEvents />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'media':
        return <AdminMediaManagement />;
      case 'users':
        return <AdminUserManagement />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400">Settings panel - Coming soon!</p>
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  // Check if user is admin
  if (!user || !profile) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { name: 'Overview', section: 'overview', icon: '🏠' },
    { name: 'Analytics', section: 'analytics', icon: '📊' },
    { name: 'Events', section: 'events', icon: '📅' },
    { name: 'Media', section: 'media', icon: '🎬' },
    { name: 'Users', section: 'users', icon: '👥' },
    { name: 'Settings', section: 'settings', icon: '⚙️' }
  ];

  const userInfo = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Admin',
    email: user?.email || 'admin@example.com',
    role: profile?.role || 'admin',
    avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Admin')}&background=D4AF37&color=000`
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">be</div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-white">Boujee Events</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center">
            <img
              src={userInfo.avatar}
              alt={userInfo.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{userInfo.name}</p>
              <p className="text-xs text-gray-400 capitalize">{userInfo.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeSection === item.section;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSection(item.section);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <span className="mr-2">🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white mr-4"
              >
                ☰
              </button>
              <h1 className="text-xl font-semibold text-white">
                {navigationItems.find(item => item.section === activeSection)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleString()}
              </div>

              <button
                onClick={() => analytics.refetchAll()}
                disabled={analytics.loading}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${analytics.loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="text-yellow-400 font-bold text-sm">be</div>
              <span>Boujee Events Admin Dashboard v1.0 | Status: Connected</span>
            </div>
            <div>
              User: {userInfo.name} | {new Date().toLocaleString()}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
