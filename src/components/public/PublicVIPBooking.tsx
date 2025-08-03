import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Crown, Calendar, MapPin, Mail, Phone, User, CreditCard, Shield } from 'lucide-react';
import { usePublicEvent } from '../../hooks/usePublicEvents';
import { publicApi } from '../../services/publicApi';
import { PublicVIPBooking } from '../../types/public';
import LoadingSpinner from '../common/LoadingSpinner';

const PublicVIPBookingComponent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tier = searchParams.get('tier') || 'vip';
  
  const { event, loading: eventLoading, error: eventError } = usePublicEvent(eventId || '');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    quantity: 1,
    specialRequests: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Define tier pricing based on event price
  const getTierDetails = (tierName: string, basePrice: number) => {
    switch (tierName.toLowerCase()) {
      case 'premium':
        return {
          name: 'Premium',
          price: Math.floor(basePrice * 0.8),
          perks: ['General Access', 'Standard Seating', 'Event Welcome Drink', 'Digital Program']
        };
      case 'vip':
        return {
          name: 'VIP',
          price: Math.floor(basePrice * 1.5),
          perks: ['VIP Area Access', 'Premium Seating', 'Complimentary Bar', 'Meet & Greet', 'Priority Entry', 'VIP Concierge']
        };
      case 'platinum':
        return {
          name: 'Platinum',
          price: Math.floor(basePrice * 2.5),
          perks: ['Exclusive Lounge', 'Private Bar', 'Concierge Service', 'VIP Transportation', 'Private Dining', 'Backstage Access']
        };
      default:
        return {
          name: 'VIP',
          price: Math.floor(basePrice * 1.5),
          perks: ['VIP Area Access', 'Premium Seating', 'Complimentary Bar', 'Meet & Greet']
        };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      const tierDetails = getTierDetails(tier, event.price);
      const totalAmount = tierDetails.price * formData.quantity;
      
      const bookingData: Omit<PublicVIPBooking, 'id' | 'bookingDate' | 'status'> = {
        eventId: event.id,
        packageId: `${tier}_${event.id}`,
        ...formData,
        totalAmount
      };
      
      const response = await publicApi.submitVIPBooking(bookingData);
      
      if (response.success) {
        setBookingComplete(true);
      } else {
        setSubmissionError(response.error || 'Failed to submit booking');
      }
    } catch (error) {
      setSubmissionError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (eventLoading) {
    return <LoadingSpinner fullScreen message="Loading event details..." />;
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">
            {eventError || 'The event you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/events')}
            className="btn-luxury"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const tierDetails = getTierDetails(tier, event.price);
  const totalAmount = tierDetails.price * formData.quantity;

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your VIP booking request has been submitted successfully. You'll receive a confirmation email with payment details shortly.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Event
            </button>
            <button
              onClick={() => navigate('/events')}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse More Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="mb-6 flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Event Details
            </button>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              VIP Booking: {tierDetails.name} Experience
            </h1>
            
            {/* Event Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-start space-x-4">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{event.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Booking Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Crown className="w-4 h-4 inline mr-2" />
                        Number of Guests
                      </label>
                      <select
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Any special requirements or dietary restrictions..."
                    />
                  </div>
                  
                  {submissionError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{submissionError}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? 'Submitting...' : `Submit Booking - $${totalAmount.toLocaleString()}`}
                  </button>
                </form>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>
                
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{tierDetails.name} Experience</span>
                      <span className="font-bold text-primary">${tierDetails.price.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Quantity: {formData.quantity} guest{formData.quantity > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Included Benefits:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {tierDetails.perks.map((perk, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <div className="flex items-start">
                      <Shield className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground mb-1">Secure Booking Process</p>
                        <p className="text-muted-foreground">
                          Your booking will be confirmed upon payment processing. You'll receive detailed instructions via email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVIPBookingComponent;