import React, { useState, useEffect } from 'react';
import { TicketType, UpdateEventTicketsRequest } from '../../types/ticketing';

interface TicketConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: UpdateEventTicketsRequest) => Promise<boolean>;
  loading: boolean;
  eventId: string;
  eventTitle: string;
  initialConfig?: any;
}

const TicketConfigModal: React.FC<TicketConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  eventId,
  eventTitle,
  initialConfig
}) => {
  const [activeTab, setActiveTab] = useState<'regular' | 'vip'>('regular');
  const [config, setConfig] = useState<UpdateEventTicketsRequest>({
    regularTickets: [
      {
        name: 'Early Bird',
        description: 'Limited time special pricing',
        category: 'regular',
        price: 99,
        maxQuantity: 100,
        isActive: true,
        benefits: ['Event access', 'Welcome kit', 'Lunch'],
        color: 'blue',
        icon: '🐦',
        priority: 1,
        earlyBirdPrice: 89,
        earlyBirdDeadline: '2025-08-10'
      },
      {
        name: 'Standard',
        description: 'Regular pricing with full access',
        category: 'regular',
        price: 149,
        maxQuantity: 300,
        isActive: true,
        benefits: ['Event access', 'Welcome kit', 'Lunch', 'Networking'],
        color: 'gray',
        icon: '🎫',
        priority: 2
      }
    ],
    vipPackages: [
      {
        name: 'Platinum VIP',
        description: 'Ultimate luxury experience',
        category: 'vip',
        price: 750,
        maxQuantity: 15,
        isActive: true,
        benefits: [
          'All standard access',
          'Private networking dinner',
          'VIP lounge access',
          'Premium swag bag',
          'Personal concierge',
          'VIP parking'
        ],
        color: 'platinum',
        icon: '👑',
        priority: 1,
        groupDiscounts: [
          { minQuantity: 3, discountPercent: 10, description: '10% off for 3+ tickets' }
        ]
      },
      {
        name: 'Gold VIP',
        description: 'Premium experience with perks',
        category: 'vip',
        price: 450,
        maxQuantity: 30,
        isActive: true,
        benefits: [
          'All standard access',
          'VIP seating',
          'Complimentary drinks',
          'Priority service',
          'Reserved parking'
        ],
        color: 'gold',
        icon: '⭐',
        priority: 2,
        earlyBirdPrice: 400,
        earlyBirdDeadline: '2025-08-10'
      },
      {
        name: 'Silver VIP',
        description: 'Enhanced experience',
        category: 'vip',
        price: 250,
        maxQuantity: 50,
        isActive: true,
        benefits: [
          'All standard access',
          'Priority entrance',
          'Reserved seating',
          'Welcome drink'
        ],
        color: 'silver',
        icon: '🎖️',
        priority: 3
      }
    ],
    salesStartDate: '2025-08-03T00:00:00Z',
    salesEndDate: '2025-08-14T23:59:59Z',
    maxTicketsPerOrder: 10,
    refundPolicy: 'Full refund available until 7 days before event',
    terms: 'By purchasing tickets, you agree to our terms and conditions'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial config if provided
  useEffect(() => {
    if (initialConfig) {
      setConfig({
        regularTickets: initialConfig.regularTickets || config.regularTickets,
        vipPackages: initialConfig.vipPackages || config.vipPackages,
        salesStartDate: initialConfig.salesStartDate || config.salesStartDate,
        salesEndDate: initialConfig.salesEndDate || config.salesEndDate,
        maxTicketsPerOrder: initialConfig.maxTicketsPerOrder || config.maxTicketsPerOrder,
        refundPolicy: initialConfig.refundPolicy || config.refundPolicy,
        terms: initialConfig.terms || config.terms
      });
    }
  }, [initialConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    // Validate dates
    const salesStart = new Date(config.salesStartDate);
    const salesEnd = new Date(config.salesEndDate);
    const now = new Date();
    
    if (salesStart >= salesEnd) {
      newErrors.salesEndDate = 'End date must be after start date';
    }
    
    if (config.maxTicketsPerOrder < 1) {
      newErrors.maxTicketsPerOrder = 'Must allow at least 1 ticket per order';
    }

    // Validate regular tickets
    config.regularTickets.forEach((ticket, index) => {
      if (!ticket.name.trim()) newErrors[`regular-${index}-name`] = 'Name required';
      if (ticket.price <= 0) newErrors[`regular-${index}-price`] = 'Price must be positive';
      if (ticket.maxQuantity <= 0) newErrors[`regular-${index}-quantity`] = 'Quantity must be positive';
    });

    // Validate VIP packages
    config.vipPackages.forEach((ticket, index) => {
      if (!ticket.name.trim()) newErrors[`vip-${index}-name`] = 'Name required';
      if (ticket.price <= 0) newErrors[`vip-${index}-price`] = 'Price must be positive';
      if (ticket.maxQuantity <= 0) newErrors[`vip-${index}-quantity`] = 'Quantity must be positive';
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const success = await onSubmit(config);
      if (success) {
        onClose();
        if ((window as any).toast) {
          (window as any).toast.success('Ticket configuration saved successfully!');
        }
      }
    }
  };

  const updateTicket = (category: 'regular' | 'vip', index: number, field: string, value: any) => {
    const tickets = category === 'regular' ? config.regularTickets : config.vipPackages;
    const updatedTickets = [...tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    
    setConfig(prev => ({
      ...prev,
      [category === 'regular' ? 'regularTickets' : 'vipPackages']: updatedTickets
    }));

    // Clear error
    const errorKey = `${category}-${index}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addTicket = (category: 'regular' | 'vip') => {
    const newTicket: Omit<TicketType, 'id' | 'currentSold'> = {
      name: '',
      description: '',
      category,
      price: 0,
      maxQuantity: 0,
      isActive: true,
      benefits: [],
      color: category === 'vip' ? 'gold' : 'blue',
      icon: category === 'vip' ? '⭐' : '🎫',
      priority: category === 'regular' ? config.regularTickets.length + 1 : config.vipPackages.length + 1
    };

    if (category === 'regular') {
      setConfig(prev => ({ ...prev, regularTickets: [...prev.regularTickets, newTicket] }));
    } else {
      setConfig(prev => ({ ...prev, vipPackages: [...prev.vipPackages, newTicket] }));
    }
  };

  const removeTicket = (category: 'regular' | 'vip', index: number) => {
    if (category === 'regular') {
      setConfig(prev => ({ 
        ...prev, 
        regularTickets: prev.regularTickets.filter((_, i) => i !== index) 
      }));
    } else {
      setConfig(prev => ({ 
        ...prev, 
        vipPackages: prev.vipPackages.filter((_, i) => i !== index) 
      }));
    }
  };

  const updateBenefit = (category: 'regular' | 'vip', ticketIndex: number, benefitIndex: number, value: string) => {
    const tickets = category === 'regular' ? config.regularTickets : config.vipPackages;
    const updatedTickets = [...tickets];
    const updatedBenefits = [...updatedTickets[ticketIndex].benefits];
    updatedBenefits[benefitIndex] = value;
    updatedTickets[ticketIndex] = { ...updatedTickets[ticketIndex], benefits: updatedBenefits };
    
    setConfig(prev => ({
      ...prev,
      [category === 'regular' ? 'regularTickets' : 'vipPackages']: updatedTickets
    }));
  };

  const addBenefit = (category: 'regular' | 'vip', ticketIndex: number) => {
    const tickets = category === 'regular' ? config.regularTickets : config.vipPackages;
    const updatedTickets = [...tickets];
    updatedTickets[ticketIndex] = {
      ...updatedTickets[ticketIndex],
      benefits: [...updatedTickets[ticketIndex].benefits, '']
    };
    
    setConfig(prev => ({
      ...prev,
      [category === 'regular' ? 'regularTickets' : 'vipPackages']: updatedTickets
    }));
  };

  const removeBenefit = (category: 'regular' | 'vip', ticketIndex: number, benefitIndex: number) => {
    const tickets = category === 'regular' ? config.regularTickets : config.vipPackages;
    const updatedTickets = [...tickets];
    updatedTickets[ticketIndex] = {
      ...updatedTickets[ticketIndex],
      benefits: updatedTickets[ticketIndex].benefits.filter((_, i) => i !== benefitIndex)
    };
    
    setConfig(prev => ({
      ...prev,
      [category === 'regular' ? 'regularTickets' : 'vipPackages']: updatedTickets
    }));
  };

  if (!isOpen) return null;

  const currentTickets = activeTab === 'regular' ? config.regularTickets : config.vipPackages;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">🎫 Configure Event Tickets</h2>
            <p className="text-gray-600">{eventTitle}</p>
            <p className="text-xs text-gray-500">Current time: 2025-08-03 05:24:28 UTC | User: VeroC12-hub</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('regular')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'regular'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🎫 Regular Tickets ({config.regularTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'vip'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🌟 VIP Packages ({config.vipPackages.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            {/* Ticket Configuration */}
            <div className="space-y-6">
              {currentTickets.map((ticket, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-6 ${
                    activeTab === 'vip' 
                      ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50' 
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {activeTab === 'vip' ? '🌟' : '🎫'} {activeTab === 'vip' ? 'VIP Package' : 'Regular Ticket'} #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeTicket(activeTab, index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Ticket Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Name *
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => updateTicket(activeTab, index, 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`${activeTab}-${index}-name`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={`Enter ${activeTab} ticket name`}
                      />
                      {errors[`${activeTab}-${index}-name`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`${activeTab}-${index}-name`]}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (USD) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(e) => updateTicket(activeTab, index, 'price', Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`${activeTab}-${index}-price`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {errors[`${activeTab}-${index}-price`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`${activeTab}-${index}-price`]}</p>
                      )}
                    </div>

                    {/* Max Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tickets Available *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={ticket.maxQuantity}
                        onChange={(e) => updateTicket(activeTab, index, 'maxQuantity', Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`${activeTab}-${index}-quantity`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Number of tickets"
                      />
                      {errors[`${activeTab}-${index}-quantity`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`${activeTab}-${index}-quantity`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={ticket.description}
                      onChange={(e) => updateTicket(activeTab, index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what's included in this ticket"
                    />
                  </div>

                  {/* Early Bird Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Early Bird Price (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.earlyBirdPrice || ''}
                        onChange={(e) => updateTicket(activeTab, index, 'earlyBirdPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Early bird price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Early Bird Deadline
                      </label>
                      <input
                        type="date"
                        value={ticket.earlyBirdDeadline || ''}
                        onChange={(e) => updateTicket(activeTab, index, 'earlyBirdDeadline', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Benefits/Features
                    </label>
                    <div className="space-y-2">
                      {ticket.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => updateBenefit(activeTab, index, benefitIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter benefit or feature"
                          />
                          <button
                            type="button"
                            onClick={() => removeBenefit(activeTab, index, benefitIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addBenefit(activeTab, index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Benefit
                      </button>
                    </div>
                  </div>

                  {/* Group Discounts (VIP Only) */}
                  {activeTab === 'vip' && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Group Discounts</h4>
                      <div className="space-y-2">
                        {ticket.groupDiscounts?.map((discount, discountIndex) => (
                          <div key={discountIndex} className="flex items-center space-x-2 text-sm">
                            <span>Buy {discount.minQuantity}+ tickets, get {discount.discountPercent}% off</span>
                          </div>
                        )) || (
                          <p className="text-sm text-gray-500">No group discounts configured</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active Toggle */}
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id={`active-${activeTab}-${index}`}
                      checked={ticket.isActive}
                      onChange={(e) => updateTicket(activeTab, index, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`active-${activeTab}-${index}`} className="ml-2 text-sm text-gray-700">
                      Active (available for purchase)
                    </label>
                  </div>
                </div>
              ))}

              {/* Add New Ticket Button */}
              <button
                type="button"
                onClick={() => addTicket(activeTab)}
                className={`w-full border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors ${
                  activeTab === 'vip' ? 'border-purple-300' : 'border-blue-300'
                }`}
              >
                <span className="text-2xl">{activeTab === 'vip' ? '🌟' : '🎫'}</span>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  Add New {activeTab === 'vip' ? 'VIP Package' : 'Regular Ticket'}
                </p>
              </button>
            </div>

            {/* General Settings */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={config.salesStartDate.slice(0, 16)}
                    onChange={(e) => setConfig(prev => ({ ...prev, salesStartDate: e.target.value + ':00Z' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={config.salesEndDate.slice(0, 16)}
                    onChange={(e) => setConfig(prev => ({ ...prev, salesEndDate: e.target.value + ':00Z' }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.salesEndDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.salesEndDate && <p className="text-red-600 text-sm mt-1">{errors.salesEndDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tickets Per Order *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={config.maxTicketsPerOrder}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxTicketsPerOrder: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.maxTicketsPerOrder ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxTicketsPerOrder && <p className="text-red-600 text-sm mt-1">{errors.maxTicketsPerOrder}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Policy
                  </label>
                  <textarea
                    rows={3}
                    value={config.refundPolicy}
                    onChange={(e) => setConfig(prev => ({ ...prev, refundPolicy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your refund policy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={config.terms}
                    onChange={(e) => setConfig(prev => ({ ...prev, terms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Terms and conditions for ticket purchase"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Current time: 2025-08-03 05:24:28 UTC | User: VeroC12-hub
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Save Ticket Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketConfigModal;
