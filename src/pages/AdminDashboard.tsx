import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { googleDriveService } from '../services/googleDriveService';

// Define proper types for state arrays
interface MetricData {
  id: number;
  name: string;
  value: number;
  change: number;
  changeType: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  capacity: number;
  price: number;
  category: string;
  status: string;
  booked: number;
  created_at: string;
}

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  bookings: any[];
  totalSpent: number;
  eventsAttended: number;
  lastLogin: string;
}

interface NotificationData {
  id: string;
  message: string;
  time: string;
  type: string;
  icon: string;
  read?: boolean;
}

interface ChartData {
  month: string;
  value: number;
}

interface TopEventData {
  name: string;
  revenue: number;
  bookings: number;
  rating: number;
}

interface FileData {
  id: string | number;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url?: string;
  thumbnailLink?: string;
  driveFile: boolean;
}

const AdminDashboard: React.FC = () => {
  // Properly typed state arrays
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [bookingData, setBookingData] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [topEvents, setTopEvents] = useState<TopEventData[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Initialize metrics with proper typing
      const initialMetrics: MetricData[] = [
        { id: 1, name: 'Total Events', value: 145, change: 12, changeType: 'increase' },
        { id: 2, name: 'Active Users', value: 2840, change: 8, changeType: 'increase' },
        { id: 3, name: 'Monthly Revenue', value: 48650, change: 15, changeType: 'increase' },
        { id: 4, name: 'Booking Rate', value: 87, change: 5, changeType: 'increase' }
      ];
      setMetrics(initialMetrics);

      // Load events from Supabase if available
      if (supabase) {
        try {
          const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (eventsError) throw eventsError;

          if (eventsData && eventsData.length > 0) {
            const formattedEvents: EventData[] = eventsData.map((event: any) => ({
              id: event.id,
              title: event.title,
              description: event.description,
              event_date: event.date,
              event_time: event.time,
              venue: event.location,
              capacity: event.capacity || event.max_attendees,
              price: event.price,
              category: event.category,
              status: event.status,
              booked: event.current_attendees || 0,
              created_at: event.created_at
            }));
            setEvents(formattedEvents);
          } else {
            // Fallback to mock data
            loadMockEventData();
          }
        } catch (error) {
          console.error('Error loading events from Supabase:', error);
          loadMockEventData();
        }

        // Load users
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (usersError) throw usersError;

          if (usersData && usersData.length > 0) {
            const formattedUsers: UserData[] = usersData.map((user: any) => ({
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              role: user.role,
              status: user.status,
              created_at: user.created_at,
              bookings: [],
              totalSpent: 0,
              eventsAttended: 0,
              lastLogin: new Date().toISOString()
            }));

            // Calculate user statistics
            for (const user of formattedUsers) {
              const { data: userBookings } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', user.id);

              if (userBookings) {
                user.bookings = userBookings;
                user.totalSpent = userBookings.reduce((sum: number, booking: any) => sum + (booking.total_amount || 0), 0);
                user.eventsAttended = userBookings.length;
              }
            }

            setUsers(formattedUsers);
          } else {
            loadMockUserData();
          }
        } catch (error) {
          console.error('Error loading users:', error);
          loadMockUserData();
        }
      } else {
        // Load mock data
        loadMockEventData();
        loadMockUserData();
      }

      // Load notifications
      const mockNotifications: NotificationData[] = [
        { id: '1', message: 'New event "Summer Festival" created', time: '2 min ago', type: 'success', icon: '🎉', read: false },
        { id: '2', message: 'User registration spike detected', time: '15 min ago', type: 'info', icon: '📈', read: false },
        { id: '3', message: 'Payment system maintenance scheduled', time: '1 hour ago', type: 'warning', icon: '⚠️', read: true }
      ];
      setNotifications(mockNotifications);

      // Load Google Drive files if service is available
      await loadDriveFiles();

      // Load chart data
      const mockChartData: ChartData[] = [
        { month: 'Jan', value: 1200 },
        { month: 'Feb', value: 1900 },
        { month: 'Mar', value: 3000 },
        { month: 'Apr', value: 5000 },
        { month: 'May', value: 4000 },
        { month: 'Jun', value: 6000 }
      ];
      setChartData(mockChartData);

      const mockBookingData: ChartData[] = [
        { month: 'Jan', value: 400 },
        { month: 'Feb', value: 600 },
        { month: 'Mar', value: 800 },
        { month: 'Apr', value: 1200 },
        { month: 'May', value: 1000 },
        { month: 'Jun', value: 1500 }
      ];
      setBookingData(mockBookingData);

      const mockRevenueData: ChartData[] = [
        { month: 'Jan', value: 15000 },
        { month: 'Feb', value: 23000 },
        { month: 'Mar', value: 18000 },
        { month: 'Apr', value: 32000 },
        { month: 'May', value: 28000 },
        { month: 'Jun', value: 45000 }
      ];
      setRevenueData(mockRevenueData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMockEventData = () => {
    const mockEvents: EventData[] = [
      {
        id: 'event_1',
        title: 'Summer Music Festival',
        description: 'A spectacular outdoor music festival',
        event_date: '2025-08-15',
        event_time: '18:00',
        venue: 'Central Park Amphitheater',
        capacity: 5000,
        price: 89,
        category: 'Festival',
        status: 'published',
        booked: 3200,
        created_at: new Date().toISOString()
      },
      {
        id: 'event_2',
        title: 'Tech Innovation Summit',
        description: 'Leading technology conference',
        event_date: '2025-09-20',
        event_time: '09:00',
        venue: 'Convention Center',
        capacity: 1500,
        price: 299,
        category: 'Corporate',
        status: 'published',
        booked: 890,
        created_at: new Date().toISOString()
      }
    ];
    setEvents(mockEvents);
  };

  const loadMockUserData = () => {
    const mockUsers: UserData[] = [
      {
        id: 'user_1',
        full_name: 'John Smith',
        email: 'john@example.com',
        role: 'member',
        status: 'approved',
        created_at: new Date().toISOString(),
        bookings: [],
        totalSpent: 450,
        eventsAttended: 3,
        lastLogin: new Date().toISOString()
      },
      {
        id: 'user_2',
        full_name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'organizer',
        status: 'approved',
        created_at: new Date().toISOString(),
        bookings: [],
        totalSpent: 1200,
        eventsAttended: 8,
        lastLogin: new Date().toISOString()
      }
    ];
    setUsers(mockUsers);
  };

  const loadDriveFiles = async () => {
    try {
      if (googleDriveService && await googleDriveService.isAuthenticated()) {
        const driveFiles = await googleDriveService.listFiles('root', 50);
        
        const formattedFiles: FileData[] = driveFiles.map((file, index) => ({
          id: file.id,
          name: file.name,
          size: parseInt(file.size || '0'),
          type: file.mimeType?.includes('image') ? 'image' : 
                file.mimeType?.includes('video') ? 'video' : 'file',
          uploadDate: file.createdTime,
          url: file.webViewLink,
          thumbnailLink: file.thumbnailLink,
          driveFile: true
        }));

        setFiles(formattedFiles);
      } else {
        // Mock file data when Google Drive is not available
        const mockFiles: FileData[] = [
          {
            id: 1,
            name: 'event-banner.jpg',
            size: 2048576,
            type: 'image',
            uploadDate: new Date().toISOString(),
            url: '#',
            driveFile: false
          },
          {
            id: 2,
            name: 'promo-video.mp4',
            size: 15728640,
            type: 'video',
            uploadDate: new Date().toISOString(),
            url: '#',
            driveFile: false
          }
        ];
        setFiles(mockFiles);
      }
    } catch (error) {
      console.error('Error loading Drive files:', error);
      setFiles([]);
    }
  };

  const handleDeleteFile = async (fileId: string | number, isDriveFile: boolean) => {
    try {
      if (isDriveFile && typeof fileId === 'string' && googleDriveService.deleteFile) {
        await googleDriveService.deleteFile(fileId);
      }
      
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleEventAction = (eventId: string, action: 'edit' | 'delete' | 'view') => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    switch (action) {
      case 'view':
        setSelectedEvent(event);
        setShowEventModal(true);
        break;
      case 'edit':
        // Handle edit
        console.log('Edit event:', eventId);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this event?')) {
          setEvents(prev => prev.filter(e => e.id !== eventId));
        }
        break;
    }
  };

  const handleUserAction = (userId: string, action: 'approve' | 'suspend' | 'delete' | 'makeAdmin') => {
    setUsers(prev => prev.map(user => {
      if (user.id !== userId) return user;
      
      switch (action) {
        case 'approve':
          return { ...user, status: 'approved' };
        case 'suspend':
          return { ...user, status: 'suspended' };
        case 'makeAdmin':
          return { ...user, role: 'admin' };
        case 'delete':
          // Handle deletion separately
          return user;
        default:
          return user;
      }
    }));

    if (action === 'delete') {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <div className="text-white text-xl">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Dashboard Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-yellow-400/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Admin Dashboard</h1>
            <p className="text-gray-300 mt-1">Manage your premium events platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
              <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                🔔
              </button>
            </div>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
              + Create Event
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-medium">{metric.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  metric.changeType === 'increase' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {metric.changeType === 'increase' ? '↗' : '↘'} {metric.change}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {metric.name.includes('Revenue') ? `$${metric.value.toLocaleString()}` : metric.value.toLocaleString()}
                {metric.name.includes('Rate') ? '%' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Monthly Revenue</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t w-full"
                    style={{ height: `${(item.value / Math.max(...revenueData.map(d => d.value))) * 200}px` }}
                  />
                  <span className="text-xs text-gray-400 mt-2">{item.month}</span>
                  <span className="text-xs text-yellow-400">${(item.value / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Events */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Top Performing Events</h3>
            <div className="space-y-4">
              {topEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{event.name}</div>
                    <div className="text-sm text-gray-400">${event.revenue.toLocaleString()} revenue</div>
                    <div className="text-sm text-gray-400">{event.bookings} bookings</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-semibold">⭐ {event.rating.toFixed(1)}</div>
                    <div className="text-xs text-gray-400">
                      {((event.bookings / 1000) * 100).toFixed(0)}% capacity
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events Management */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Events</h3>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300">Event</th>
                  <th className="text-left py-3 px-4 text-gray-300">Date & Time</th>
                  <th className="text-left py-3 px-4 text-gray-300">Venue</th>
                  <th className="text-left py-3 px-4 text-gray-300">Bookings</th>
                  <th className="text-left py-3 px-4 text-gray-300">Revenue</th>
                  <th className="text-left py-3 px-4 text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{event.title}</div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">{event.description}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {event.venue}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {event.booked} / {event.capacity}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      ${(event.price * event.booked).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEventAction(event.id, 'view')}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEventAction(event.id, 'edit')}
                          className="text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleEventAction(event.id, 'delete')}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-semibold mb-6">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300">User</th>
                  <th className="text-left py-3 px-4 text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300">Stats</th>
                  <th className="text-left py-3 px-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{user.full_name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                        user.role === 'organizer' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      <div className="text-sm">${user.totalSpent} spent</div>
                      <div className="text-sm">{user.eventsAttended} events</div>
                      <div className="text-sm">{new Date(user.lastLogin).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {user.status !== 'approved' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'approve')}
                            className="text-green-400 hover:text-green-300 text-sm"
                          >
                            Approve
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                          >
                            Suspend
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'makeAdmin')}
                            className="text-purple-400 hover:text-purple-300 text-sm"
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Media Files Management */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-6">Media Files</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">
                    {file.type === 'image' ? '🖼️' : file.type === 'video' ? '🎥' : '📄'}
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.driveFile)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    🗑️
                  </button>
                </div>
                
                {file.type === 'image' && file.thumbnailLink ? (
                  <img 
                    src={file.thumbnailLink || file.url} 
                    alt={file.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-700 rounded mb-2 flex items-center justify-center">
                    <span className="text-4xl">
                      {file.type === 'video' ? '🎥' : '📄'}
                    </span>
                  </div>
                )}
                
                <div className="text-sm font-medium text-white truncate">{file.name}</div>
                <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                <div className="text-xs text-gray-400">
                  {file.driveFile ? 'Google Drive' : 'Local'}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(file.uploadDate).toLocaleDateString()}
                </div>
                
                {file.url && (
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block"
                  >
                    View File
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Time:</strong> {selectedEvent.event_time}
                </div>
                <div>
                  <strong>Venue:</strong> {selectedEvent.venue}
                </div>
                <div>
                  <strong>Capacity:</strong> {selectedEvent.capacity}
                </div>
                <div>
                  <strong>Price:</strong> ${selectedEvent.price}
                </div>
                <div>
                  <strong>Bookings:</strong> {selectedEvent.booked}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEventAction(selectedEvent.id, 'edit');
                  setShowEventModal(false);
                }}
                className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
              >
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
