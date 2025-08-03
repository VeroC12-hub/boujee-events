import React, { useState, useEffect } from 'react';
import { TicketType, CreateTicketReservationRequest, EventTicketConfiguration } from '../../types/ticketing';
import { ticketingService } from '../../services/ticketingService';
import LoadingSpinner from '../common/LoadingSpinner';

interface EventBookingProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage?: string;
}

interface SelectedTicket {
  ticketType: TicketType;
  quantity: number;
  guestNames: string[];
  subtotal: number;
}

const EventBooking: React.FC<EventBookingProps> = ({
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventImage
}) => {
  const [ticketConfig, setTicketConfig] = useState<EventTicketConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load ticket configuration
  useEffect(() => {
    const loadTicketConfig = async () => {
      try {
        setLoading(true);
        const response = await ticketingService.getEventTickets(eventId);
        if (response.success && response.data) {
          setTicketConfig(response.data);
        } else {
          setError(response.error || 'Failed to load ticket information');
        }
      } catch (err) {
        setError('Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    loadTicketConfig();
  }, [eventId]);

  const getTierColor = (color: string) => {
    const colors = {
      platinum: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      silver: 'from-gray-300 to-gray-500',
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      gray: 'from-gray-400 to-gray-600'
    };
    return colors[color as keyof typeof colors] || 'from-blue-400 to-blue-600';
  };

  const getTierGradient = (color: string) => {
    const gradients = {
      platinum: 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300',
      gold: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300',
      silver: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300',
      blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
      green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300',
      gray: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
    };
    return gradients[color as keyof typeof gradients] || 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300';
  };

  const calculatePrice = (ticket: TicketType, quantity: number): number => {
    let unitPrice = ticket.price;
    const now = new Date();

    // Check early bird pricing
    if (ticket.earlyBirdPrice && ticket.earlyBirdDeadline) {
      const deadline = new Date(ticket.earlyBirdDeadline);
      if (now <= deadline) {
        unitPrice = ticket.earlyBirdPrice;
      }
    }

    // Check group discounts for VIP
    if (ticket.category === 'vip' && ticket.groupDiscounts) {
      const applicableDiscount = ticket.groupDiscounts
        .filter(d => quantity >= d.minQuantity)
        .sort((a, b) => b.discountPercent - a.discountPercent)[0];
      
      if (applicableDiscount) {
        unitPrice = unitPrice * (1 - applicableDiscount.discountPercent / 100);
      }
    }

    return Math.round(unitPrice * quantity * 100) / 100;
  };

  const updateTicketQuantity = (ticket: TicketType, quantity: number) => {
    const existingIndex = selectedTickets.findIndex(st => st.ticketType.id === ticket.id);
    
    if (quantity === 0) {
      // Remove ticket
      if (existingIndex >= 0) {
        setSelectedTickets(prev => prev.filter((_, i) => i !== existingIndex));
      }
      return;
    }

    const subtotal = calculatePrice(ticket, quantity);
    const guestNames = Array(quantity).fill('').map((_, i) => 
      existingIndex >= 0 && selectedTickets[existingIndex].guestNames[i] 
        ? selectedTickets[existingIndex].guestNames[i] 
        : ''
    );

    const selectedTicket: SelectedTicket = {
      ticketType: ticket,
      quantity,
      guestNames,
      subtotal
    };

    if (existingIndex >= 0) {
      // Update existing
      setSelectedTickets(prev => prev.map((st, i) => i === existingIndex ? selectedTicket : st));
    } else {
      // Add new
      setSelectedTickets(prev => [...prev, selectedTicket]);
    }
  };

  const updateGuestName = (ticketId: string, guestIndex: number, name: string) => {
    setSelectedTickets(prev => prev.map(st => {
      if (st.ticketType.id === ticketId) {
        const updatedGuestNames = [...st.guestNames];
        updatedGuestNames[guestIndex] = name;
        return { ...st, guestNames: updatedGuestNames };
      }
      return st;
    }));
  };

  const getTotalAmount = (): number => {
    return selectedTickets.reduce((sum, st) => sum + st.subtotal, 0);
  };

  const getTotalQuantity = (): number => {
    return selectedTickets.reduce((sum, st) => sum + st.quantity, 0);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTickets.length === 0) {
      if ((window as any).toast) {
        (window as any).toast.error('Please select at least one ticket');
      }
      return;
    }

    // Validation
    const newErrors: Record<string, string> = {};
    if (!contactInfo.name.trim()) newErrors.name = 'Name is required';
    if (!contactInfo.email.trim()) newErrors.email = 'Email is required';
    if (!contactInfo.phone.trim()) newErrors.phone = 'Phone is required';

    // Validate guest names for VIP tickets
    selectedTickets.forEach((st, stIndex) => {
      if (st.ticketType.category === 'vip') {
        st.guestNames.forEach((name, guestIndex) => {
          if (!name.trim()) {
            newErrors[`guest-${stIndex}-${guestIndex}`] = 'Guest name required for VIP tickets';
          }
        });
      }
    });

    setFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setBookingLoading(true);
        
        const reservationData: CreateTicketReservationRequest = {
          eventId,
          tickets: selectedTickets.map(st => ({
            ticketTypeId: st.ticketType.id,
            quantity: st.quantity,
            guestNames: st.ticketType.category === 'vip' ? st.guestNames : undefined
          })),
          contactInfo,
          specialRequests: specialRequests || undefined
        };

        const response = await ticketingService.createReservation(reservationData);
        
        if (response.success && response.data) {
          // Reset form
          setSelectedTickets([]);
          setShowBookingForm(false);
          setContactInfo({ name: '', email: '', phone: '' });
          setSpecialRequests('');
          setFormErrors({});
          
          if ((window as any).toast) {
            (window as any).toast.success(
              `Booking submitted successfully! Reservation code: ${response.data.reservationCode}`
            );
          }
        } else {
          if ((window as any).toast) {
            (window as any).toast.error(response.error || 'Booking failed');
          }
        }
      } catch (err) {
        if ((window as any).toast) {
          (window as any).toast.error('Booking failed. Please try again.');
        }
      } finally {
        setBookingLoading(false);
      }
    }
  };

  const isEventActive = (): boolean => {
    if (!ticketConfig) return false;
    const now = new Date();
    const salesStart = new Date(ticketConfig.salesStartDate);
    const salesEnd = new Date(ticketConfig.salesEndDate);
    return now >= salesStart && now <= salesEnd;
  };

  const getSalesStatus = (): string => {
    if (!ticketConfig) return '';
    const now = new Date();
    const salesStart = new Date(ticketConfig.salesStartDate);
    const salesEnd = new Date(ticketConfig.salesEndDate);
    
    if (now < salesStart) {
      return `Sales start on ${salesStart.toLocaleDateString()}`;
    }
    if (now > salesEnd) {
      return 'Sales have ended';
    }
    return 'Sales are live!';
  };

  if (loading) {
    return <LoadingSpinner message="Loading ticket information..." />;
  }

  if (error || !ticketConfig) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <span className="text-4xl text-red-400 block mb-4">🎫</span>
        <h3 className="text-lg font-medium text-red-900 mb-2">Tickets Not Available</h3>
        <p className="text-red-700">{error || 'Ticket sales have not been configured for this event.'}</p>
      </div>
    );
  }

  const allTickets = [...ticketConfig.regularTickets, ...ticketConfig.vipPackages]
    .filter(ticket => ticket.isActive && ticket.currentSold < ticket.maxQuantity)
    .sort((a, b) => a.priority - b.priority);

  if (allTickets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <span className="text-6xl text-gray-400 block mb-4">🎫</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">All Tickets Sold Out</h3>
        <p className="text-gray-500">
          All tickets for this event are currently sold out. Check back later or contact us for availability.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{eventTitle}</h2>
            <div className="space-y-1 text-blue-100">
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                {eventDate} at {eventTime}
              </div>
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                {eventLocation}
              </div>
              <div className="flex items-center">
                <span className="mr-2">🎫</span>
                {getSalesStatus()}
              </div>
            </div>
          </div>
          {eventImage && (
            <img
              src={eventImage}
              alt={eventTitle}
              className="w-24 h-24 rounded-lg object-cover border-2 border-white/20"
            />
          )}
        </div>
      </div>

      {/* Ticket Selection */}
      {isEventActive() ? (
        <div className="space-y-6">
          {/* Regular Tickets Section */}
          {ticketConfig.regularTickets.filter(t => t.isActive && t.currentSold < t.maxQuantity).length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🎫 Regular Tickets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ticketConfig.regularTickets
                  .filter(ticket => ticket.isActive && ticket.currentSold < ticket.maxQuantity)
                  .map((ticket) => {
                    const selectedTicket = selectedTickets.find(st => st.ticketType.id === ticket.id);
                    const currentQuantity = selectedTicket?.quantity || 0;
                    const available = ticket.maxQuantity - ticket.currentSold;
                    const currentPrice = calculatePrice(ticket, 1);
                    const hasEarlyBird = ticket.earlyBirdPrice && ticket.earlyBirdDeadline && 
                      new Date() <= new Date(ticket.earlyBirdDeadline);

                    return (
                      <div
                        key={ticket.id}
                        className={`border-2 rounded-lg p-4 transition-all ${getTierGradient(ticket.color)}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTierColor(ticket.color)} flex items-center justify-center text-white text-sm mr-3`}>
                              {ticket.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                              {hasEarlyBird && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                  Early Bird!
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              ${currentPrice}
                              {hasEarlyBird && (
                                <span className="text-sm line-through text-gray-500 ml-1">
                                  ${ticket.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>

                        {/* Benefits */}
                        <div className="space-y-1 mb-4">
                          {ticket.benefits.slice(0, 3).map((benefit, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-700">
                              <span className="text-green-500 mr-2">✓</span>
                              {benefit}
                            </div>
                          ))}
                          {ticket.benefits.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{ticket.benefits.length - 3} more benefits
                            </div>
                          )}
                        </div>

                        {/* Availability */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Available</span>
                            <span>{available} left</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${(available / ticket.maxQuantity) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateTicketQuantity(ticket, Math.max(0, currentQuantity - 1))}
                              className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                              disabled={currentQuantity === 0}
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-medium">{currentQuantity}</span>
                            <button
                              onClick={() => updateTicketQuantity(ticket, Math.min(available, currentQuantity + 1))}
                              className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              disabled={currentQuantity >= available || currentQuantity >= (ticketConfig.maxTicketsPerOrder || 10)}
                            >
                              +
                            </button>
                          </div>
                          {currentQuantity > 0 && (
                            <span className="text-sm font-medium text-green-600">
                              ${selectedTicket?.subtotal}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* VIP Packages Section */}
          {ticketConfig.vipPackages.filter(t => t.isActive && t.currentSold < t.maxQuantity).length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🌟</span>
                VIP Experiences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ticketConfig.vipPackages
                  .filter(ticket => ticket.isActive && ticket.currentSold < ticket.maxQuantity)
                  .map((ticket) => {
                    const selectedTicket = selectedTickets.find(st => st.ticketType.id === ticket.id);
                    const currentQuantity = selectedTicket?.quantity || 0;
                    const available = ticket.maxQuantity - ticket.currentSold;
                    const currentPrice = calculatePrice(ticket, 1);
                    const hasEarlyBird = ticket.earlyBirdPrice && ticket.earlyBirdDeadline && 
                      new Date() <= new Date(ticket.earlyBirdDeadline);
                    const hasGroupDiscount = ticket.groupDiscounts && ticket.groupDiscounts.length > 0;

                    return (
                      <div
                        key={ticket.id}
                        className={`border-2 rounded-xl p-6 transition-all hover:shadow-xl ${getTierGradient(ticket.color)}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getTierColor(ticket.color)} flex items-center justify-center text-white text-xl mr-4`}>
                              {ticket.icon}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{ticket.name}</h4>
                              <div className="flex items-center space-x-2">
                                {hasEarlyBird && (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                    Early Bird!
                                  </span>
                                )}
                                {hasGroupDiscount && (
                                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                    Group Discount
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ${currentPrice}
                              {hasEarlyBird && (
                                <div className="text-sm line-through text-gray-500">
                                  ${ticket.price}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{ticket.description}</p>

                        {/* VIP Benefits */}
                        <div className="space-y-2 mb-4">
                          {ticket.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-700">
                              <span className="text-gold-500 mr-2">✨</span>
                              {benefit}
                            </div>
                          ))}
                        </div>

                        {/* Group Discount Info */}
                        {hasGroupDiscount && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                            <h5 className="text-sm font-medium text-purple-900 mb-1">Group Discounts</h5>
                            {ticket.groupDiscounts?.map((discount, index) => (
                              <div key={index} className="text-xs text-purple-700">
                                Buy {discount.minQuantity}+ tickets: {discount.discountPercent}% off
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Availability */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Exclusive spots available</span>
                            <span>{available} left</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(available / ticket.maxQuantity) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateTicketQuantity(ticket, Math.max(0, currentQuantity - 1))}
                              className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                              disabled={currentQuantity === 0}
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold text-lg">{currentQuantity}</span>
                            <button
                              onClick={() => updateTicketQuantity(ticket, Math.min(available, currentQuantity + 1))}
                              className="w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                              disabled={currentQuantity >= available || currentQuantity >= (ticketConfig.maxTicketsPerOrder || 10)}
                            >
                              +
                            </button>
                          </div>
                          {currentQuantity > 0 && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-600">
                                ${selectedTicket?.subtotal}
                              </div>
                              {hasGroupDiscount && currentQuantity >= (ticket.groupDiscounts?.[0]?.minQuantity || 3) && (
                                <div className="text-xs text-green-600">
                                  Group discount applied!
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Guest Names for VIP (if selected) */}
                        {currentQuantity > 0 && (
                          <div className="mt-4 pt-4 border-t border-purple-200">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Guest Names Required</h5>
                            <div className="space-y-2">
                              {Array(currentQuantity).fill(0).map((_, guestIndex) => (
                                <input
                                  key={guestIndex}
                                  type="text"
                                  placeholder={`Guest ${guestIndex + 1} Name`}
                                  value={selectedTicket?.guestNames[guestIndex] || ''}
                                  onChange={(e) => updateGuestName(ticket.id, guestIndex, e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Order Summary */}
          {selectedTickets.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky bottom-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {selectedTickets.map((st, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{st.ticketType.name}</span>
                      <span className="text-gray-500 ml-2">×{st.quantity}</span>
                    </div>
                    <span className="font-medium">${st.subtotal}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-4">
                <div>
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-gray-500 ml-2">({getTotalQuantity()} tickets)</span>
                </div>
                <span className="text-2xl font-bold text-green-600">${getTotalAmount()}</span>
              </div>
              
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all"
              >
                🎫 Proceed to Booking
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-6xl text-yellow-400 block mb-4">⏰</span>
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Ticket Sales Not Active</h3>
          <p className="text-yellow-700">{getSalesStatus()}</p>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Complete Your Booking</h3>
                <p className="text-gray-600">{eventTitle} • {eventDate}</p>
                <p className="text-xs text-gray-500 mt-1">Current time: 2025-08-03 05:33:47 UTC | User: VeroC12-hub</p>
              </div>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBooking} className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Your Order</h4>
                {selectedTickets.map((st, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{st.ticketType.name}</span>
                      <span className="text-gray-500 ml-2">×{st.quantity}</span>
                    </div>
                    <span className="font-medium">${st.subtotal}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-3 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-green-600">${getTotalAmount()}</span>
                </div>
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
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
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
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
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
                      formErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              {/* Guest Names Validation for VIP */}
              {selectedTickets.some(st => st.ticketType.category === 'vip') && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3">VIP Guest Names</h4>
                  {selectedTickets
                    .filter(st => st.ticketType.category === 'vip')
                    .map((st, stIndex) => (
                      <div key={stIndex} className="mb-4">
                        <h5 className="text-sm font-medium text-purple-800 mb-2">{st.ticketType.name}</h5>
                        <div className="space-y-2">
                          {st.guestNames.map((name, guestIndex) => (
                            <div key={guestIndex}>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => updateGuestName(st.ticketType.id, guestIndex, e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                  formErrors[`guest-${stIndex}-${guestIndex}`] ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder={`VIP Guest ${guestIndex + 1} Name`}
                              />
                              {formErrors[`guest-${stIndex}-${guestIndex}`] && (
                                <p className="text-red-600 text-xs mt-1">{formErrors[`guest-${stIndex}-${guestIndex}`]}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

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

              {/* Terms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-700 mb-2">{ticketConfig.refundPolicy}</p>
                <p className="text-sm text-gray-700">{ticketConfig.terms}</p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Back to Tickets
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {bookingLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🎫</span>
                      Complete Booking • ${getTotalAmount()}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventBooking;
