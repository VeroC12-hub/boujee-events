import React, { useState } from 'react';
import { CreateEventRequest, UpdateEventRequest, Event } from '../../types/api';
import MediaUploader, { MediaFile } from '../common/MediaUploader';
import MediaGallery from '../common/MediaGallery';

interface EnhancedEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventRequest & { media: MediaFile[] }) => Promise<boolean>;
  loading: boolean;
  editingEvent?: Event | null;
}

const EnhancedEventModal: React.FC<EnhancedEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading, 
  editingEvent 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: editingEvent?.title || '',
    description: editingEvent?.description || '',
    date: editingEvent?.date || '',
    time: editingEvent?.time || '',
    location: editingEvent?.location || '',
    maxAttendees: editingEvent?.maxAttendees || 100,
    category: editingEvent?.category || 'Technology',
    price: editingEvent?.price || 0,
    image: editingEvent?.image || ''
  });

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Technology', 'Music', 'Art', 'Sports', 'Business', 
    'Education', 'Food', 'Health', 'Entertainment', 'Other'
  ];

  const steps = [
    { number: 1, title: 'Basic Information', icon: '📝' },
    { number: 2, title: 'Event Details', icon: '📍' },
    { number: 3, title: 'Media & Gallery', icon: '📸' },
    { number: 4, title: 'Preview & Publish', icon: '👀' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      
      case 2:
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (formData.maxAttendees < 1) newErrors.maxAttendees = 'Max attendees must be at least 1';
        if (formData.price < 0) newErrors.price = 'Price cannot be negative';
        break;
      
      case 3:
        // Media is optional, but we can validate file types/sizes here
        break;
      
      case 4:
        // Final validation - ensure all required fields are filled
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    const success = await onSubmit({ ...formData, media: mediaFiles });
    if (success) {
      resetForm();
      onClose();
      
      if ((window as any).toast) {
        (window as any).toast.success(
          editingEvent ? 'Event updated successfully!' : 'Event created successfully!'
        );
      }
    }
  };

  const resetForm = () => {
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
    setMediaFiles([]);
    setErrors({});
    setCurrentStep(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxAttendees' || name === 'price' ? Number(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMediaChange = (files: MediaFile[]) => {
    setMediaFiles(files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 mr-4">
              🎫 {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step.number
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : currentStep > step.number
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-border bg-white text-gray-400'
                }`}>
                  {currentStep > step.number ? '✓' : step.icon}
                </div>
                <div className="ml-2 hidden md:block">
                  <div className={`text-sm font-medium ${
                    currentStep === step.number ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-12 h-0.5 ml-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  <p className="text-gray-600">Let's start with the essential details</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-border'
                    }`}
                    placeholder="Enter a compelling event title"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-300' : 'border-border'
                    }`}
                    placeholder="Describe your event in detail. What can attendees expect?"
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Event Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                  <p className="text-gray-600">When and where is your event happening?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.date ? 'border-red-300' : 'border-border'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.time ? 'border-red-300' : 'border-border'
                      }`}
                    />
                    {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.location ? 'border-red-300' : 'border-border'
                    }`}
                    placeholder="Venue name, address, or virtual meeting link"
                  />
                  {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Attendees *
                    </label>
                    <input
                      type="number"
                      name="maxAttendees"
                      value={formData.maxAttendees}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.maxAttendees ? 'border-red-300' : 'border-border'
                      }`}
                    />
                    {errors.maxAttendees && <p className="text-red-600 text-sm mt-1">{errors.maxAttendees}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticket Price (USD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.price ? 'border-red-300' : 'border-border'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                    <p className="text-xs text-gray-500 mt-1">Set to 0 for free events</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Media & Gallery */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Media & Gallery</h3>
                  <p className="text-gray-600">Upload images and videos to showcase your event</p>
                </div>

                <MediaUploader
                  onFilesChange={handleMediaChange}
                  maxFiles={20}
                  maxFileSize={100}
                  existingFiles={mediaFiles}
                />

                {mediaFiles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-700 mb-4">Preview Gallery</h4>
                    <MediaGallery media={mediaFiles} title="" />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Preview & Publish */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Preview & Publish</h3>
                  <p className="text-gray-600">Review your event before publishing</p>
                </div>

                {/* Event Preview Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Preview Header Image */}
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    {mediaFiles.length > 0 && mediaFiles[0].type === 'image' ? (
                      <img
                        src={mediaFiles[0].preview}
                        alt={formData.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-center">
                        <span className="text-4xl block mb-2">🎫</span>
                        <p className="text-lg font-medium">{formData.title || 'Event Title'}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {formData.category}
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {formData.price === 0 ? 'FREE' : `$${formData.price}`}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{formData.description}</p>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        {formData.date} at {formData.time}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        {formData.location}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        Up to {formData.maxAttendees} attendees
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📸</span>
                        {mediaFiles.length} media files attached
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Statistics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Event Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-primary">{formData.maxAttendees}</div>
                      <div className="text-xs text-gray-600">Max Capacity</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">
                        ${formData.price === 0 ? '0' : formData.price}
                      </div>
                      <div className="text-xs text-gray-600">Ticket Price</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-600">{mediaFiles.length}</div>
                      <div className="text-xs text-gray-600">Media Files</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-orange-600">0</div>
                      <div className="text-xs text-gray-600">Current RSVPs</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Current time: 2025-08-03 04:40:19 UTC | User: VeroC12-hub
          </div>
          
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                ← Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {editingEvent ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    {editingEvent ? 'Update Event' : 'Publish Event'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEventModal;
