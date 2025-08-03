import React, { useState } from 'react';
import { useVIPManagement } from '../../hooks/useVIP';
import { VIPReservation, CreateVIPReservationRequest, VIPTier } from '../../types/vip';
import LoadingSpinner from '../common/LoadingSpinner';

// VIP Reservation Modal Component
interface VIPReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reservationData: CreateVIPReservationRequest) => Promise<boolean>;
  loading: boolean;
  tiers: VIPTier[];
  eventId?: string;
}

const VIPReservationModal: React.FC<VIPReservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  tiers,
  eventId
}) => {
  const [formData, setFormData] = useState<CreateVIPReservationRequest>({
    eventId: eventId || '',
    tierId: '',
    guestCount: 1,
    specialRequests: '',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTier, setSelectedTier] = useState<VIPTier | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.eventId) newErrors.eventId = 'Event is required';
    if (!formData.tierId) newErrors.tierId = 'VIP tier is required';
    if (formData.guestCount < 1) newErrors.guestCount = 'At least 1 guest required';
    if (!formData.contactInfo.name.trim()) newErrors.name = 'Name is required';
    if (!formData.contactInfo.email.trim()) newErrors.email = 'Email is required';
    if (!formData.contactInfo.phone.trim()) newErrors.phone = 'Phone is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const success = await onSubmit(formData);
      if (success) {
        resetForm();
        onClose();
        if ((window as any).toast) {
          (window as any).toast.success('VIP reservation created successfully!');
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      eventId: eventId || '',
      tierId: '',
      guestCount: 1,
      specialRequests: '',
      contactInfo: {
        name: '',
        email: '',
        phone: ''
      }
    });
    setErrors({});
    setSelectedTier(null);
  };

  const handleTierSelect = (tier: VIPTier) => {
    setFormData(prev => ({ ...prev, tierId: tier.id }));
    setSelectedTier(tier);
    if (errors.tierId) {
      setErrors(prev => ({ ...prev, tierId: '' }));
    }
  };

  const getTierColor = (color: string) => {
    const colors = {
      platinum: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      silver: 'from-gray-300 to-gray-500'
    };
    return colors[color as keyof typeof colors] || 'from-blue-400 to-blue-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">🌟 Create VIP Reservation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* VIP Tier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select VIP Tier *
            </label>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => handleTierSelect(tier)}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                    selectedTier?.id === tier.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getTierColor(tier.color)} flex items-center justify-center text-white text-xl mr-4`}>
                        {tier.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                        <p className="text-sm text-gray-600">{tier.description}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 mr-2">
                            {tier.currentReservations}/{tier.maxReservations} reserved
                          </span>
                          <div className="w-16 h-1 bg-gray-200 rounded">
                            <div
                              className="h-1 bg-blue-500 rounded"
                              style={{ width: `${(tier.currentReservations / tier.maxReservations) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${tier.price}</div>
                      <div className="text-xs text-gray-500">per person</div>
                    </div>
                  </div>
                  
                  {tier.currentReservations >= tier.maxReservations && (
                    <div className="mt-2 text-center">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        🚫 Fully Booked
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.tierId && <p className="text-red-600 text-sm mt-1">{errors.tierId}</p>}
          </div>

          {/* Selected Tier Details */}
          {selectedTier && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">✨ {selectedTier.name} Perks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedTier.perks.map((perk, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guest Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.guestCount}
              onChange={(e) => setFormData(prev => ({ ...prev, guestCount: Number(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.guestCount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.guestCount && <p className="text-red-600 text-sm mt-1">{errors.guestCount}</p>}
            {selectedTier && (
              <p className="text-sm text-gray-600 mt-1">
                Total: ${selectedTier.price * formData.guestCount}
              </p>
            )}
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
                value={formData.contactInfo.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, name: e.target.value }
                }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: e.target.value }
                }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: e.target.value }
                }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
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
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special dietary requirements, accessibility needs, or other requests..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTier || selectedTier.currentReservations >= selectedTier.maxReservations}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="mr-2">🌟</span>
                  Create VIP Reservation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main VIP Management Component
const VIPManagement: React.FC = () => {
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter reservations
  const filteredReservations = reservations?.filter(reservation => {
    const matchesSearch = reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateReservation = async (reservationData: CreateVIPReservationRequest): Promise<boolean> => {
    const success = await createReservation(reservationData);
    return success;
  };

  const handleStatusChange = async (reservationId: string, newStatus: VIPReservation['status']) => {
    const success = await updateReservation(reservationId, { status: newStatus });
    if (success) {
      if ((window as any).toast) {
        (window as any).toast.success(`Reservation ${newStatus} successfully`);
      }
    }
  };

  const handleCancelReservation = async (reservationId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to cancel ${userName}'s VIP reservation?`)) {
      const success = await cancelReservation(reservationId);
      if (success) {
        if ((window as any).toast) {
          (window as any).toast.success('VIP reservation cancelled successfully');
        }
      }
    }
  };

  const getStatusColor = (status: VIPReservation['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: VIPReservation['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tierName: string) => {
    if (tierName.includes('Platinum')) return 'from-gray-400 to-gray-600';
    if (tierName.includes('Gold')) return 'from-yellow-400 to-yellow-600';
    if (tierName.includes('Silver')) return 'from-gray-300 to-gray-500';
    return 'from-blue-400 to-blue-600';
  };

  if (tiersLoading || reservationsLoading || analyticsLoading) {
    return <LoadingSpinner fullScreen message="Loading VIP management..." />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🌟 VIP Management</h1>
          <p className="text-gray-600 mt-2">Manage VIP reservations and premium experiences</p>
          <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 04:57:18 UTC | User: VeroC12-hub</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center shadow-lg"
        >
          <span className="mr-2">🌟</span>
          Create VIP Reservation
        </button>
      </div>

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

      {/* VIP Tiers Overview */}
      {tiers && (
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 VIP Tiers Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getTierColor(tier.name)} flex items-center justify-center text-white text-lg mr-3`}>
                      {tier.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                      <p className="text-sm text-gray-600">${tier.price}/person</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Availability</span>
                    <span className="font-medium">
                      {tier.maxReservations - tier.currentReservations}/{tier.maxReservations}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(tier.currentReservations / tier.maxReservations) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((tier.currentReservations / tier.maxReservations) * 100)}% booked
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by guest name, email, or event..."
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
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="cancelled">❌ Cancelled</option>
              <option value="completed">🏁 Completed</option>
            </select>
          </div>
          <button
            onClick={refetchAll}
            disabled={tiersLoading || reservationsLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center"
          >
            <span className={tiersLoading || reservationsLoading ? 'animate-spin' : ''}>🔄</span>
            <span className="ml-2 hidden md:block">Refresh</span>
          </button>
        </div>

        {/* Filter Results Info */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredReservations.length} of {reservations?.length || 0} VIP reservations
            {searchTerm && <span> matching "{searchTerm}"</span>}
            {statusFilter !== 'all' && <span> with status "{statusFilter}"</span>}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(tiersError || reservationsError || analyticsError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">
              {tiersError || reservationsError || analyticsError}
            </span>
          </div>
        </div>
      )}

      {/* VIP Reservations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">VIP Reservations</h3>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl text-gray-400 block mb-4">🌟</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No reservations found' : 'No VIP reservations yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by creating your first VIP reservation'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center mx-auto"
              >
                <span className="mr-2">🌟</span>
                Create First VIP Reservation
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event & Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.userName}
                        </div>
                        <div className="text-sm text-gray-500">{reservation.userEmail}</div>
                        <div className="text-xs text-gray-400">
                          ID: {reservation.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.eventTitle}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${getTierColor(reservation.tierName)} flex items-center justify-center text-white text-xs mr-2`}>
                            {tiers?.find(t => t.id === reservation.tierId)?.icon || '⭐'}
                          </div>
                          <span className="text-sm text-gray-600">{reservation.tierName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        👥 {reservation.guestCount} guests
                      </div>
                      <div className="text-sm text-gray-500">
                        📅 {reservation.reservationDate}
                      </div>
                      {reservation.specialRequests && (
                        <div className="text-xs text-gray-400 mt-1" title={reservation.specialRequests}>
                          📝 Special requests
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                            {reservation.paymentStatus.charAt(0).toUpperCase() + reservation.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${reservation.totalAmount?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${Math.round(reservation.totalAmount / reservation.guestCount)}/person
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                          disabled={updateLoading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Confirm Reservation"
                        >
                          ✅
                        </button>
                      )}
                      
                      {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id, reservation.userName)}
                          disabled={cancelLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Cancel Reservation"
                        >
                          ❌
                        </button>
                      )}
                      
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIP Reservation Modal */}
      <VIPReservationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateReservation}
        loading={createLoading}
        tiers={tiers || []}
      />
    </div>
  );
};

export default VIPManagement;
