// src/components/events/EventEditForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Save, 
  ArrowLeft,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { eventService } from '@/services/enhancedEventService';
import { Event, UpdateEventData, EVENT_CATEGORIES, SUGGESTED_TAGS, COMMON_TIMEZONES } from '@/types/events';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EventEditFormProps {
  eventId?: string;
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const EventEditForm: React.FC<EventEditFormProps> = ({
  eventId,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const finalEventId = eventId || params.eventId;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm<UpdateEventData>();

  useEffect(() => {
    if (finalEventId) {
      loadEvent();
    }
  }, [finalEventId]);

  const loadEvent = async () => {
    if (!finalEventId) return;

    try {
      setIsLoading(true);
      const eventData = await eventService.getEventById(finalEventId);
      
      if (!eventData) {
        toast({
          title: 'Event Not Found',
          description: 'The event you are trying to edit does not exist.',
          variant: 'destructive',
        });
        navigate('/admin/events');
        return;
      }

      setEvent(eventData);
      setSelectedTags(eventData.tags || []);

      // Reset form with event data
      reset({
        title: eventData.title,
        description: eventData.description,
        short_description: eventData.short_description,
        event_date: eventData.event_date,
        event_time: eventData.event_time,
        end_date: eventData.end_date,
        end_time: eventData.end_time,
        timezone: eventData.timezone,
        location: eventData.location,
        venue: eventData.venue,
        address: eventData.address,
        city: eventData.city,
        country: eventData.country,
        capacity: eventData.capacity,
        max_attendees: eventData.max_attendees,
        price: eventData.price,
        currency: eventData.currency,
        category: eventData.category,
        featured: eventData.featured,
        is_private: eventData.is_private,
        requires_approval: eventData.requires_approval,
        image_url: eventData.image_url,
        banner_url: eventData.banner_url
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load event data.',
        variant: 'destructive',
      });
      console.error('Error loading event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
    }
    setCustomTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
  };

  const onSubmit = async (data: UpdateEventData) => {
    if (!finalEventId || !event) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        tags: selectedTags
      };

      await eventService.updateEvent(finalEventId, updateData);
      
      toast({
        title: 'Event Updated!',
        description: 'Your event has been updated successfully.',
      });

      if (onSuccess) {
        onSuccess(finalEventId);
      } else {
        navigate('/admin/events');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: Event['status']) => {
    if (!finalEventId) return;

    try {
      await eventService.updateEventStatus(finalEventId, newStatus);
      setEvent(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast({
        title: 'Status Updated',
        description: `Event status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event status.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
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
          The event you are trying to edit does not exist or you don't have permission to edit it.
        </p>
        <Button onClick={() => navigate('/admin/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Edit Event
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge 
                  variant="secondary"
                  className={`${EVENT_STATUS[event.status]?.color || 'bg-gray-500'} text-white`}
                >
                  {EVENT_STATUS[event.status]?.label || event.status}
                </Badge>
                {event.featured && (
                  <Badge variant="outline">Featured</Badge>
                )}
                {event.is_private && (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button variant="ghost" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/admin/events')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          {/* Quick Status Change */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm font-medium">Quick Actions:</span>
            {event.status === 'draft' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange('published')}
                className="bg-green-600 hover:bg-green-700"
              >
                Publish
              </Button>
            )}
            {event.status === 'published' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange('draft')}
              >
                Unpublish
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusChange('cancelled')}
              className="text-red-600 hover:text-red-700"
            >
              Cancel Event
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Date & Location</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    {...register('title', {
                      required: 'Event title is required',
                      minLength: { value: 3, message: 'Title must be at least 3 characters' },
                      maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                    })}
                    placeholder="Enter a compelling event title"
                    className="text-lg"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description', {
                      required: 'Event description is required',
                      minLength: { value: 10, message: 'Description must be at least 10 characters' }
                    })}
                    placeholder="Describe your event in detail..."
                    rows={6}
                    className="resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    {...register('short_description')}
                    placeholder="Brief summary for event cards (optional)"
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Event Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Please select a category' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Event Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="event_date"
                        type="date"
                        {...register('event_date', { required: 'Event date is required' })}
                        className="pl-10"
                      />
                    </div>
                    {errors.event_date && (
                      <p className="text-sm text-red-500">{errors.event_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_time">Event Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="event_time"
                        type="time"
                        {...register('event_time', { required: 'Event time is required' })}
                        className="pl-10"
                      />
                    </div>
                    {errors.event_time && (
                      <p className="text-sm text-red-500">{errors.event_time.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      {...register('location', { required: 'Event location is required' })}
                      placeholder="City, State, Country"
                      className="pl-10"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    {...register('venue', { required: 'Venue name is required' })}
                    placeholder="Venue name"
                  />
                  {errors.venue && (
                    <p className="text-sm text-red-500">{errors.venue.message}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Event Capacity *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="capacity"
                        type="number"
                        {...register('capacity', {
                          required: 'Event capacity is required',
                          min: { value: 1, message: 'Capacity must be at least 1' },
                          max: { value: 10000, message: 'Capacity cannot exceed 10,000' },
                          valueAsNumber: true
                        })}
                        placeholder="100"
                        className="pl-10"
                      />
                    </div>
                    {errors.capacity && (
                      <p className="text-sm text-red-500">{errors.capacity.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register('price', {
                          required: 'Event price is required',
                          min: { value: 0, message: 'Price cannot be negative' },
                          valueAsNumber: true
                        })}
                        placeholder="0.00"
                        className="pl-10"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Event</Label>
                    <Controller
                      name="featured"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_private">Private Event</Label>
                    <Controller
                      name="is_private"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="requires_approval">Requires Approval</Label>
                    <Controller
                      name="requires_approval"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <Label>Event Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {SUGGESTED_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addTag(tag)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Add custom tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(customTag);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag(customTag)}
                      disabled={!customTag.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Current Event Stats */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Event Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{event.current_attendees}</div>
                      <div className="text-sm text-gray-600">Attendees</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{event.capacity}</div>
                      <div className="text-sm text-gray-600">Capacity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((event.current_attendees / event.capacity) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Filled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {new Date(event.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">Created</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/events')}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
