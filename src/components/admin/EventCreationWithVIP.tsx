import React, { useState } from 'react';
import { CreateEventRequest, UpdateEventRequest, Event } from '../../types/api';
import { UpdateEventTicketsRequest } from '../../types/ticketing';
import { MediaFile } from '../common/MediaUploader';
import MediaUploader from '../common/MediaUploader';
import MediaGallery from '../common/MediaGallery';
import TicketConfigModal from './TicketConfigModal';

interface EventCreationWithVIPProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CreateEventRequest & { media: MediaFile[]; ticketConfig?: UpdateEventTicketsRequest }) => Promise<boolean>;
  loading: boolean;
  editingEvent?: Event | null;
}

const EventCreationWithVIP: React.FC<EventCreationWithVIPProps> = ({ 
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
  const [ticketConfig, setTicketConfig] = useState<UpdateEventTicketsRequest>({
    regularTickets: [
      {
        name: 'General Admission',
        description: 'Standard event access with all basic features',
        category: 'regular',
        price: 50,
        maxQuantity: 200,
        isActive: true,
        benefits: ['Event access', 'Welcome kit', 'Refreshments'],
        color: 'blue',
        icon: '🎫',
        priority: 1
      }
    ],
    vipPackages: [],
    salesStartDate: new Date().toISOString(),
    salesEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    maxTicketsPerOrder: 10,
    refundPolicy: 'Full refund available until 7 days before event',
    terms: 'By purchasing tickets, you agree to our terms and conditions'
  });

  const [enableTicketing, setEnableTicketing] = useState(true);
  const [showTicketConfig, setShowTicketConfig] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Event Details', icon: '📝' },
    { number: 2, title: 'Media Gallery', icon: '📸' },
    { number: 3, title: 'Ticketing & VIP', icon: '🎫' },
    { number: 4, title: 'Review & Publish', icon: '👀' }
  ];

  const categories = [
    'Technology', 'Music', 'Art', 'Sports', 'Business', 
    'Education', 'Food', 'Health', 'Entertainment', 'Other'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (formData.maxAttendees < 1) newErrors.maxAttendees = 'Max attendees must be at least 1';
        break;
      
      case 2:
        // Media is optional
        break;
      
      case 3:
        if (enableTicketing) {
          if (ticketConfig.regularTickets.length === 0 && ticketConfig.vipPackages.length === 0) {
            newErrors.tickets = 'At least one ticket type is required when ticketing is enabled';
          }
        }
        break;
      
      case 4:
        // Final validation
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

    const success = await onSubmit({ 
      ...formData, 
      media: mediaFiles,
      ticketConfig: enableTicketing ? ticketConfig : undefined
    });
    
    if (success) {
      resetForm();
      onClose();
      
      if ((window as any).toast) {
        (window as any).toast.success(
          editingEvent ? 'Event updated successfully!' : 'Event created successfully with ticketing configured!'
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
    setTicketConfig({
      regularTickets: [{
        name: 'General Admission',
        description: 'Standard event access',
        category: 'regular',
        price: 50,
        maxQuantity: 200,
        isActive: true,
        benefits: ['Event access', 'Welcome kit'],
        color: 'blue',
        icon: '🎫',
        priority: 1
      }],
      vipPackages: [],
      salesStartDate: new Date().toISOString(),
      salesEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxTicketsPerOrder: 10,
      refundPolicy: 'Full refund available until 7 days before event',
      terms: 'By purchasing tickets, you agree to our terms and conditions'
    });
    setEnableTicketing(true);
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

  const handleTicketConfigSave = async (config: UpdateEventTicketsRequest): Promise<boolean> => {
    setTicketConfig(config);
    setShowTicketConfig(false);
    if ((window as any).toast) {
      (window as any).toast.success('Ticket configuration saved!');
    }
    return true;
  };

  const addVIPPackage = (type: 'platinum' | 'gold' | 'silver') => {
    const vipTemplates = {
      platinum: {
        name: 'Platinum VIP',
        description: 'Ultimate luxury experience with exclusive access',
        category: 'vip' as const,
        price: 500,
        maxQuantity: 20,
        isActive: true,
        benefits: [
          'All standard access',
          'Private VIP lounge',
          'Premium dining experience',
          'Meet & greet opportunities',
          'Exclusive merchandise',
          'Personal concierge service',
          'VIP parking',
          'Priority entry/exit'
        ],
        color: 'platinum',
        icon: '👑',
        priority: 1,
        groupDiscounts: [
          { minQuantity: 3, discountPercent: 10, description: '10% off for 3+ tickets' },
          { minQuantity: 5, discountPercent: 15, description: '15% off for 5+ tickets' }
        ]
      },
      gold: {
        name: 'Gold VIP',
        description: 'Premium experience with enhanced amenities',
        category: 'vip' as const,
        price: 300,
        maxQuantity: 50,
        isActive: true,
        benefits: [
          'All standard access',
          'VIP seating area',
          'Complimentary refreshments',
          'Priority customer service',
          'Reserved parking',
          'VIP restrooms',
          'Welcome gift'
        ],
        color: 'gold',
        icon: '⭐',
        priority: 2,
        earlyBirdPrice: 275,
        earlyBirdDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      silver: {
        name: 'Silver VIP',
        description: 'Enhanced experience with special perks',
        category: 'vip' as const,
        price: 150,
        maxQuantity: 100,
        isActive: true,
        benefits: [
          'All standard access',
          'Priority entrance',
          'Reserved seating section',
          'Welcome drink',
          'Event materials',
          'Fast-track registration'
        ],
        color: 'silver',
        icon: '🎖️',
        priority: 3
      }
    };

    const newVIPPackage = vipTemplates[type];
    setTicketConfig(prev => ({
      ...prev,
      vipPackages: [...prev.vipPackages, newVIPPackage]
    }));
  };

  const removeVIPPackage = (index: number) => {
    setTicketConfig(prev => ({
      ...prev,
      vipPackages: prev.vipPackages.filter((_, i) => i !== index)
    }));
  };

  const updateVIPPackage = (index: number, field: string, value: any) => {
    setTicketConfig(prev => ({
      ...prev,
      vipPackages: prev.vipPackages.map((pkg, i) => 
        i === index ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
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
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                  <p className="text-gray-600">Configure your event information</p>
                  <p className="text-xs text-gray-500 mt-1">Current time: 2025-08-03 05:40:50 UTC | User: VeroC12-hub</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
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
                      placeholder="Enter event title"
                    />
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                  </div>

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

                  <div className="md:col-span-2">
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
                      placeholder="Venue address or virtual meeting link"
                    />
                    {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Attendees *
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? 'border-red-300' : 'border-border'
                      }`}
                      placeholder="Describe your event in detail"
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Media Gallery */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Media Gallery</h3>
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

            {/* Step 3: Ticketing & VIP Configuration */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Ticketing & VIP Configuration</h3>
                  <p className="text-gray-600">Set up tickets and VIP packages for your event</p>
                </div>

                {/* Enable Ticketing Toggle */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Enable Ticketing System</h4>
                      <p className="text-sm text-blue-700">Allow attendees to purchase tickets for this event</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableTicketing}
                        onChange={(e) => setEnableTicketing(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                {enableTicketing && (
                  <div className="space-y-6">
                    {/* Regular Tickets */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">🎫 Regular Tickets</h4>
                      <div className="space-y-4">
                        {ticketConfig.regularTickets.map((ticket, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                  type="text"
                                  value={ticket.name}
                                  onChange={(e) => {
                                    const updatedTickets = [...ticketConfig.regularTickets];
                                    updatedTickets[index] = { ...ticket, name: e.target.value };
                                    setTicketConfig(prev => ({ ...prev, regularTickets: updatedTickets }));
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={ticket.price}
                                  onChange={(e) => {
                                    const updatedTickets = [...ticketConfig.regularTickets];
                                    updatedTickets[index] = { ...ticket, price: Number(e.target.value) };
                                    setTicketConfig(prev => ({ ...prev, regularTickets: updatedTickets }));
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={ticket.maxQuantity}
                                  onChange={(e) => {
                                    const updatedTickets = [...ticketConfig.regularTickets];
                                    updatedTickets[index] = { ...ticket, maxQuantity: Number(e.target.value) };
                                    setTicketConfig(prev => ({ ...prev, regularTickets: updatedTickets }));
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTicketConfig(prev => ({
                                      ...prev,
                                      regularTickets: prev.regularTickets.filter((_, i) => i !== index)
                                    }));
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm px-3 py-2"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* VIP Packages */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">🌟 VIP Packages</h4>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => addVIPPackage('platinum')}
                            className="bg-gray-600 text-white text-xs px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                          >
                            + Platinum
                          </button>
                          <button
                            type="button"
                            onClick={() => addVIPPackage('gold')}
                            className="bg-yellow-600 text-white text-xs px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                          >
                            + Gold
                          </button>
                          <button
                            type="button"
                            onClick={() => addVIPPackage('silver')}
                            className="bg-gray-500 text-white text-xs px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                          >
                            + Silver
                          </button>
                        </div>
                      </div>

                      {ticketConfig.vipPackages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <span className="text-4xl block mb-2">🌟</span>
                          <p>No VIP packages configured</p>
                          <p className="text-sm">Add VIP packages to offer premium experiences</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ticketConfig.vipPackages.map((vipPackage, index) => (
                            <div key={index} className="bg-white border border-purple-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <span className="text-2xl mr-2">{vipPackage.icon}</span>
                                  <h5 className="font-semibold text-gray-900">{vipPackage.name}</h5>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeVIPPackage(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                                  <input
                                    type="text"
                                    value={vipPackage.name}
                                    onChange={(e) => updateVIPPackage(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={vipPackage.price}
                                    onChange={(e) => updateVIPPackage(index, 'price', Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Max VIP Slots</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={vipPackage.maxQuantity}
                                    onChange={(e) => updateVIPPackage(index, 'maxQuantity', Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  rows={2}
                                  value={vipPackage.description}
                                  onChange={(e) => updateVIPPackage(index, 'description', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Describe what makes this VIP package special"
                                />
                              </div>

                              <div className="bg-purple-50 rounded-lg p-3">
                                <h6 className="text-sm font-medium text-purple-900 mb-2">Benefits Included:</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-purple-800">
                                  {vipPackage.benefits.map((benefit, benefitIndex) => (
                                    <div key={benefitIndex} className="flex items-center">
                                      <span className="text-purple-500 mr-1">✓</span>
                                      {benefit}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Advanced Ticket Configuration */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowTicketConfig(true)}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        🎫 Advanced Ticket Configuration
                      </button>
                      <p className="text-sm text-gray-600 mt-2">
                        Configure sales dates, terms, early bird pricing, and more
                      </p>
                    </div>

                    {errors.tickets && <p className="text-red-600 text-sm">{errors.tickets}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Publish */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Review & Publish</h3>
                  <p className="text-gray-600">Review your event before publishing</p>
                </div>

                {/* Event Preview */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
                      {enableTicketing && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          🎫 Ticketing Enabled
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{formData.description}</p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
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
                        {mediaFiles.length} media files
                      </div>
                    </div>

                    {/* Ticketing Summary */}
                    {enableTicketing && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Ticket Configuration</h4>
                        
                        {/* Regular Tickets */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Regular Tickets:</h5>
                          <div className="space-y-1">
                            {ticketConfig.regularTickets.map((ticket, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{ticket.name}</span>
                                <span className="font-medium">${ticket.price} ({ticket.maxQuantity} available)</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* VIP Packages */}
                        {ticketConfig.vipPackages.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">VIP Packages:</h5>
                            <div className="space-y-1">
                              {ticketConfig.vipPackages.map((vip, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="flex items-center">
                                    <span className="mr-1">{vip.icon}</span>
                                    {vip.name}
                                  </span>
                                  <span className="font-medium text-purple-600">
                                    ${vip.price} ({vip.maxQuantity} slots)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Total potential revenue: ${
                            ticketConfig.regularTickets.reduce((sum, t) => sum + (t.price * t.maxQuantity), 0) +
                            ticketConfig.vipPackages.reduce((sum, v) => sum + (v.price * v.maxQuantity), 0)
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Current time: 2025-08-03 05:40:50 UTC | User: VeroC12-hub
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

      {/* Advanced Ticket Configuration Modal */}
      <TicketConfigModal
        isOpen={showTicketConfig}
        onClose={() => setShowTicketConfig(false)}
        onSubmit={handleTicketConfigSave}
        loading={false}
        eventId="new-event"
        eventTitle={formData.title}
        initialConfig={ticketConfig}
      />
    </div>
  );
};

export default EventCreationWithVIP;
