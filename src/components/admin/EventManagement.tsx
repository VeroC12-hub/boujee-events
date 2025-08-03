import React, { useState } from 'react';
import { useEventManagement } from '../../hooks/useEvents';
import { CreateEventRequest, UpdateEventRequest, Event } from '../../types/api';
import LoadingSpinner from '../common/LoadingSpinner';

// Create Event Modal Component
interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventRequest) => Promise<boolean>;
  loading: boolean;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: 100,
    category: 'Technology',
    price: 0,
    image: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Technology', 'Music', 'Art', 'Sports', 'Business', 
    'Education', 'Food', 'Health', 'Entertainment', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.maxAttendees < 1) newErrors.maxAttendees = 'Max attendees must be at least 1';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const success = await onSubmit(formData);
      if (success) {
        // Reset form and close modal
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          maxAttendees: 100,
          category: 'Technology',
          price: 0,
          image: ''
        });
        setErrors({});
        onClose();
        
        // Show success toast
        if ((window as any).toast) {
          (window as any).toast.success('Event created successfully!');
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttendees' || name === 'price' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">🎫 Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter event title"
              disabled={loading}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your event"
              disabled={loading}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.time ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Event location or venue"
              disabled={loading}
            />
            {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Category and Max Attendees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees *</label>
              <input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.maxAttendees ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.maxAttendees && <p className="text-red-600 text-sm mt-1">{errors.maxAttendees}</p>}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Image URL (Optional)</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/event-image.jpg"
              disabled={loading}
            />
            <p className="text-gray-500 text-xs mt-1">Leave empty for default image</p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="mr-2">🎫</span>
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main EventManagement Component
const EventManagement: React.FC = () => {
  const {
    events,
    pagination,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    changePage,
    changeLimit,
    sort,
    refetch,
    createLoading,
    updateLoading,
    deleteLoading,
    createError,
    updateError,
    deleteError
  } = useEventManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'cancelled' | 'completed'>('all');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Filter events based on search and status
  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateEvent = async (eventData: CreateEventRequest): Promise<boolean> => {
    const success = await createEvent(eventData);
    if (success) {
      refetch();
    }
    return success;
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      const success = await deleteEvent(eventId);
      if (success) {
        if ((window as any).toast) {
          (window as any).toast.success('Event deleted successfully');
        }
      }
    }
  };

  const handleStatusChange = async (event: Event, newStatus: Event['status']) => {
    const success = await updateEvent(event.id, { status: newStatus });
    if (success) {
      if ((window as any).toast) {
        (window as any).toast.success(`Event ${newStatus} successfully`);
      }
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !events) {
    return <LoadingSpinner fullScreen message="Loading events..." />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage your events</p>
          <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 04:19:23 UTC | User: VeroC12-hub</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">➕</span>
          Create New Event
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search events by title or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">{event.category}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  {event.location}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">👥</span>
                  {event.attendees}/{event.maxAttendees} attendees
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💰</span>
                  ${event.price}
                </div>
              </div>

              {/* Event Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {event.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(event, 'published')}
                      disabled={updateLoading}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  {event.status === 'published' && (
                    <button
                      onClick={() => handleStatusChange(event, 'cancelled')}
                      disabled={updateLoading}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    disabled={deleteLoading}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-400 block mb-4">📅</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first event'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Event
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => changePage(i + 1)}
                className={`px-3 py-1 text-sm rounded ${
                  pagination.page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        loading={createLoading}
      />
    </div>
  );
};

export default EventManagement;
