import React, { useState } from 'react';
import { useVIPTiers, useCreateVIPReservation } from '../../hooks/useVIP';
import { VIPTier, CreateVIPReservationRequest } from '../../types/vip';
import LoadingSpinner from '../common/LoadingSpinner';

interface VIPBookingProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

const VIPBooking: React.FC<VIPBookingProps> = ({ 
  eventId, 
  eventTitle, 
  eventDate, 
  eventLocation 
}) => {
  const { data: tiers, loading: tiersLoading, error: tiersError } = useVIPTiers();
  const createReservation = useCreateVIPReservation();
  
  const [selectedTier, setSelectedTier] = useState<VIPTier | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getTierColor = (color: string) => {
    const colors = {
      platinum: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600', 
      silver: 'from-gray-300 to-gray-500'
    };
    return colors[color as keyof typeof colors] || 'from-blue-400 to-blue-600';
  };

  const getTierGradient = (color: string) => {
    const gradients = {
      platinum: 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300',
      gold: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300',
      silver: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
    };
    return gradients[color as keyof typeof gradients] || 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300';
  };

  const handleTierSelect = (tier: VIPTier) => {
    if (tier.currentReservations >= tier.maxReservations) return;
    setSelectedTier(tier);
    setShowBookingForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTier) return;

    const newErrors: Record<string, string> = {};
    if (!contactInfo.name.trim()) newErrors.name = 'Name is required';
    if (!contactInfo.email.trim()) newErrors.email = 'Email is required';
    if (!contactInfo.phone.trim()) newErrors.phone = 'Phone is required';
    if (guestCount < 1) newErrors.guestCount = 'At least 1 guest required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const reservationData: CreateVIPReservationRequest = {
        eventId,
        tierId: selectedTier.id,
        guestCount,
        specialRequests,
        contactInfo
      };

      const success = await createReservation.mutate(reservationData);
      if (success) {
        // Reset form
        setShowBookingForm(false);
        setSelectedTier(null);
        setContactInfo({ name: '', email: '', phone: '' });
        setSpecialRequests('');
        setGuestCount(1);
        setErrors({});
        
        if ((window as any).toast) {
          (window as any).toast.success('VIP reservation submitted successfully! We will contact you shortly.');
        }
      }
    }
  };

  if (tiersLoading) {
    return <LoadingSpinner message="Loading VIP packages..." />;
  }

  if (tiersError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading VIP packages: {tiersError}</p>
      </div>
    );
  }

  const availableTiers = tiers?.filter(tier => tier.currentReservations < tier.maxReservations) || [];

  return (
    <div className="space-y-8">
      {/* VIP Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full mb-4">
          <span className="text-xl mr-2">🌟</span>
          <span className="font-semibold">VIP Experience Available</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Elevate Your Experience</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enjoy exclusive perks, premium access, and unforgettable memories with our VIP packages for {eventTitle}.
        </p>
      </div>

      {/* VIP Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers?.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
              tier.currentReservations >= tier.maxReservations
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:shadow-xl hover:scale-105'
            } ${getTierGradient(tier.color)}`}
            onClick={() => handleTierSelect(tier)}
          >
            {/* Tier Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getTierColor(tier.color)} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {tier.icon}
              </div>
            </div>

            {/* Tier Content */}
            <div className="pt-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-gray-600 mb-4">{tier.description}</p>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">${tier.price}</div>
                <div className="text-sm text-gray-600">per person</div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Availability</span>
                  <span>{tier.maxReservations - tier.currentReservations} spots left</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((tier.maxReservations - tier.currentReservations) / tier.maxReservations) * 100}%` }}
                  />
                </div>
              </div>

              {/* Perks */}
              <div className="space-y-3 mb-6 text-left">
                {tier.perks.slice(0, 4).map((perk, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    {perk}
                  </div>
                ))}
                {tier.perks.length > 4 && (
                  <div className="text-center text-sm text-gray-500">
                    +{tier.perks.length - 4} more perks
                  </div>
                )}
              </div>

              {/* Action Button */}
              {tier.currentReservations >= tier.maxReservations ? (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                >
                  🚫 Sold Out
                </button>
              ) : (
                <button
                  onClick={() => handleTierSelect(tier)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  🌟 Book VIP Experience
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Book {selectedTier.name}</h3>
                <p className="text-gray-600">{eventTitle} • {eventDate}</p>
              </div>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Selected Package Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getTierColor(selectedTier.color)} flex items-center justify-center text-white text-lg mr-3`}>
                      {selectedTier.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedTier.name}</h4>
                      <p className="text-sm text-gray-600">${selectedTier.price} per person</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTier.perks.slice(0, 6).map((perk, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {perk}
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  Total: ${selectedTier.price * guestCount}
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Contact Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createReservation.loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {createReservation.loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🌟</span>
                      Submit VIP Reservation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* No VIP Available */}
      {availableTiers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <span className="text-6xl text-gray-400 block mb-4">🌟</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">VIP Packages Sold Out</h3>
          <p className="text-gray-500">
            All VIP packages for this event are currently sold out. Check back later or contact us for availability.
          </p>
        </div>
      )}
    </div>
  );
};

export default VIPBooking;
