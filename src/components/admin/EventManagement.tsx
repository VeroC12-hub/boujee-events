import React, { useState } from 'react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  category: string;
  price: number;
  image: string;
}

const EventManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Tech Conference 2025',
      date: '2025-08-15',
      time: '09:00',
      location: 'San Francisco Convention Center',
      organizer: 'VeroC12-hub',
      attendees: 234,
      maxAttendees: 500,
      status: 'published',
      category: 'Technology',
      price: 199,
      image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Tech+Conference'
    },
    {
      id: '2',
      title: 'Summer Music Festival',
      date: '2025-08-20',
      time: '18:00',
      location: 'Golden Gate Park',
      organizer: 'Music Events LLC',
      attendees: 189,
      maxAttendees: 1000,
      status: 'published',
      category: 'Music',
      price: 89,
      image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Music+Festival'
    },
    {
      id: '3',
      title: 'Art & Design Exhibition',
      date: '2025-08-25',
      time: '10:00',
      location: 'Modern Art Museum',
      organizer: 'Art Collective',
      attendees: 145,
      maxAttendees: 300,
      status: 'draft',
      category: 'Art',
      price: 25,
      image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Art+Exhibition'
    },
    {
      id: '4',
      title: 'Startup Pitch Night',
      date: '2025-08-30',
      time: '19:00',
      location: 'Innovation Hub',
      organizer: 'VeroC12-hub',
      attendees: 89,
      maxAttendees: 200,
      status: 'published',
      category: 'Business',
      price: 0,
      image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Startup+Pitch'
    }
  ]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleStatusChange = (eventId: string, newStatus: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, status: newStatus as Event['status'] } : event
    ));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600 mt-2">Create, edit, and manage all events on your platform</p>
            <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 02:49:54 UTC | User: VeroC12-hub</p>
          </div>
          
          <button
            onClick={() => alert('Create Event Modal would open here')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">➕</span>
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search events by title or organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">🔽</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Event Image */}
            <div className="h-48 bg-gray-200 relative">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>
            
            {/* Event Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <span className="text-sm">👁️</span>
                  </button>
                  <button
                    onClick={() => alert(`Edit ${event.title}`)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Edit Event"
                  >
                    <span className="text-sm">✏️</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Event"
                  >
                    <span className="text-sm">🗑️</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">👥</span>
                  <span>{event.attendees}/{event.maxAttendees} attendees</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{event.category}</span>
                </div>
                
                <select
                  value={event.status}
                  onChange={(e) => handleStatusChange(event.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Registration Progress</span>
                  <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-400 block mb-4">📅</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search or create a new event.</p>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                    <p className="text-gray-900">{selectedEvent.date} at {selectedEvent.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organizer</label>
                    <p className="text-gray-900">{selectedEvent.organizer}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <p className="text-gray-900">{selectedEvent.price === 0 ? 'Free' : `$${selectedEvent.price}`}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attendees</label>
                    <p className="text-gray-900">{selectedEvent.attendees}/{selectedEvent.maxAttendees}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button 
                  onClick={() => alert(`Edit ${selectedEvent.title}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
