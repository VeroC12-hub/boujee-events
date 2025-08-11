// src/components/events/EventCreationForm.tsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Image as ImageIcon,
  Save, 
  Send,
  X,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { eventService } from '@/services/enhancedEventService';
import { CreateEventData, EVENT_CATEGORIES, SUGGESTED_TAGS, COMMON_TIMEZONES } from '@/types/events';
import { useToast } from '@/hooks/use-toast';

interface EventCreationFormProps {
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export const EventCreationForm: React.FC<EventCreationFormProps> = ({
  onSuccess,
  onCancel,
  className = ''
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm<CreateEventData>({
    defaultValues: {
      currency: 'USD',
      country: 'US',
      timezone: 'UTC',
      capacity: 100,
      max_attendees: 100,
      price: 0,
      featured: false,
      is_private: false,
      requires_approval: false,
      tags: []
    }
  });

  const watchedValues = watch();
  const steps = ['Basic Info', 'Details', 'Settings', 'Review'];
  const completionPercentage = ((currentStep + 1) / steps.length) * 100;

  // Form validation for each step
  const stepValidations = {
    0: ['title', 'description', 'category'],
    1: ['event_date', 'event_time', 'location', 'venue'],
    2: ['capacity', 'max_attendees', 'price'],
    3: []
  };

  const validateStep = async (step: number) => {
    const fieldsToValidate = stepValidations[step as keyof typeof stepValidations];
    return await trigger(fieldsToValidate as any);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setValue('tags', newTags);
    }
    setCustomTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: CreateEventData, saveAsDraft = false) => {
    setIsSubmitting(true);
    try {
      const eventData = {
        ...data,
        tags: selectedTags,
        max_attendees: data.max_attendees || data.capacity
      };

      const createdEvent = await eventService.createEvent(eventData);
      
      // If not saving as draft, publish immediately
      if (!saveAsDraft) {
        await eventService.updateEventStatus(createdEvent.id, 'published');
      }

      toast({
        title: saveAsDraft ? 'Draft Saved!' : 'Event Created!',
        description: saveAsDraft 
          ? 'Your event has been saved as a draft. You can publish it later.'
          : 'Your event has been created and published successfully.',
      });

      if (onSuccess) {
        onSuccess(createdEvent.id);
      } else {
        navigate('/admin/events');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
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
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
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
                    min={new Date().toISOString().split('T')[0]}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                  min={watchedValues.event_date}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time (Optional)</Label>
                <Input
                  id="end_time"
                  type="time"
                  {...register('end_time')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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

            <div className="space-y-2">
              <Label htmlFor="address">Full Address (Optional)</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Street address, city, state, postal code"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                <Label htmlFor="max_attendees">Max Attendees *</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  {...register('max_attendees', {
                    required: 'Maximum attendees is required',
                    min: { value: 1, message: 'Must allow at least 1 attendee' },
                    max: { value: watchedValues.capacity || 10000, message: 'Cannot exceed event capacity' },
                    valueAsNumber: true
                  })}
                  placeholder="100"
                />
                {errors.max_attendees && (
                  <p className="text-sm text-red-500">{errors.max_attendees.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Review Your Event</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">TITLE</h4>
                    <p className="text-lg font-medium">{watchedValues.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">CATEGORY</h4>
                    <Badge variant="secondary">{watchedValues.category}</Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">DATE & TIME</h4>
                    <p>{watchedValues.event_date} at {watchedValues.event_time}</p>
                    {watchedValues.end_date && (
                      <p className="text-sm text-gray-600">
                        Until {watchedValues.end_date} {watchedValues.end_time && `at ${watchedValues.end_time}`}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">LOCATION</h4>
                    <p>{watchedValues.venue}</p>
                    <p className="text-sm text-gray-600">{watchedValues.location}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">CAPACITY</h4>
                    <p>{watchedValues.capacity} people</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">PRICE</h4>
                    <p className="text-lg font-semibold">
                      {watchedValues.price === 0 ? 'FREE' : `${watchedValues.currency} ${watchedValues.price}`}
                    </p>
                  </div>

                  {selectedTags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">TAGS</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {watchedValues.featured && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Featured Event
                      </div>
                    )}
                    {watchedValues.is_private && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Private Event
                      </div>
                    )}
                    {watchedValues.requires_approval && (
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        Requires Approval
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">DESCRIPTION</h4>
                <p className="text-sm leading-relaxed">{watchedValues.description}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create New Event
            </CardTitle>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</span>
              <span>{Math.round(completionPercentage)}% Complete</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
            {renderStepContent()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep === steps.length - 1 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSubmit((data) => onSubmit(data, true))()}
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Creating...' : 'Create & Publish'}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
