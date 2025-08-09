import React, { useState, useEffect } from 'react';
import { brandColors, brandConfig } from '../../utils/brandSystem';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  capacity: number;
  price: number;
  category: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  organizer_id: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  tags: string[];
  image_url?: string;
  max_attendees: number;
  current_attendees: number;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  capacity: number;
  price: number;
  category: string;
  featured: boolean;
  tags: string[];
  image_url: string;
}

const EventManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'cancelled' | 'completed'>('all');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    venue: '',
    capacity: 100,
    price: 0,
    category: 'Festival',
    featured: false,
    tags: [],
    image_url: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Mock events data
      const mockEvents: Event[] = [
        {
          id: 'event_1',
          title: 'Summer Music Festival 2025',
          description: 'The ultimate summer music experience featuring top artists from around the world.',
          date: '2025-08-15',
          time: '18:00',
          location: 'Central Park, New York',
          venue: 'Central Park Amphitheater',
          capacity: 10000,
          price: 150,
          category: 'Festival',
          status: 'published',
          organizer_id: 'org_1',
          created_at: '2025-01-01T10:00:00Z',
          updated_at: '2025-01-15T14:30:00Z',
          featured: true,
          tags: ['music', 'festival', 'outdoor'],
          image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
          max_attendees: 10000,
          current_attendees: 7500
        },
        {
          id: 'event_2',
          title: 'Exclusive Wine Tasting Evening',
          description: 'An intimate evening of premium wine tasting with renowned sommeliers.',
          date: '2025-09-20',
          time: '19:30',
          location: 'The Plaza Hotel, New York',
          venue: 'The Plaza Ballroom',
          capacity: 50,
          price: 250,
          category: 'Luxury Experience',
          status: 'published',
          organizer_id: 'org_2',
          created_at: '2025-02-01T09:00:00Z',
          updated_at: '2025-02-10T16:45:00Z',
          featured: false,
          tags: ['wine', 'luxury', 'tasting'],
          image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
          max_attendees: 50,
          current_attendees: 35
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const newEvent: Event = {
        id: `event_${Date.now()}`,
        ...formData,
        max_attendees: formData.capacity,
        current_attendees: 0,
        status: 'draft',
        organizer_id: 'current_user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setEvents(prev => [newEvent, ...prev]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    try {
      const updatedEvent: Event = {
        ...editingEvent,
        ...formData,
        max_attendees: formData.capacity,
        updated_at: new Date().toISOString()
      };

      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ));
      
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      venue: event.venue,
      capacity: event.capacity,
      price: event.price,
      category: event.category,
      featured: event.featured,
      tags: event.tags,
      image_url: event.image_url || ''
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      venue: '',
      capacity: 100,
      price: 0,
      category: 'Festival',
      featured: false,
      tags: [],
      image_url: ''
    });
  };

  const handleStatusChange = async (eventId: string, newStatus: Event['status']) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId 
        ? { ...event, status: newStatus, updated_at: new Date().toISOString() }
        : event
    ));
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const categories = ['Festival', 'Luxury Experience', 'Party', 'Corporate', 'VIP Experience'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: brandColors.primary }}>
            Event Management
          </h2>
          <p className="text-gray-400">Create and manage your events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 rounded-lg font-semibold transition-colors"
          style={{ 
            backgroundColor: brandColors.primary, 
            color: brandColors.dark 
          }}
        >
          + Create Event
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': brandColors.primary } as React.CSSProperties}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': brandColors.primary } as React.CSSProperties}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Events List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Events ({filteredEvents.length})</h3>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h4 className="text-xl font-semibold mb-2">No events found</h4>
              <p className="text-gray-400">Create your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                          event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                          event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {event.status}
                        </span>
                        {event.featured && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>📅 {new Date(event.date).toLocaleDateString()} at {event.time}</p>
                        <p>📍 {event.venue}, {event.location}</p>
                        <p>🎫 {event.current_attendees} / {event.max_attendees} attendees</p>
                        <p>💰 ${event.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event.id, e.target.value as Event['status'])}
                        className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingEvent) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="City, State/Country"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Specific venue name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm text-gray-300">
                  Featured Event
                </label>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                  className="px-6 py-2 rounded-lg font-semibold transition-colors"
                  style={{ 
                    backgroundColor: brandColors.primary, 
                    color: brandColors.dark 
                  }}
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
