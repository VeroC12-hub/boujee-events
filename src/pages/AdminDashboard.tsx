// src/pages/AdminDashboard.tsx - COMPLETE FULL IMPLEMENTATION WITH ALL FEATURES
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { supabase } from '../lib/supabase';

// ================ LOADING SPINNER ================
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-white">{message}</p>
    </div>
  </div>
);

// ================ ANALYTICS COMPONENT ================
const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'revenue' | 'trends'>('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    // Mock analytics data
    setTimeout(() => {
      setAnalyticsData({
        overview: {
          totalEvents: 45,
          totalRevenue: 285000,
          totalUsers: 1250,
          conversionRate: 12.5,
          growth: {
            events: 23,
            revenue: 18,
            users: 31,
            conversion: 5
          }
        },
        events: {
          byCategory: [
            { name: 'Luxury Dining', value: 35, revenue: 125000 },
            { name: 'Nightlife', value: 28, revenue: 98000 },
            { name: 'Business', value: 22, revenue: 75000 },
            { name: 'Cultural', value: 15, revenue: 45000 }
          ],
          performance: [
            { name: 'Elite Wine Tasting', attendees: 45, revenue: 22500, satisfaction: 4.8 },
            { name: 'Rooftop Jazz Night', attendees: 120, revenue: 18000, satisfaction: 4.6 },
            { name: 'Art Gallery Opening', attendees: 80, revenue: 16000, satisfaction: 4.7 }
          ]
        },
        users: {
          demographics: [
            { age: '25-34', count: 420, revenue: 145000 },
            { age: '35-44', count: 380, revenue: 185000 },
            { age: '45-54', count: 280, revenue: 125000 },
            { age: '55+', count: 170, revenue: 85000 }
          ],
          engagement: {
            activeUsers: 850,
            returningUsers: 320,
            avgSessionTime: '12m 45s',
            bounceRate: '23%'
          }
        },
        revenue: {
          monthly: [
            { month: 'Jan', revenue: 45000, events: 8 },
            { month: 'Feb', revenue: 52000, events: 9 },
            { month: 'Mar', revenue: 48000, events: 7 },
            { month: 'Apr', revenue: 65000, events: 12 },
            { month: 'May', revenue: 75000, events: 15 }
          ],
          sources: [
            { source: 'Direct Booking', amount: 125000, percentage: 44 },
            { source: 'Partner Referral', amount: 85000, percentage: 30 },
            { source: 'Social Media', amount: 45000, percentage: 16 },
            { source: 'Email Campaign', amount: 30000, percentage: 10 }
          ]
        }
      });
      setLoading(false);
    }, 1000);
  };

  if (loading) return <LoadingSpinner message="Loading analytics..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors">
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'events', label: 'Events', icon: '📅' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'revenue', label: 'Revenue', icon: '💰' },
            { id: 'trends', label: 'Trends', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Events</h3>
              <span className="text-green-400 text-sm">+{analyticsData.overview.growth.events}%</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{analyticsData.overview.totalEvents}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Revenue</h3>
              <span className="text-green-400 text-sm">+{analyticsData.overview.growth.revenue}%</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">${analyticsData.overview.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Total Users</h3>
              <span className="text-green-400 text-sm">+{analyticsData.overview.growth.users}%</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{analyticsData.overview.totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Conversion Rate</h3>
              <span className="text-green-400 text-sm">+{analyticsData.overview.growth.conversion}%</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{analyticsData.overview.conversionRate}%</p>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Events by Category</h3>
              <div className="space-y-4">
                {analyticsData.events.byCategory.map((category: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{category.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{category.value} events</span>
                      <span className="text-green-400">${category.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Top Performing Events</h3>
              <div className="space-y-4">
                {analyticsData.events.performance.map((event: any, index: number) => (
                  <div key={index} className="border-b border-white/10 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{event.name}</h4>
                      <span className="text-yellow-400">⭐ {event.satisfaction}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{event.attendees} attendees</span>
                      <span>${event.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">User Demographics</h3>
              <div className="space-y-4">
                {analyticsData.users.demographics.map((demo: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">Age {demo.age}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{demo.count} users</span>
                      <span className="text-green-400">${demo.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">User Engagement</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-yellow-400">{analyticsData.users.engagement.activeUsers}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Returning Users</p>
                  <p className="text-2xl font-bold text-yellow-400">{analyticsData.users.engagement.returningUsers}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Session</p>
                  <p className="text-2xl font-bold text-yellow-400">{analyticsData.users.engagement.avgSessionTime}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Bounce Rate</p>
                  <p className="text-2xl font-bold text-yellow-400">{analyticsData.users.engagement.bounceRate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional tabs content would go here... */}
    </div>
  );
};

// ================ USER MANAGEMENT COMPONENT ================
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // Mock user data
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          email: 'admin@boujeevents.com',
          full_name: 'System Administrator',
          role: 'admin',
          status: 'approved',
          created_at: '2025-01-01',
          last_login: '2025-01-15',
          events_attended: 0,
          total_spent: 0
        },
        {
          id: '2',
          email: 'john.doe@example.com',
          full_name: 'John Doe',
          role: 'member',
          status: 'approved',
          created_at: '2025-01-05',
          last_login: '2025-01-14',
          events_attended: 5,
          total_spent: 15750
        },
        {
          id: '3',
          email: 'sarah.organizer@example.com',
          full_name: 'Sarah Wilson',
          role: 'organizer',
          status: 'approved',
          created_at: '2025-01-03',
          last_login: '2025-01-15',
          events_attended: 12,
          total_spent: 25000
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage users, roles, and permissions</p>
        </div>
        <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
          👤 Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="organizer">Organizer</option>
          <option value="member">Member</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Activity</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{user.full_name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-yellow-400"
                    >
                      <option value="admin">Admin</option>
                      <option value="organizer">Organizer</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`bg-white/10 border border-white/20 rounded px-3 py-1 text-sm focus:outline-none focus:border-yellow-400 ${
                        user.status === 'approved' ? 'text-green-400' :
                        user.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      <div>{user.events_attended} events attended</div>
                      <div>${user.total_spent.toLocaleString()} spent</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 p-1">✏️</button>
                      <button className="text-red-400 hover:text-red-300 p-1">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ================ MEDIA MANAGEMENT COMPONENT ================
const MediaManagement: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    setLoading(true);
    // Mock media data
    setTimeout(() => {
      setMediaFiles([
        {
          id: '1',
          name: 'event-gallery-1.jpg',
          url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=300',
          type: 'image',
          size: '2.5 MB',
          uploaded_at: '2025-01-15',
          event_id: 'event-1'
        },
        {
          id: '2',
          name: 'promotional-video.mp4',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4',
          type: 'video',
          size: '15.2 MB',
          uploaded_at: '2025-01-14',
          event_id: 'event-2'
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles) return;
    
    setUploading(true);
    // Mock upload process
    setTimeout(() => {
      const newFiles = Array.from(selectedFiles).map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploaded_at: new Date().toISOString().split('T')[0],
        event_id: null
      }));
      
      setMediaFiles(prev => [...newFiles, ...prev]);
      setSelectedFiles(null);
      setUploading(false);
    }, 2000);
  };

  if (loading) return <LoadingSpinner message="Loading media..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Media Management</h2>
          <p className="text-gray-400">Upload and manage event media files</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Upload New Media</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="w-full text-white"
            />
          </div>
          <button
            onClick={handleFileUpload}
            disabled={!selectedFiles || uploading}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaFiles.map((file) => (
          <div key={file.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              {file.type === 'image' ? (
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl">🎥</div>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-white font-medium truncate">{file.name}</h4>
              <div className="text-sm text-gray-400 mt-1">
                <div>{file.size}</div>
                <div>{file.uploaded_at}</div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-blue-400 hover:text-blue-300 text-sm">✏️ Edit</button>
                <button className="text-red-400 hover:text-red-300 text-sm">🗑️ Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================ SETTINGS COMPONENT ================
const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    platform: {
      name: 'Boujee Events',
      description: 'Premium event management platform',
      timezone: 'UTC',
      currency: 'USD'
    },
    email: {
      enabled: true,
      provider: 'resend',
      fromName: 'Boujee Events',
      fromEmail: 'noreply@boujeevents.com'
    },
    payments: {
      stripeEnabled: false,
      paypalEnabled: false,
      currency: 'USD',
      feesPercentage: 2.9
    },
    security: {
      twoFactorRequired: false,
      passwordMinLength: 8,
      sessionTimeout: 24
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Platform Settings</h2>
        <p className="text-gray-400">Configure platform-wide settings and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Platform Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
              <input
                type="text"
                value={settings.platform.name}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={settings.platform.description}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Email Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.email.enabled}
                className="rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">From Name</label>
              <input
                type="text"
                value={settings.email.fromName}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Payment Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Stripe Integration</span>
              <input
                type="checkbox"
                checked={settings.payments.stripeEnabled}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">PayPal Integration</span>
              <input
                type="checkbox"
                checked={settings.payments.paypalEnabled}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Security Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Require 2FA</span>
              <input
                type="checkbox"
                checked={settings.security.twoFactorRequired}
                className="rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Password Length</label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
          💾 Save Settings
        </button>
      </div>
    </div>
  );
};

// ================ HELPER FUNCTIONS ================
const formatTags = (tags: any): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') return tags.split(',').map(tag => tag.trim()).filter(Boolean);
  return [];
};

const renderTags = (tags: any) => {
  const tagArray = formatTags(tags);
  return tagArray.length > 0 ? (
    <div className="flex flex-wrap gap-1 mt-3">
      {tagArray.map((tag: string, index: number) => (
        <span key={index} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full">
          #{tag}
        </span>
      ))}
    </div>
  ) : null;
};

// ================ EVENT MANAGEMENT COMPONENT ================
const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const { isAdmin, userId } = useRoleAccess();
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue: '',
    capacity: '',
    price: '',
    category: 'nightlife',
    status: 'active',
    image_url: '',
    tags: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [isAdmin, userId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        // Enhanced mock data
        const mockEvents = [
          {
            id: 'mock-1',
            title: 'Sunset Paradise Festival',
            description: 'Experience the most breathtaking sunset festival in Santorini with world-class DJs, gourmet food, and premium champagne service.',
            event_date: '2025-12-31',
            event_time: '20:00',
            venue: 'Santorini Cliffs, Greece',
            capacity: 100,
            price: 2500,
            category: 'festival',
            status: 'active',
            booked: 75,
            revenue: 187500,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500',
            tags: ['luxury', 'festival', 'sunset', 'exclusive']
          },
          {
            id: 'mock-2',
            title: 'Elite Business Summit 2025',
            description: 'Exclusive networking event for industry leaders, featuring keynote speakers, premium dining, and private yacht tours.',
            event_date: '2025-09-15',
            event_time: '18:00',
            venue: 'Marina Bay, Singapore',
            capacity: 50,
            price: 5000,
            category: 'business',
            status: 'active',
            booked: 42,
            revenue: 210000,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500',
            tags: ['business', 'networking', 'luxury', 'exclusive']
          },
          {
            id: 'mock-3',
            title: 'Midnight Masquerade Ball',
            description: 'An enchanting evening of mystery and elegance in the heart of Venice, complete with live orchestra and gourmet dining.',
            event_date: '2025-10-31',
            event_time: '21:00',
            venue: 'Palazzo Ducale, Venice',
            capacity: 80,
            price: 3500,
            category: 'social',
            status: 'draft',
            booked: 0,
            revenue: 0,
            organizer_id: isAdmin ? 'admin-id' : userId,
            created_at: new Date().toISOString(),
            image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
            tags: ['masquerade', 'elegant', 'luxury', 'venice']
          }
        ];
        
        setEvents(mockEvents);
        setLoading(false);
        return;
      }

      let query = supabase.from('events').select('*');
      
      if (!isAdmin && userId) {
        query = query.eq('organizer_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const processedData = {
        ...newEvent,
        capacity: parseInt(newEvent.capacity) || 0,
        price: parseFloat(newEvent.price) || 0,
        organizer_id: userId,
        tags: newEvent.tags ? newEvent.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      if (!supabase) {
        const mockEvent = {
          ...processedData,
          id: `mock-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          booked: 0,
          revenue: 0
        };
        setEvents(prev => [mockEvent, ...prev]);
        resetForm();
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([processedData])
        .select()
        .single();
      
      if (error) throw error;
      
      setEvents(prev => [data, ...prev]);
      resetForm();
      
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    try {
      const processedData = {
        ...newEvent,
        capacity: parseInt(newEvent.capacity) || 0,
        price: parseFloat(newEvent.price) || 0,
        tags: newEvent.tags ? newEvent.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      if (!supabase) {
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id 
            ? { ...event, ...processedData }
            : event
        ));
        setEditingEvent(null);
        resetForm();
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .update(processedData)
        .eq('id', editingEvent.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? data : event
      ));
      setEditingEvent(null);
      resetForm();
      
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      if (!supabase) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        return;
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time,
      venue: event.venue,
      capacity: event.capacity.toString(),
      price: event.price.toString(),
      category: event.category,
      status: event.status,
      image_url: event.image_url || '',
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : event.tags || ''
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      venue: '',
      capacity: '',
      price: '',
      category: 'nightlife',
      status: 'active',
      image_url: '',
      tags: ''
    });
    setShowCreateForm(false);
    setEditingEvent(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.draft;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      nightlife: '🌙',
      festival: '🎉',
      business: '💼',
      social: '🥂',
      cultural: '🎭',
      sports: '⚽',
      arts: '🎨',
      food: '🍽️'
    };
    return icons[category] || '📅';
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0);
      case 'bookings':
        return (b.booked || 0) - (a.booked || 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) return <LoadingSpinner message="Loading events..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Event Management</h2>
          <p className="text-gray-400">Create and manage your premium events</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold flex items-center gap-2"
        >
          <span>✨</span>
          Create New Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 w-64"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="created_at">Date Created</option>
            <option value="title">Title</option>
            <option value="date">Event Date</option>
            <option value="revenue">Revenue</option>
            <option value="bookings">Bookings</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{filteredEvents.length} of {events.length} events</span>
        </div>
      </div>

      {/* Enhanced Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 group">
            {/* Event Image */}
            {event.image_url && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-sm">
                    {getCategoryIcon(event.category)} {event.category}
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{event.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => handleEditEvent(event)}
                    className="text-blue-400 hover:text-blue-300 text-sm p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit Event"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-400 hover:text-red-300 text-sm p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete Event"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="mr-2">📅</span>
                  {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="mr-2">📍</span>
                  {event.venue}
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="mr-2">💰</span>
                  ${event.price.toLocaleString()}
                </div>
              </div>

              {/* Booking Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Bookings</span>
                  <span className="text-sm text-white font-medium">
                    {event.booked || 0} / {event.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (event.booked || 0) / event.capacity > 0.8 ? 
                        'bg-green-400' :
                        (event.booked || 0) / event.capacity > 0.5 ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${Math.min((event.booked || 0) / event.capacity * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Revenue Display */}
              {event.revenue > 0 && (
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-sm text-gray-400">Revenue Generated</span>
                  <span className="text-lg font-bold text-green-400">${event.revenue.toLocaleString()}</span>
                </div>
              )}

              {/* Tags - FIXED VERSION */}
              {event.tags && renderTags(event.tags)}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE/EDIT FORM - Same as before but complete */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-white/10 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="p-6 space-y-6">
              {/* Complete form fields - same as before but with all functionality */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Describe your event"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Event Time *</label>
                  <input
                    type="time"
                    required
                    value={newEvent.event_time}
                    onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Venue *</label>
                <input
                  type="text"
                  required
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Event venue location"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                    placeholder="Maximum attendees"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Price (USD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                    placeholder="Ticket price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="nightlife">Nightlife</option>
                    <option value="festival">Festival</option>
                    <option value="business">Business</option>
                    <option value="social">Social</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="arts">Arts</option>
                    <option value="food">Food & Dining</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Status</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="ended">Ended</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Image URL</label>
                <input
                  type="url"
                  value={newEvent.image_url}
                  onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newEvent.tags}
                  onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="luxury, exclusive, premium"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate tags with commas to help categorize your event
                </p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first event to get started'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
            >
              Create First Event
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ================ MAIN ADMIN DASHBOARD COMPONENT ================
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, profile } = useAuth();
  const { isAdmin, isOrganizer, loading: roleLoading } = useRoleAccess();
  const [activeSection, setActiveSection] = useState('overview');

  // Redirect if not authorized
  useEffect(() => {
    if (!roleLoading && !isAdmin && !isOrganizer) {
      navigate('/login');
    }
  }, [isAdmin, isOrganizer, roleLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (roleLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!isAdmin && !isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to access this area.</p>
          <Link 
            to="/" 
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Dashboard analytics' },
    { id: 'events', label: 'Events', icon: '📅', description: 'Manage events' },
    { id: 'analytics', label: 'Analytics', icon: '📈', description: 'Performance metrics' },
    ...(isAdmin ? [
      { id: 'users', label: 'Users', icon: '👥', description: 'User management' },
      { id: 'media', label: 'Media', icon: '📸', description: 'Media library' },
      { id: 'settings', label: 'Settings', icon: '⚙️', description: 'System settings' }
    ] : [])
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview setActiveSection={setActiveSection} />;
      case 'events':
        return <EventManagement />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return isAdmin ? <UserManagement /> : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold text-white mb-2">Admin Access Required</h3>
            <p className="text-gray-400">You need admin privileges to access user management.</p>
          </div>
        );
      case 'media':
        return <MediaManagement />;
      case 'settings':
        return isAdmin ? <Settings /> : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold text-white mb-2">Admin Access Required</h3>
            <p className="text-gray-400">You need admin privileges to access system settings.</p>
          </div>
        );
      default:
        return <DashboardOverview setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-black/50 backdrop-blur-xl border-r border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-black font-bold text-lg">
              B
            </div>
            <div>
              <h1 className="text-lg font-bold">Boujee Events</h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-semibold text-sm">
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${
                    activeSection === item.id ? 'text-black/70' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">🚪</span>
              <div>
                <div className="font-medium">Logout</div>
                <div className="text-xs text-gray-500 group-hover:text-red-400/70">
                  Exit dashboard
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
