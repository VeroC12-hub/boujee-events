import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Grid, List, Calendar, Users, Eye, Edit, Trash2,
  Image as ImageIcon, Video, Clock, MapPin, DollarSign, Star
} from 'lucide-react';
import { useEventManagement } from '../../hooks/useEvents';
import { CreateEventRequest, UpdateEventRequest, Event } from '../../types/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import GoogleDriveManager from './media/GoogleDriveManager';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMediaManager, setShowMediaManager] = useState(false);

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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Event Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage your events with rich media</p>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
            Current time: 2025-08-03 04:42:36 UTC | User: VeroC12-hub
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowMediaManager(!showMediaManager)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Media Manager
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="btn-luxury flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Google Drive Media Manager */}
      {showMediaManager && (
        <div className="mb-8">
          <GoogleDriveManager allowMultiSelect={true} />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-luxury p-4 sm:p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{events?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
          </div>
        </div>
        <div className="card-luxury p-4 sm:p-6">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {events?.filter(e => e.status === 'published').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </div>
        </div>
        <div className="card-luxury p-4 sm:p-6">
          <div className="flex items-center">
            <Edit className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {events?.filter(e => e.status === 'draft').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </div>
          </div>
        </div>
        <div className="card-luxury p-4 sm:p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-primary mr-3" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {events?.reduce((sum, e) => sum + e.attendees, 0) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Attendees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-luxury p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events by title or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🎯 All Status</SelectItem>
                <SelectItem value="draft">📝 Draft</SelectItem>
                <SelectItem value="published">✅ Published</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                <SelectItem value="completed">🏁 Completed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={refetch}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
            </Button>
          </div>
        </div>

        {/* Filter Results Info */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {events?.length || 0} events
            {searchTerm && <span> matching "{searchTerm}"</span>}
            {statusFilter !== 'all' && <span> with status "{statusFilter}"</span>}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-destructive mr-2">⚠️</span>
            <span className="text-destructive">{error}</span>
          </div>
        </div>
      )}

      {/* Events Grid/List */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
          : 'space-y-4'
        }
      `}>
        {filteredEvents.map((event) => (
          <div key={event.id} className={`
            card-luxury transition-all duration-300 group hover:scale-[1.02]
            ${viewMode === 'list' ? 'p-4' : 'overflow-hidden'}
          `}>
            {viewMode === 'grid' ? (
              <>
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className={getStatusColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-card text-foreground">
                      {event.price === 0 ? 'FREE' : `€${event.price}`}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{event.category}</Badge>
                    <span className="text-xs text-muted-foreground">ID: {event.id}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">{event.date}</span>
                      <span className="mx-1">at</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.attendees}/{event.maxAttendees}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {event.organizer}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Attendance */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Attendance</span>
                      <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Event Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex space-x-2">
                      {event.status === 'draft' && (
                        <Button
                          onClick={() => handleStatusChange(event, 'published')}
                          disabled={updateLoading}
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          📢 Publish
                        </Button>
                      )}
                      {event.status === 'published' && (
                        <Button
                          onClick={() => handleStatusChange(event, 'cancelled')}
                          disabled={updateLoading}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          ❌ Cancel
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setEditingEvent(event)}
                        size="sm"
                        variant="ghost"
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        disabled={deleteLoading}
                        size="sm"
                        variant="ghost"
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* List View */
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.category}</Badge>
                      <Badge variant="secondary" className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {event.price === 0 ? 'FREE' : `€${event.price}`}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-1">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.attendees}/{event.maxAttendees} attendees</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs">by {event.organizer}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {event.status === 'draft' && (
                        <Button
                          onClick={() => handleStatusChange(event, 'published')}
                          disabled={updateLoading}
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setEditingEvent(event)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        disabled={deleteLoading}
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' ? '🔍' : '📅'}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No events found' : 'No events yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first event with rich media'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="btn-luxury"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 card-luxury p-4">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              variant="outline"
              size="sm"
            >
              ← Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Next →
            </Button>
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
