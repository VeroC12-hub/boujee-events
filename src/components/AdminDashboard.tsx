import React, { useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Plus, Search, Filter } from 'lucide-react';
import EventManagement from './admin/EventManagement';
import UserManagement from './admin/UserManagement';
import Analytics from './admin/Analytics';
import Settings from './admin/Settings';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  activeEvents: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - replace with real API calls
  const stats: AdminStats = {
    totalUsers: 1247,
    totalEvents: 89,
    totalRevenue: 125640,
    activeEvents: 23
  };

  const recentActivities = [
    { id: 1, type: 'user', message: 'New user registered: john.doe@email.com', time: '2 hours ago' },
    { id: 2, type: 'event', message: 'Event "Summer Music Festival" was created', time: '4 hours ago' },
    { id: 3, type: 'booking', message: 'New booking for "Tech Conference 2024"', time: '6 hours ago' },
    { id: 4, type: 'payment', message: 'Payment received: $299.99', time: '8 hours ago' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-green-500 text-sm font-medium">+12%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-green-500 text-sm font-medium">+8%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-green-500 text-sm font-medium">+23%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-green-500 text-sm font-medium">+5%</span>
                  <span className="text-gray-500 text-sm ml-1">from last week</span>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'user' ? 'bg-blue-100' :
                        activity.type === 'event' ? 'bg-purple-100' :
                        activity.type === 'booking' ? 'bg-orange-100' :
                        'bg-green-100'
                      }`}> 
                        {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'event' && <Calendar className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'booking' && <TrendingUp className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your events and users</p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Event</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'events', label: 'Events' },
              { id: 'users', label: 'Users' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;