import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Save, X, Calendar, MapPin, Clock, Users, 
  DollarSign, Image, Tag, Star, Upload, Copy, ExternalLink,
  BarChart3, TrendingUp, Filter, Search, Download, Settings,
  Shield, Crown, Sparkles, AlertCircle, CheckCircle, Camera
} from 'lucide-react';

// Custom styles for the admin dashboard
const adminStyles = `
  .admin-bg {
    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
    min-height: 100vh;
  }
  
  .admin-card {
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
  }
  
  .admin-btn-primary {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #000;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .admin-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
  }
  
  .admin-input {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px 16px;
    color: white;
    width: 100%;
    transition: border-color 0.3s ease;
  }
  
  .admin-input:focus {
    outline: none;
    border-color: #FFD700;
    box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
  }
  
  .status-live { color: #10B981; background: rgba(16, 185, 129, 0.1); }
  .status-draft { color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
  .status-completed { color: #3B82F6; background: rgba(59, 130, 246, 0.1); }
  .status-cancelled { color: #EF4444; background: rgba(239, 68, 68, 0.1); }
  .status-sold-out { color: #8B5CF6; background: rgba(139, 92, 246, 0.1); }
`;

// Login Component
const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'boujee2025') {
        onLogin(true);
      } else {
        setError('Invalid credentials. Please try again.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <style>{adminStyles}</style>
      <div className="admin-bg flex items-center justify-center p-4">
        <div className="admin-card max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold mb-2" style={{color: '#FFD700'}}>be</div>
            <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
            <p className="text-gray-400 text-sm">Secure access for event organizers</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="admin-input"
                placeholder="Enter username"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="admin-input"
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}
            <button 
              type="submit" 
              className="admin-btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <p className="text-xs text-yellow-500">Username: admin</p>
            <p className="text-xs text-yellow-500">Password: boujee2025</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Event Form Component
const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    location: '',
    category: 'VIP Experience',
    image: '',
    status: 'draft',
    capacity: 100,
    tiers: [
      { name: 'General', price: 100, capacity: 50, perks: ['Basic Access'] },
      { name: 'VIP', price: 250, capacity: 30, perks: ['VIP Lounge', 'Premium Bar'] },
      { name: 'Platinum', price: 500, capacity: 20, perks: ['All VIP Benefits', 'Meet & Greet'] }
    ],
    ticketsSold: 0,
    revenue: 0,
    ...event
  });

  const [saving, setSaving] = useState(false);

  const categories = ['VIP Experience', 'Festival', 'Corporate', 'Yacht Party', 'Private Event'];
  const statuses = ['draft', 'live', 'sold-out', 'completed', 'cancelled'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API save
    setTimeout(() => {
      onSave({
        ...formData,
        id: event?.id || Date.now().toString(),
        createdAt: event?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSaving(false);
    }, 1000);
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...formData.tiers];
    if (field === 'perks') {
      newTiers[index] = { ...newTiers[index], [field]: value.split(',').map(p => p.trim()) };
    } else {
      newTiers[index] = { ...newTiers[index], [field]: value };
    }
    setFormData({ ...formData, tiers: newTiers });
  };

  return (
    <>
      <style>{adminStyles}</style>
      <div className="admin-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button 
              onClick={onCancel} 
              className="p-2 text-gray-400 hover:text-white transition-colors"
              disabled={saving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="admin-card">
              <h3 className="text-lg font-semibold text-white mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="admin-input"
                    placeholder="e.g., Sunset Yacht Gala"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="admin-input"
                    placeholder="Short description or tagline"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="admin-input"
                    required
                    disabled={saving}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="admin-input"
                    disabled={saving}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="admin-input"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="admin-input"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Venue *</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="admin-input"
                    placeholder="e.g., Royal Marina"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="admin-input"
                    placeholder="e.g., Monaco"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="admin-input h-32 resize-none"
                    placeholder="Detailed event description..."
                    required
                    disabled={saving}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Event Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="admin-input"
                    placeholder="https://example.com/image.jpg"
                    disabled={saving}
                  />
                  {formData.image && (
                    <div className="mt-3">
                      <img 
                        src={formData.image} 
                        alt="Event preview"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Tiers */}
            <div className="admin-card">
              <h3 className="text-lg font-semibold text-white mb-6">Ticket Tiers</h3>
              <div className="space-y-6">
                {formData.tiers.map((tier, index) => (
                  <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Tier Name</label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => updateTier(index, 'name', e.target.value)}
                          className="admin-input text-sm"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Price ($)</label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => updateTier(index, 'price', parseInt(e.target.value) || 0)}
                          className="admin-input text-sm"
                          min="0"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Capacity</label>
                        <input
                          type="number"
                          value={tier.capacity}
                          onChange={(e) => updateTier(index, 'capacity', parseInt(e.target.value) || 0)}
                          className="admin-input text-sm"
                          min="0"
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Perks (comma separated)</label>
                        <input
                          type="text"
                          value={tier.perks.join(', ')}
                          onChange={(e) => updateTier(index, 'perks', e.target.value)}
                          className="admin-input text-sm"
                          placeholder="VIP Access, Premium Bar"
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-500 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="admin-btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                    {event ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {event ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Main Admin Dashboard
const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Sunset Yacht Gala',
      subtitle: 'Exclusive evening on the Mediterranean',
      category: 'VIP Experience',
      date: '2025-12-15',
      time: '18:00',
      venue: 'Royal Marina',
      location: 'Monaco',
      status: 'live',
      image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800',
      ticketsSold: 145,
      revenue: 125000,
      capacity: 200,
      description: 'An exclusive evening of luxury and elegance aboard our premium yacht.',
      tiers: [
        { name: 'General', price: 150, capacity: 100, perks: ['Deck Access', 'Welcome Drink'] },
        { name: 'VIP', price: 350, capacity: 70, perks: ['VIP Lounge', 'Premium Bar', 'Canapés'] },
        { name: 'Platinum', price: 750, capacity: 30, perks: ['Private Suite', 'Personal Butler', 'Gourmet Dining'] }
      ]
    },
    {
      id: '2',
      title: 'Golden Hour Festival',
      subtitle: '3-day luxury music experience',
      category: 'Festival',
      date: '2025-03-20',
      time: '14:00',
      venue: 'Paradise Beach',
      location: 'Ibiza',
      status: 'live',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      ticketsSold: 892,
      revenue: 445000,
      capacity: 1000,
      description: 'Three days of world-class music, art, and culinary experiences.',
      tiers: [
        { name: 'Weekend Pass', price: 299, capacity: 600, perks: ['All Stages Access', 'Food Vouchers'] },
        { name: 'VIP Experience', price: 599, capacity: 300, perks: ['VIP Area', 'Premium Bars', 'Artist Meet & Greets'] },
        { name: 'Platinum Festival', price: 1299, capacity: 100, perks: ['Backstage Access', 'Luxury Camping', 'Private Transport'] }
      ]
    }
  ]);

  // Calculate stats
  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'live').length,
    totalRevenue: events.reduce((sum, e) => sum + (e.revenue || 0), 0),
    totalTicketsSold: events.reduce((sum, e) => sum + (e.ticketsSold || 0), 0)
  };

  const handleSaveEvent = (eventData) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === eventData.id ? eventData : e));
    } else {
      setEvents([...events, eventData]);
    }
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const getStatusStyle = (status) => {
    const baseClasses = 'text-xs px-2 py-1 rounded-full font-medium';
    switch (status) {
      case 'live': return `${baseClasses} status-live`;
      case 'draft': return `${baseClasses} status-draft`;
      case 'completed': return `${baseClasses} status-completed`;
      case 'cancelled': return `${baseClasses} status-cancelled`;
      case 'sold-out': return `${baseClasses} status-sold-out`;
      default: return `${baseClasses} text-gray-500 bg-gray-500/10`;
    }
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={setIsAuthenticated} />;
  }

  // Show event form if needed
  if (showEventForm) {
    return (
      <EventForm
        event={editingEvent}
        onSave={handleSaveEvent}
        onCancel={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
      />
    );
  }

  return (
    <>
      <style>{adminStyles}</style>
      <div className="admin-bg">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-black/50 border-r border-gray-800 p-6">
            <div className="mb-8">
              <div className="text-2xl font-bold mb-1" style={{color: '#FFD700'}}>be</div>
              <h2 className="text-lg font-semibold text-white">Admin Dashboard</h2>
              <p className="text-sm text-gray-400">Event Management</p>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'events', name: 'Events', icon: <Calendar className="w-4 h-4" /> },
                { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
                { id: 'settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeView === item.id 
                      ? 'bg-yellow-500 text-black font-semibold' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <button
                onClick={() => setIsAuthenticated(false)}
                className="w-full text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-auto">
            {activeView === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="admin-btn-primary"
                  >
                    <Plus className="w-5 h-5" />
                    Create Event
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="admin-card text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-4" style={{color: '#FFD700'}} />
                    <h3 className="text-2xl font-bold text-white">{stats.totalEvents}</h3>
                    <p className="text-sm text-gray-400">Total Events</p>
                  </div>
                  <div className="admin-card text-center">
                    <Sparkles className="w-8 h-8 mx-auto mb-4" style={{color: '#FFD700'}} />
                    <h3 className="text-2xl font-bold text-white">{stats.activeEvents}</h3>
                    <p className="text-sm text-gray-400">Active Events</p>
                  </div>
                  <div className="admin-card text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-4" style={{color: '#FFD700'}} />
                    <h3 className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</h3>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                  </div>
                  <div className="admin-card text-center">
                    <Users className="w-8 h-8 mx-auto mb-4" style={{color: '#FFD700'}} />
                    <h3 className="text-2xl font-bold text-white">{stats.totalTicketsSold.toLocaleString()}</h3>
                    <p className="text-sm text-gray-400">Tickets Sold</p>
                  </div>
                </div>

                {/* Recent Events */}
                <div className="admin-card">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Events</h2>
                    <button
                      onClick={() => setActiveView('events')}
                      className="text-yellow-500 hover:text-yellow-400 transition-colors text-sm"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {events.slice(0, 3).map(event => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-white">{event.title}</h3>
                            <p className="text-sm text-gray-400">{event.date} • {event.location}</p>
                            <span className={getStatusStyle(event.status)}>
                              {event.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">{event.ticketsSold}/{event.capacity}</p>
                          <p className="text-sm text-gray-400">Tickets</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'events' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-white">Event Management</h1>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="admin-btn-primary"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Event
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map(event => (
                    <div key={event.id} className="admin-card">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                            <p className="text-sm text-gray-400">{event.subtitle}</p>
                          </div>
                          <span className={getStatusStyle(event.status)}>
                            {event.status.replace('-', ' ')}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {event.date} at {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.venue}, {event.location}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-700">
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{color: '#FFD700'}}>{event.ticketsSold || 0}</p>
                            <p className="text-xs text-gray-400">Tickets Sold</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{color: '#FFD700'}}>${(event.revenue || 0).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Revenue</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setShowEventForm(true);
                            }}
                            className="flex-1 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-sm flex items-center justify-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button className="p-2 border border-gray-700 rounded-lg hover:border-yellow-500 transition-colors">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 border border-red-700 text-red-500 rounded-lg hover:border-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
                <div className="admin-card text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-400">Advanced analytics and reporting features coming soon.</p>
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                
                <div className="admin-card">
                  <h3 className="text-lg font-semibold text-white mb-6">Admin Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Website Title</label>
                      <input
                        type="text"
                        defaultValue="Boujee Events"
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Company Email</label>
                      <input
                        type="email"
                        defaultValue="admin@boujeevents.com"
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Default Event Capacity</label>
                      <input
                        type="number"
                        defaultValue="100"
                        className="admin-input"
                      />
                    </div>
                    <button className="admin-btn-primary">
                      <Save className="w-4 h-4" />
                      Save Settings
                    </button>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 className="text-lg font-semibold text-white mb-6">Security</h3>
                  <div className="space-y-4">
                    <button className="w-full text-left py-3 border-b border-gray-800 hover:text-yellow-500 transition-colors text-white">
                      Change Admin Password
                    </button>
                    <button className="w-full text-left py-3 border-b border-gray-800 hover:text-yellow-500 transition-colors text-white">
                      Two-Factor Authentication
                    </button>
                    <button className="w-full text-left py-3 hover:text-yellow-500 transition-colors text-white">
                      Download Backup Data
                    </button>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 className="text-lg font-semibold text-white mb-6">API Access</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value="bje_live_sk_1234567890abcdef"
                          readOnly
                          className="flex-1 admin-input"
                        />
                        <button className="px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Use this API key to integrate with external systems</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
