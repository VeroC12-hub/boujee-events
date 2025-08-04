import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Star, Upload, X, Plus, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { eventService, Event } from '../../services/eventService';
import ImageGallery from '../visual/ImageGallery';

interface AdminEventsProps {
  className?: string;
}

const AdminEvents: React.FC<AdminEventsProps> = ({ className }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    type: '',
    price: '',
    maxCapacity: '',
    image: '',
    images: [] as string[],
    featured: false
  });

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await eventService.getEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...formData,
        id: Date.now(),
        price: `€${formData.price}`,
        maxCapacity: parseInt(formData.maxCapacity),
        status: 'active' as const,
        ticketsSold: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        basePrice: parseInt(formData.price),
        organizerId: 'admin',
        metadata: {
          views: 0,
          bookings: 0,
          revenue: 0,
          lastModified: new Date().toISOString()
        }
      };

      await eventService.createEvent(eventData);
      await loadEvents();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const updateData = {
        ...formData,
        price: `€${formData.price}`,
        maxCapacity: parseInt(formData.maxCapacity),
        updatedAt: new Date().toISOString(),
        metadata: {
          ...selectedEvent.metadata,
          lastModified: new Date().toISOString()
        }
      };

      await eventService.updateEvent(selectedEvent.id, updateData);
      await loadEvents();
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(eventId);
        await loadEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        
        if (newImages.length === files.length) {
          setImagePreviews(prev => [...prev, ...newImages]);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages],
            image: prev.image || newImages[0] // Set first image as main if no main image
          }));
          setUploadingImages(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      type: '',
      price: '',
      maxCapacity: '',
      image: '',
      images: [],
      featured: false
    });
    setImagePreviews([]);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      type: event.type,
      price: event.price.replace('€', ''),
      maxCapacity: event.maxCapacity.toString(),
      image: event.image,
      images: event.images || [],
      featured: event.featured
    });
    setImagePreviews(event.images || []);
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Event Management</h1>
          <p className="text-gray-400">Manage your events with visual-first interface</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <CreateEventForm
              formData={formData}
              setFormData={setFormData}
              imagePreviews={imagePreviews}
              uploadingImages={uploadingImages}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
              onSubmit={handleCreateEvent}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search events by title, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin text-4xl">⚡</div>
          <span className="ml-4 text-gray-400">Loading events...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="bg-gray-800 border-gray-700 overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-48">
                  <ImageGallery
                    images={event.images && event.images.length > 0 ? event.images : [event.image]}
                    title={event.title}
                    className="h-full"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    {event.featured && (
                      <Badge className="bg-yellow-500 text-black">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(event)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {event.ticketsSold}/{event.maxCapacity}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {event.price}
                  </div>
                </div>

                {/* Booking Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Bookings</span>
                    <span>{Math.round((event.ticketsSold / event.maxCapacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.ticketsSold / event.maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <CreateEventForm
            formData={formData}
            setFormData={setFormData}
            imagePreviews={imagePreviews}
            uploadingImages={uploadingImages}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
            onSubmit={handleUpdateEvent}
            onCancel={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedEvent(null);
            }}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Separate component for the form to keep the main component cleaner
interface CreateEventFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  imagePreviews: string[];
  uploadingImages: boolean;
  onImageUpload: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({
  formData,
  setFormData,
  imagePreviews,
  uploadingImages,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Festival">Festival</SelectItem>
                <SelectItem value="Luxury Experience">Luxury Experience</SelectItem>
                <SelectItem value="Party">Party</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="VIP Experience">VIP Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter event description"
            className="bg-gray-800 border-gray-700 text-white"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter event location"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (€)
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="Enter price in euros"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Capacity
            </label>
            <Input
              type="number"
              value={formData.maxCapacity}
              onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
              placeholder="Enter maximum capacity"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="images" className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Images
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => onImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={uploadingImages}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                {uploadingImages ? 'Uploading...' : 'Click to upload images or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>
        </div>

        {imagePreviews.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Uploaded Images ({imagePreviews.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviews.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2 bg-yellow-500 text-black text-xs">
                      Main Image
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
            className="rounded border-gray-600 bg-gray-800"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-300">
            Featured Event
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Main Image URL (Optional)
          </label>
          <Input
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="Enter main image URL"
            className="bg-gray-800 border-gray-700 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            If provided, this will override the first uploaded image as the main image
          </p>
        </div>
      </TabsContent>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          {isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </Tabs>
  );
};

export default AdminEvents;