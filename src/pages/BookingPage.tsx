import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { stripeService } from '../services/stripeService';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  price: number;
  image: string;
  capacity: number;
  ticketsSold: number;
  category: string;
  organizer: string;
}

interface BookingForm {
  quantity: number;
  ticketType: 'general' | 'vip' | 'premium';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface TicketType {
  type: 'general' | 'vip' | 'premium';
  name: string;
  price: number;
  description: string;
  benefits: string[];
  available: number;
}

const BookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');

  const [bookingForm, setBookingForm] = useState<BookingForm>({
    quantity: 1,
    ticketType: 'general',
    firstName: profile?.full_name?.split(' ')[0] || '',
    lastName: profile?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    specialRequests: ''
  });

  const ticketTypes: TicketType[] = [
    {
      type: 'general',
      name: 'General Admission',
      price: 150,
      description: 'Standard event access',
      benefits: ['Event entry', 'Access to main areas', 'Standard facilities'],
      available: 500
    },
    {
      type: 'vip',
      name: 'VIP Experience',
      price: 299,
      description: 'Premium event experience',
      benefits: ['Priority entry', 'VIP area access', 'Complimentary drinks', 'Premium seating'],
      available: 100
    },
    {
      type: 'premium',
      name: 'Premium Package',
      price: 199,
      description: 'Enhanced event experience',
      benefits: ['Early entry', 'Reserved seating', 'Welcome drink', 'Event merchandise'],
      available: 200
    }
  ];

  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
    }
  }, [eventId]);

  const loadEvent = async (id: string) => {
    try {
      setLoading(true);
      
      // Mock event data
      const mockEvent: Event = {
        id: id,
        title: 'Summer Music Festival 2025',
        description: 'The ultimate summer music experience featuring top artists from around the world.',
        date: '2025-08-15',
        time: '18:00',
        location: 'Central Park, New York',
        venue: 'Central Park Amphitheater',
        price: 150,
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
        capacity: 10000,
        ticketsSold: 7500,
        category: 'Festival',
        organizer: 'Music Events Co.'
      };
      
      setEvent(mockEvent);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTicketType = (): TicketType => {
    return ticketTypes.find(t => t.type === bookingForm.ticketType) || ticketTypes[0];
  };

  const calculateTotal = (): number => {
    const ticketType = getCurrentTicketType();
    const subtotal = ticketType.price * bookingForm.quantity;
    const fees = subtotal * 0.05; // 5% processing fee
    return subtotal + fees;
  };

  const handleFormChange = (field: keyof BookingForm, value: string | number) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const required = ['firstName', 'lastName', 'email'];
    return required.every(field => bookingForm[field as keyof BookingForm]);
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setProcessing(true);

      // Create booking record
      const bookingData = {
        eventId: event?.id,
        userId: user?.id,
        quantity: bookingForm.quantity,
        ticketType: bookingForm.ticketType,
        totalAmount: calculateTotal(),
        customerInfo: {
          firstName: bookingForm.firstName,
          lastName: bookingForm.lastName,
          email: bookingForm.email,
          phone: bookingForm.phone
        },
        specialRequests: bookingForm.specialRequests
      };

      // Process payment
      let paymentResult;
      if (paymentMethod === 'card') {
        // Use Stripe for card payments
        paymentResult = await stripeService.mockPayment(
          calculateTotal() * 100, // Convert to cents
          event?.id || '',
          user?.id || ''
        );
      } else {
        // Mock other payment methods
        paymentResult = { success: true };
      }

      if (paymentResult.success) {
        const confirmationNumber = `BK${Date.now()}`;
        
        // Success message based on payment method
        let successMessage = `Booking confirmed! Your confirmation number is ${confirmationNumber}.`;
        
        if (paymentMethod === 'bank') {
          successMessage += ' Bank transfer instructions have been sent to your email. ';
          successMessage += 'Please complete the transfer within 48 hours to secure your booking.';
        }
        
        alert(successMessage);
        
        // Redirect to confirmation page or home
        navigate('/', { 
          state: { 
            message: 'Booking successful! Check your email for confirmation details.',
            confirmationNumber
          }
        });
      } else {
        throw new Error(paymentResult.error?.message || 'Payment failed');
      }

    } catch (error: any) {
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
              <div className="aspect-video bg-gradient-to-br from-yellow-400/20 to-purple-500/20 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="text-6xl hidden"
                  style={{ display: 'none' }}
                >
                  🎪
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">{event.title}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <span className="mr-3">📅</span>
                  <span>{new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {event.time}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-3">📍</span>
                  <span>{event.venue}, {event.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-3">🎫</span>
                  <span>{event.capacity - event.ticketsSold} tickets remaining</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-3">🏢</span>
                  <span>Organized by {event.organizer}</span>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">{event.description}</p>
              
              {/* Availability Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Tickets Sold</span>
                  <span>{Math.round((event.ticketsSold / event.capacity) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">Book Your Tickets</h3>

              {/* Ticket Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Ticket Type
                </label>
                <div className="space-y-3">
                  {ticketTypes.map((ticket) => (
                    <div
                      key={ticket.type}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        bookingForm.ticketType === ticket.type
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => handleFormChange('ticketType', ticket.type)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{ticket.name}</h4>
                          <p className="text-sm text-gray-400">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">
                            ${ticket.price}
                          </div>
                          <div className="text-xs text-gray-400">
                            {ticket.available} available
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ticket.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleFormChange('quantity', Math.max(1, bookingForm.quantity - 1))}
                    className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-white min-w-[2rem] text-center">
                    {bookingForm.quantity}
                  </span>
                  <button
                    onClick={() => handleFormChange('quantity', Math.min(10, bookingForm.quantity + 1))}
                    className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.firstName}
                      onChange={(e) => handleFormChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.lastName}
                      onChange={(e) => handleFormChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={bookingForm.specialRequests}
                    onChange={(e) => handleFormChange('specialRequests', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Any special requirements or requests..."
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                    { value: 'paypal', label: 'PayPal', icon: '🟦' },
                    { value: 'bank', label: 'Bank Transfer', icon: '🏦' }
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.value
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="sr-only"
                      />
                      <span className="mr-3">{method.icon}</span>
                      <span className="text-white">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-white/20 pt-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>{getCurrentTicketType().name} × {bookingForm.quantity}</span>
                    <span>${(getCurrentTicketType().price * bookingForm.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Processing Fee</span>
                    <span>${(getCurrentTicketType().price * bookingForm.quantity * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2">
                    <div className="flex justify-between text-xl font-bold text-yellow-400">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={processing || !validateForm()}
                className="w-full bg-yellow-400 text-black py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Complete Booking - $${calculateTotal().toFixed(2)}`
                )}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                By completing this booking, you agree to our Terms of Service and Privacy Policy.
                Your booking is secured with enterprise-grade encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
