// src/components/events/EventDetailView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Share,
  Bookmark,
  Edit,
  ArrowLeft,
  Globe,
  Phone,
  Mail,
  Star,
  AlertCircle,
  CheckCircle,
  MapIcon,
  ImageIcon,
  Tag,
  User,
  Calendar as CalendarIcon,
  ExternalLink,
  Copy
} from 'lucide-react';
import { eventService } from '@/services/enhancedEventService';
import { Event, EVENT_STATUS } from '@/types/events';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EventDetailViewProps {
  eventId?: string;
  className?: string;
  showEditButton?: boolean;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  eventId,
  className = '',
  showEditButton = false
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    bookings: 0,
    revenue: 0,
    capacity_percentage: 0
  });
  const [isBookmarked, setIsBookmarked] = useState(false);

  const finalEventId = eventId || params.eventId;

  useEffect(() => {
    if (finalEventId) {
      loadEvent();
      loadEventStats();
    }
  }, [finalEventId]);

  const loadEvent = async () => {
    if (!finalEventId) return;

    try {
      setLoading(true);
      const eventData = await eventService.getEventById(finalEventId);
      
      if (!eventData) {
        toast({
          title: 'Event Not Found',
          description: 'The event you are looking for does not exist.',
          variant: 'destructive',
        });
        navigate('/events');
        return;
      }

      setEvent(eventData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load event details.',
        variant: 'destructive',
      });
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventStats = async () => {
    if (!finalEventId) return;

    try {
      const eventStats = await eventService.getEventStats(finalEventId);
      setStats(eventStats);
    } catch (error) {
      console.error('Error loading event stats:', error);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${finalEventId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.short_description || event?.description,
          url: url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Event link has been copied to your clipboard.',
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Bookmark Removed' : 'Bookmark Added',
      description: isBookmarked 
        ? 'Event removed from your bookmarks.' 
        : 'Event added to your bookmarks.',
    });
  };

  const formatDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    let formatted = date.toLocaleDateString('en-US', options);
    
    if (timeString) {
      formatted += ` at ${timeString}`;
    }
    
    return formatted;
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    if (price === 0) return 'FREE';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const canEdit = () => {
    if (!user || !event) return false;
    return user.id === event.organizer_id || user.role === 'admin';
  };

  const isEventPast = () => {
    if (!event) return false;
    const eventDate = new Date(`${event.event_date}T${event.event_time}`);
    return eventDate < new Date();
  };

  const isEventFull = () => {
    if (!event) return false;
    return event.current_attendees >= event.capacity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Event Not Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The event you are looking for does not exist or has been removed.
        </p>
        <Button onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={handleBookmark}>
            <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          {(showEditButton || canEdit()) && (
            <Button 
              onClick={() => navigate(`/events/${event.id}/edit`)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          )}
        </div>
      </div>

      {/* Main Event Card */}
      <Card className="overflow-hidden">
        {/* Banner Image */}
        {event.banner_url ? (
          <div 
            className="h-64 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${event.banner_url})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge 
                className={`${EVENT_STATUS[event.status].color} text-white`}
              >
                {getStatusIcon(event.status)}
                <span className="ml-2">{EVENT_STATUS[event.status].label}</span>
              </Badge>
              {event.featured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {event.is_private && (
                <Badge variant="secondary" className="bg-purple-500 text-white">
                  Private
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge 
                className={`${EVENT_STATUS[event.status].color} text-white`}
              >
                {getStatusIcon(event.status)}
                <span className="ml-2">{EVENT_STATUS[event.status].label}</span>
              </Badge>
              {event.featured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardContent className="p-6">
          {/* Event Title and Category */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {event.title}
              </h1>
              <Badge variant="outline" className="text-sm">
                <Tag className="h-3 w-3 mr-1" />
                {event.category}
              </Badge>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</p>
                  <p className="text-sm font-bold">{formatDate(event.event_date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</p>
                  <p className="text-sm font-bold">
                    {event.event_time}
                    {event.end_time && ` - ${event.end_time}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                  <p className="text-sm font-bold">{event.venue}</p>
                  <p className="text-xs text-gray-500">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Price</p>
                  <p className="text-sm font-bold">{formatPrice(event.price, event.currency)}</p>
                </div>
              </div>
            </div>

            {/* Attendance Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Event Capacity
                </span>
                <span className="text-sm font-bold">
                  {event.current_attendees} / {event.capacity}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(event.current_attendees / event.capacity) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>{Math.round((event.current_attendees / event.capacity) * 100)}% filled</span>
                <span>{event.capacity - event.current_attendees} spots remaining</span>
              </div>
            </div>

            {/* Action Buttons */}
            {event.status === 'published' && !isEventPast() && (
              <div className="flex gap-4">
                {isEventFull() ? (
                  <Button size="lg" disabled className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Event Full
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={() => navigate(`/events/${event.id}/book`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                )}
                
                <Button size="lg" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            )}

            {isEventPast() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This event has already ended.
                </AlertDescription>
              </Alert>
            )}

            {event.status === 'cancelled' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This event has been cancelled.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              {canEdit() && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            </TabsList>

            <TabsContent value="description" className="space-y-4 mt-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Event Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium">
                        {event.end_date && event.end_time 
                          ? `${event.event_time} - ${event.end_time}`
                          : 'Single day event'
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                      <span className="font-medium">{event.timezone}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Max Attendees:</span>
                      <span className="font-medium">{event.max_attendees}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Requires Approval:</span>
                      <span className="font-medium">
                        {event.requires_approval ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Organizer</h4>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium">Event Organizer</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Contact for event inquiries
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Venue Details</h4>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">{event.venue}</h5>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-gray-500">{event.address}</p>
                  )}
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Map integration coming soon</p>
                    <Button variant="outline" className="mt-2">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Maps
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {canEdit() && (
              <TabsContent value="analytics" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Views</p>
                          <p className="text-2xl font-bold">{stats.views}</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bookings</p>
                          <p className="text-2xl font-bold">{stats.bookings}</p>
                        </div>
                        <Users className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                          <p className="text-2xl font-bold">${stats.revenue}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacity</p>
                          <p className="text-2xl font-bold">{stats.capacity_percentage}%</p>
                        </div>
                        <Users className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
