import React, { useState } from 'react';
import { useEventManagement } from '../../hooks/useEvents';
import { CreateEventRequest, UpdateEventRequest, Event } from '../../types/api';
import { MediaFile } from '../common/MediaUploader';
import LoadingSpinner from '../common/LoadingSpinner';
import EnhancedEventModal from './EnhancedEventModal';

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
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'cancelled' | 'completed'>('all');

  // Filter events based on search and status
  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateEvent = async (eventData: CreateEventRequest & { media: MediaFile[] }): Promise<boolean> => {
    // In a real app, you'd upload the media files first and get URLs
    // For now, we'll simulate this by using the first image as the main image
    const mainImage = eventData.media.find(m => m.type === 'image');
    const eventWithImage = {
      ...eventData,
      image: mainImage?.preview || `https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=${encodeURIComponent(eventData.title)}`
    };

    const success = await createEvent(eventWithImage);
    if (success) {
      refetch();
      // Show success message with media count
      if ((window as any).toast) {
        (window as any).toast.success(
          `Event created successfully with ${eventData.media.length} media files!`
        );
      }
    }
    return success;
  };

  const handleUpdateEvent = async (eventData: CreateEventRequest & { media: MediaFile[] }): Promise<boolean> => {
    if (!editingEvent) return false;

    const mainImage = eventData.media.find(m => m.type === 'image');
    const eventWithImage = {
      ...eventData,
      image: mainImage?.preview || editingEvent.image
    };

    const success = await updateEvent(editingEvent.id, eventWithImage);
    if (success) {
      refetch();
      setEditingEvent(null);
      if ((window as any).toast) {
        (window as any).toast.success(
          `Event updated successfully with ${eventData.media.length} media files!`
        );
      }
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
          <p className="text-gray-600 mt-2">Create, edit, and manage your events with rich media</p>
          <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 04:42:36 UTC | User: VeroC12-hub</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg"
        >
          <span className="mr-2">🎫</span>
          Create New Event
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-3">📅</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">{events?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-3">✅</span>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {events?.filter(e => e.status === 'published').length || 0}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-3">📝</span>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {events?.filter(e => e.status === 'draft').length || 0}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <span className="text-3xl mr-3">👥</span>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {events?.reduce((sum, e) => sum + e.attendees, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total Attendees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
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
              <option value="all">🎯 All Status</option>
              <option value="draft">📝 Draft</option>
              <option value="published">✅ Published</option>
              <option value="cancelled">❌ Cancelled</option>
              <option value="completed">🏁 Completed</option>
            </select>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span className="ml-2 hidden md:block">Refresh</span>
          </button>
        </div>

        {/* Filter Results Info */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredEvents.length} of {events?.length || 0} events
            {searchTerm && <span> matching "{searchTerm}"</span>}
            {statusFilter !== 'all' && <span> with status "{statusFilter}"</span>}
          </div>
        )}
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
          <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 group">
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>

              {/* Price Badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                  {event.price === 0 ? 'FREE' : `$${event.price}`}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 font-medium">{event.category}</span>
                <span className="text-xs text-gray-500">ID: {event.id}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span className="font-medium">{event.date}</span>
                  <span className="mx-1">at</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">👥</span>
                    <span>{event.attendees}/{event.maxAttendees}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    by {event.organizer}
                  </div>
                </div>
              </div>

              {/* Progress Bar for Attendance */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Attendance</span>
                  <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  />
                </div>
              </div>

              {/* Event Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {event.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(event, 'published')}
                      disabled={updateLoading}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      📢 Publish
                    </button>
                  )}
                  {event.status === 'published' && (
                    <button
                      onClick={() => handleStatusChange(event, 'cancelled')}
                      disabled={updateLoading}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                    title="Edit Event"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    disabled={deleteLoading}
                    className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    title="Delete Event"
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
          <span className="text-6xl text-gray-400 block mb-4">
            {searchTerm || statusFilter !== 'all' ? '🔍' : '📅'}
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No events found' : 'No events yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first event with rich media'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <span className="mr-2">🎫</span>
              Create Your First Event
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              ← Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Create/Edit Event Modal */}
      <EnhancedEventModal
        isOpen={showCreateModal || editingEvent !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingEvent(null);
        }}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
        loading={createLoading || updateLoading}
        editingEvent={editingEvent}
      />
    </div>
  );
};

export default EventManagement;
