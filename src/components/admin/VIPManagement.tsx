import React, { useState, useEffect } from 'react';
import { useVIPManagement } from '../../hooks/useVIP';
import { useEventManagement } from '../../hooks/useEvents';
import { VIPReservation, CreateVIPReservationRequest, VIPTier, EventVIPConfig, CreateEventVIPConfigRequest } from '../../types/vip';
import { Event } from '../../types/api';
import { vipService } from '../../services/vipService';
import LoadingSpinner from '../common/LoadingSpinner';

// VIP Package Manager Component
interface VIPPackageManagerProps {
  events: Event[];
  onPackageCreated: () => void;
}

const VIPPackageManager: React.FC<VIPPackageManagerProps> = ({ events, onPackageCreated }) => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPackageCreator, setShowPackageCreator] = useState(false);
  const [existingPackages, setExistingPackages] = useState<EventVIPConfig[]>([]);
  const [currentPackage, setCurrentPackage] = useState<EventVIPConfig | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom VIP Tier for package creation
  interface CustomVIPTier {
    id: string;
    name: string;
    description: string;
    price: number;
    maxGuests: number;
    perks: string[];
    color: string;
    icon: string;
    isActive: boolean;
  }

  const [customTiers, setCustomTiers] = useState<CustomVIPTier[]>([]);
  const [currentTier, setCurrentTier] = useState<CustomVIPTier>({
    id: `tier-${Date.now()}`,
    name: '',
    description: '',
    price: 0,
    maxGuests: 10,
    perks: [''],
    color: 'blue',
    icon: '⭐',
    isActive: true
  });

  // Predefined tier templates
  const tierTemplates = [
    {
      name: 'Platinum VIP',
      description: 'Ultimate luxury experience',
      icon: '👑',
      color: 'platinum',
      basePrice: 500,
      baseMaxGuests: 20,
      perks: [
        'Private entrance & exit',
        'Dedicated VIP lounge access',
        'Premium open bar',
        'Gourmet dinner service',
        'Personal concierge',
        'VIP parking',
        'Meet & greet opportunity',
        'Exclusive merchandise'
      ]
    },
    {
      name: 'Gold VIP',
      description: 'Premium experience with enhanced amenities',
      icon: '⭐',
      color: 'gold',
      basePrice: 300,
      baseMaxGuests: 50,
      perks: [
        'VIP entrance',
        'VIP seating area',
        'Complimentary drinks',
        'Premium appetizers',
        'Priority customer service',
        'Reserved parking',
        'VIP restroom access'
      ]
    },
    {
      name: 'Silver VIP',
      description: 'Enhanced experience with special perks',
      icon: '🎖️',
      color: 'silver',
      basePrice: 150,
      baseMaxGuests: 100,
      perks: [
        'Priority entrance',
        'Reserved seating',
        'Welcome drink',
        'Event program',
        'Fast-track registration',
        'VIP customer support'
      ]
    }
  ];

  const colorOptions = [
    { value: 'platinum', label: 'Platinum', gradient: 'from-gray-400 to-gray-600' },
    { value: 'gold', label: 'Gold', gradient: 'from-yellow-400 to-yellow-600' },
    { value: 'silver', label: 'Silver', gradient: 'from-gray-300 to-gray-500' },
    { value: 'blue', label: 'Blue', gradient: 'from-blue-400 to-blue-600' },
    { value: 'purple', label: 'Purple', gradient: 'from-purple-400 to-purple-600' },
    { value: 'green', label: 'Green', gradient: 'from-green-400 to-green-600' },
    { value: 'red', label: 'Red', gradient: 'from-red-400 to-red-600' }
  ];

  const iconOptions = ['👑', '⭐', '🎖️', '✨', '💎', '🏆', '🌟', '🎯', '🚀', '💫'];

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      setSelectedEvent(event || null);
      loadExistingPackage(selectedEventId);
    }
  }, [selectedEventId, events]);

  const loadExistingPackage = async (eventId: string) => {
    try {
      const response = await vipService.getEventVIPConfig(eventId);
      if (response.success && response.data) {
        setCurrentPackage(response.data);
        // Convert existing package to editable format
        const existingTiers = response.data.tiers.map(tier => ({
          id: tier.tierId,
          name: tier.tierName,
          description: `Premium ${tier.tierName} experience`,
          price: tier.customPrice,
          maxGuests: tier.maxGuests,
          perks: tier.perks,
          color: tier.color,
          icon: tier.icon,
          isActive: tier.isActive
        }));
        setCustomTiers(existingTiers);
      } else {
        setCurrentPackage(null);
        setCustomTiers([]);
      }
    } catch (error) {
      console.error('Error loading package:', error);
    }
  };

  const addPerk = () => {
    setCurrentTier(prev => ({
      ...prev,
      perks: [...prev.perks, '']
    }));
  };

  const updatePerk = (index: number, value: string) => {
    setCurrentTier(prev => ({
      ...prev,
      perks: prev.perks.map((perk, i) => i === index ? value : perk)
    }));
  };

  const removePerk = (index: number) => {
    setCurrentTier(prev => ({
      ...prev,
      perks: prev.perks.filter((_, i) => i !== index)
    }));
  };

  const useTemplate = (template: typeof tierTemplates[0]) => {
    setCurrentTier(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      price: template.basePrice,
      maxGuests: template.baseMaxGuests,
      perks: [...template.perks]
    }));
  };

  const addTier = () => {
    if (!currentTier.name.trim() || currentTier.price <= 0 || currentTier.maxGuests <= 0) {
      if ((window as any).toast) {
        (window as any).toast.error('Please fill in all required fields');
      }
      return;
    }

    const validPerks = currentTier.perks.filter(perk => perk.trim() !== '');
    if (validPerks.length === 0) {
      if ((window as any).toast) {
        (window as any).toast.error('Please add at least one perk');
      }
      return;
    }

    setCustomTiers(prev => [...prev, { ...currentTier, perks: validPerks }]);
    
    // Reset form
    setCurrentTier({
      id: `tier-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      maxGuests: 10,
      perks: [''],
      color: 'blue',
      icon: '⭐',
      isActive: true
    });
  };

  const removeTier = (index: number) => {
    setCustomTiers(prev => prev.filter((_, i) => i !== index));
  };

  const savePackage = async () => {
    if (!selectedEventId || customTiers.length === 0) {
      if ((window as any).toast) {
        (window as any).toast.error('Please select an event and create at least one VIP tier');
      }
      return;
    }

    setLoading(true);
    
    try {
      const configData: CreateEventVIPConfigRequest = {
        eventId: selectedEventId,
        tiers: customTiers.map(tier => ({
          tierId: tier.id,
          customPrice: tier.price,
          maxGuests: tier.maxGuests,
          isActive: tier.isActive,
          customPerks: tier.perks
        }))
      };

      const response = await vipService.createEventVIPConfig(configData);
      
      if (response.success && response.data) {
        setCurrentPackage(response.data);
        onPackageCreated();
        if ((window as any).toast) {
          (window as any).toast.success('VIP package saved successfully!');
        }
      } else {
        throw new Error(response.error || 'Failed to save VIP package');
      }
    } catch (error) {
      if ((window as any).toast) {
        (window as any).toast.error('Failed to save VIP package');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    return customTiers.reduce((total, tier) => total + (tier.price * tier.maxGuests), 0);
  };

  return (
    <div className="space-y-6">
      {/* Event Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Select Event for VIP Package</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} • {event.date} • {event.location}
                </option>
              ))}
            </select>
          </div>
          
          {selectedEvent && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{selectedEvent.title}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📅 {selectedEvent.date} at {selectedEvent.time}</p>
                <p>📍 {selectedEvent.location}</p>
                <p>👥 {selectedEvent.maxAttendees} max attendees</p>
                <p>💰 ${selectedEvent.price} base ticket</p>
              </div>
            </div>
          )}
        </div>

        {currentPackage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span className="text-green-800">VIP package already exists for this event</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              {currentPackage.tiers.length} VIP tiers configured
            </p>
          </div>
        )}
      </div>

      {/* VIP Package Creator */}
      {selectedEvent && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              🌟 VIP Package for "{selectedEvent.title}"
            </h3>
            <div className="text-sm text-gray-600">
              Max Revenue Potential: ${getTotalRevenue().toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Existing Tiers */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Your VIP Tiers ({customTiers.length})</h4>
              
              {customTiers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <span className="text-4xl block mb-2">🎫</span>
                  <p>No VIP tiers created yet</p>
                  <p className="text-sm">Create your first VIP tier →</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customTiers.map((tier, index) => (
                    <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                            colorOptions.find(c => c.value === tier.color)?.gradient
                          } flex items-center justify-center text-white mr-3`}>
                            {tier.icon}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{tier.name}</h5>
                            <p className="text-sm text-gray-600">${tier.price} • {tier.maxGuests} max</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTier(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove tier"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        Revenue: ${(tier.price * tier.maxGuests).toLocaleString()} • 
                        Perks: {tier.perks.length}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Tier Creator */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">➕ Add New VIP Tier</h4>

              {/* Quick Templates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Start Templates
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {tierTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => useTemplate(template)}
                      className="text-left p-3 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-3">{template.icon}</span>
                          <div>
                            <div className="font-medium text-sm">{template.name}</div>
                            <div className="text-xs text-gray-600">${template.basePrice} • {template.baseMaxGuests} guests</div>
                          </div>
                        </div>
                        <span className="text-blue-600 text-sm">Use →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier Name *
                  </label>
                  <input
                    type="text"
                    value={currentTier.name}
                    onChange={(e) => setCurrentTier(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Premium VIP, Executive Access"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentTier.price}
                      onChange={(e) => setCurrentTier(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Guests *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={currentTier.maxGuests}
                      onChange={(e) => setCurrentTier(prev => ({ ...prev, maxGuests: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      value={currentTier.color}
                      onChange={(e) => setCurrentTier(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <select
                      value={currentTier.icon}
                      onChange={(e) => setCurrentTier(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Perks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIP Perks *
                  </label>
                  <div className="space-y-2">
                    {currentTier.perks.map((perk, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={perk}
                          onChange={(e) => updatePerk(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Premium seating"
                        />
                        <button
                          type="button"
                          onClick={() => removePerk(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={currentTier.perks.length === 1}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPerk}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <span className="mr-1">➕</span>
                      Add Perk
                    </button>
                  </div>
                </div>

                <button
                  onClick={addTier}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ➕ Add Tier
                </button>
              </div>
            </div>
          </div>

          {/* Save Package */}
          {customTiers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Package Summary</h4>
                  <p className="text-sm text-gray-600">
                    {customTiers.length} VIP tiers • ${getTotalRevenue().toLocaleString()} max revenue
                  </p>
                </div>
                <button
                  onClick={savePackage}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Save VIP Package
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main VIP Management with Tabs
const VIPManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'packages' | 'reservations'>('dashboard');
  
  const {
    tiers,
    reservations,
    analytics,
    tiersLoading,
    reservationsLoading,
    analyticsLoading,
    tiersError,
    reservationsError,
    analyticsError,
    createReservation,
    updateReservation,
    cancelReservation,
    createLoading,
    updateLoading,
    cancelLoading,
    refetchAll
  } = useVIPManagement();

  const { events } = useEventManagement();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Analytics & Overview' },
    { id: 'packages', name: 'VIP Packages', icon: '🎫', description: 'Create & Manage Packages' },
    { id: 'reservations', name: 'Reservations', icon: '📋', description: 'Manage Bookings' }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌟 VIP Management</h1>
          <p className="text-gray-600 mt-2">Complete VIP experience management</p>
          <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 10:09:43 UTC | User: VeroC12-hub</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div>{tab.name}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
                {tab.id === 'reservations' && reservations?.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {reservations.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div>
          {/* VIP Analytics Overview */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                    🎫
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.totalReservations}</div>
                    <div className="text-sm text-gray-600">Total VIP Reservations</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                    💰
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">${analytics.totalRevenue?.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total VIP Revenue</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                    📊
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">${Math.round(analytics.avgReservationValue)}</div>
                    <div className="text-sm text-gray-600">Avg Reservation Value</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                    ✅
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.statusBreakdown?.confirmed || 0}</div>
                    <div className="text-sm text-gray-600">Confirmed Reservations</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent VIP Activity</h3>
            <div className="space-y-4">
              {reservations?.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white mr-4">
                      🌟
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{reservation.userName}</div>
                      <div className="text-sm text-gray-600">
                        {reservation.tierName} • {reservation.eventTitle}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">${reservation.totalAmount}</div>
                    <div className="text-sm text-gray-500">{reservation.status}</div>
                  </div>
                </div>
              ))}
              
              {reservations?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">🌟</span>
                  <p>No VIP reservations yet</p>
                  <p className="text-sm">Create VIP packages to start receiving bookings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <VIPPackageManager 
          events={events || []} 
          onPackageCreated={refetchAll}
        />
      )}

      {activeTab === 'reservations' && (
        <div>
          {/* Reservation management content - existing reservation list */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">VIP Reservations</h3>
            {/* Add your existing reservation management code here */}
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">📋</span>
              <p>Reservation management coming soon</p>
              <p className="text-sm">This will show all VIP reservations with management options</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VIPManagement;
