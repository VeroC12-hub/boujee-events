import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';

import { Event } from '../services/eventService';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  perks: string[];
}

const BookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);

  const ticketTypes: TicketType[] = [
    {
      id: 'general',
      name: 'General Admission',
      price: 150,
      description: 'Standard entry with access to all main areas',
      available: 100,
      perks: ['Event access', 'Welcome drink', 'Digital program']
    },
    {
      id: 'vip',
      name: 'VIP Experience',
      price: 500,
      description: 'Premium experience with exclusive perks',
      available: 25,
      perks: ['Priority entry', 'VIP lounge access', 'Premium bar', 'Meet & greet', 'Gift bag']
    },
    {
      id: 'platinum',
      name: 'Platinum Package',
      price: 1500,
      description: 'Ultra-luxury experience for the discerning guest',
      available: 10,
      perks: ['Private entrance', 'Personal concierge', 'Premium dining', 'Exclusive areas', 'Transportation included', 'Professional photos']
    }
  ];

  useEffect(() => {
    // Fetch event details from event service
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventData = await eventService.getEvent(parseInt(eventId || '0'));
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };

  const calculateTotal = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticketType = ticketTypes.find(t => t.id === ticketId);
      return total + (ticketType?.price || 0) * quantity;
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handleBooking = async () => {
    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      alert('Please select at least one ticket');
      return;
    }

    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      // Enhanced payment processing simulation
      console.log(`Processing ${paymentMethod} payment for €${calculateTotal()}`);
      
      // Simulate different payment methods
      let paymentDelay = 2000;
      let paymentMessage = '';
      
      switch (paymentMethod) {
        case 'stripe':
          paymentMessage = 'Processing Stripe payment...';
          paymentDelay = 3000;
          break;
        case 'paypal':
          paymentMessage = 'Redirecting to PayPal...';
          paymentDelay = 2500;
          break;
        case 'bank':
          paymentMessage = 'Processing bank transfer...';
          paymentDelay = 4000;
          break;
        default:
          paymentMessage = 'Processing payment...';
      }

      console.log(paymentMessage);
      await new Promise(resolve => setTimeout(resolve, paymentDelay));

      // Create booking data
      const bookingData = {
        eventId: event?.id,
        eventTitle: event?.title,
        customerInfo,
        tickets: selectedTickets,
        totalAmount: calculateTotal(),
        paymentMethod,
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        paymentStatus: 'completed',
        currency: 'EUR'
      };

      // Save to localStorage (replace with real API call)
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const newBooking = {
        ...bookingData,
        id: Date.now().toString(),
        confirmationNumber: `BE${Date.now().toString().slice(-6)}`
      };
      existingBookings.push(newBooking);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));

      // Record booking in event service
      if (event?.id) {
        await eventService.recordEventBooking(event.id, calculateTotal(), totalTickets);
      }

      // Enhanced success message with payment method info
      let successMessage = `Booking confirmed! Your confirmation number is: ${newBooking.confirmationNumber}`;
      if (paymentMethod === 'bank') {
        successMessage += '\n\nBank transfer details will be sent to your email. Please complete the transfer within 48 hours to secure your booking.';
      }
      
      alert(successMessage);
      
      // Redirect to confirmation page or home
      navigate('/', { 
        state: { 
          message: 'Booking successful! Check your email for confirmation details.',
          confirmationNumber: newBooking.confirmationNumber
        }
      });

    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🎫</div>
          <div className="text-white text-xl">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <div className="text-white text-xl mb-4">Event not found</div>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-yellow-400/20 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-4 text-white hover:text-yellow-400 transition-colors"
          >
            <span className="text-2xl">←</span>
            <div>
              <div className="text-xl font-semibold">Back to Boujee Events</div>
              <div className="text-sm text-gray-300">Book Your Experience</div>
            </div>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Event Details */}
          <div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-purple-500/20 rounded-xl mb-6 flex items-center justify-center">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-purple-500/20 rounded-xl flex items-center justify-center" style={{ display: 'none' }}>
                  <span className="text-8xl">🎭</span>
                </div>
              </div>
              
              <div className="text-sm text-yellow-400 mb-2 uppercase tracking-wide">
                {event.type}
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>
              <p className="text-gray-300 mb-6">{event.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <span className="mr-3 text-xl">📅</span>
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-3 text-xl">📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-3 text-xl">🎫</span>
                  <span>{Math.max(0, event.maxCapacity - event.ticketsSold)} tickets remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-8">
            {/* Ticket Selection */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Select Tickets</h2>
              <div className="space-y-4">
                {ticketTypes.map((ticket) => (
                  <div key={ticket.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{ticket.name}</h3>
                        <p className="text-gray-300 text-sm mb-2">{ticket.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {ticket.perks.map((perk, index) => (
                            <span key={index} className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded text-xs">
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-400">€{ticket.price}</div>
                        <div className="text-sm text-gray-400">{ticket.available} available</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Quantity:</span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateTicketQuantity(ticket.id, (selectedTickets[ticket.id] || 0) - 1)}
                          className="w-8 h-8 bg-gray-600 text-white rounded-full hover:bg-gray-500 transition-colors"
                          disabled={!selectedTickets[ticket.id]}
                        >
                          -
                        </button>
                        <span className="text-white font-semibold w-8 text-center">
                          {selectedTickets[ticket.id] || 0}
                        </span>
                        <button
                          onClick={() => updateTicketQuantity(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                          className="w-8 h-8 bg-yellow-400 text-black rounded-full hover:bg-yellow-500 transition-colors"
                          disabled={(selectedTickets[ticket.id] || 0) >= ticket.available}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Customer Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <textarea
                placeholder="Special requests or dietary requirements"
                value={customerInfo.specialRequests}
                onChange={(e) => setCustomerInfo({...customerInfo, specialRequests: e.target.value})}
                rows={3}
                className="w-full mt-4 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>
              <div className="space-y-3">
                {/* Popular Hungarian Methods */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">Popular in Hungary</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 bg-yellow-400/5 rounded-lg border border-yellow-400/20 cursor-pointer hover:bg-yellow-400/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="szep-card"
                        checked={paymentMethod === 'szep-card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">💎</span>
                          <div>
                            <span className="text-white font-semibold">SZÉP Card</span>
                            <div className="text-xs text-gray-400">Hungarian cafeteria card system</div>
                          </div>
                        </div>
                        <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded text-xs">Most Popular</span>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="otp-simplepay"
                        checked={paymentMethod === 'otp-simplepay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏧</span>
                        <div>
                          <span className="text-white font-semibold">OTP SimplePay</span>
                          <div className="text-xs text-gray-400">Major Hungarian bank payment</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="kh-simplepay"
                        checked={paymentMethod === 'kh-simplepay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏧</span>
                        <div>
                          <span className="text-white font-semibold">K&H SimplePay</span>
                          <div className="text-xs text-gray-400">K&H Bank trusted payment</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="payu"
                        checked={paymentMethod === 'payu'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🔷</span>
                        <div>
                          <span className="text-white font-semibold">PayU</span>
                          <div className="text-xs text-gray-400">Leading Central European processor</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* International Methods */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">International</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💳</span>
                        <div>
                          <span className="text-white font-semibold">Credit/Debit Card</span>
                          <div className="text-xs text-gray-400">Stripe secure payment</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏧</span>
                        <span className="text-white font-semibold">PayPal</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Banking Options */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Banking</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="erste-bank"
                        checked={paymentMethod === 'erste-bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏦</span>
                        <div>
                          <span className="text-white font-semibold">Erste Bank</span>
                          <div className="text-xs text-gray-400">Major Central European bank</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="unicredit"
                        checked={paymentMethod === 'unicredit'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏛️</span>
                        <div>
                          <span className="text-white font-semibold">UniCredit Bank</span>
                          <div className="text-xs text-gray-400">International bank</div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏦</span>
                        <span className="text-white font-semibold">Bank Transfer</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary & Checkout */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              
              {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                if (quantity === 0) return null;
                const ticket = ticketTypes.find(t => t.id === ticketId);
                return (
                  <div key={ticketId} className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">{ticket?.name} x {quantity}</span>
                    <span className="text-white font-semibold">€{(ticket?.price || 0) * quantity}</span>
                  </div>
                );
              })}
              
              <div className="flex justify-between items-center pt-4 mb-6">
                <span className="text-xl font-bold text-white">Total:</span>
                <span className="text-2xl font-bold text-yellow-400">€{calculateTotal()}</span>
              </div>

              <button
                onClick={handleBooking}
                disabled={getTotalTickets() === 0 || processing}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg py-4 px-8 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Processing Payment...
                  </span>
                ) : (
                  `Complete Booking - €${calculateTotal()}`
                )}
              </button>

              <p className="text-xs text-gray-400 mt-4 text-center">
                By completing this booking, you agree to our Terms & Conditions and Privacy Policy. 
                All sales are final. Secure payment processed via SSL encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
