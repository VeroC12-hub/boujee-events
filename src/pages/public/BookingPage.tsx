import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, Star, CreditCard,
  Shield, Check, AlertCircle, Ticket, Mail, Phone, User
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

const BookingPage: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTier = searchParams.get('tier') || 'general';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    quantity: 1,
    specialRequests: ''
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation

  // Mock event data - will be replaced with API call
  const event = {
    id: id || '1',
    title: 'Luxury New Year Gala',
    date: '2024-12-31',
    time: '20:00',
    location: 'Budapest Convention Center',
    address: '1123 Budapest, Alkotás utca 1-3, Hungary',
    image: '/placeholder.svg',
    category: 'Luxury Experiences',
    rating: 4.9,
    ticketTiers: [
      {
        id: 'general',
        name: 'General Admission',
        price: 150,
        description: 'Access to all main event areas, welcome cocktail, and dinner',
        perks: ['Welcome cocktail', 'Gourmet dinner', 'Live entertainment', 'Midnight celebration'],
        available: 25
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 250,
        description: 'Premium seating, exclusive VIP area, and upgraded dining',
        perks: ['All General perks', 'VIP seating area', 'Premium bar access', 'Exclusive networking hour', 'Luxury gift bag'],
        available: 10
      },
      {
        id: 'premium',
        name: 'Premium Table',
        price: 400,
        description: 'Private table for up to 8 guests with dedicated service',
        perks: ['All VIP perks', 'Private table for 8', 'Dedicated server', 'Champagne service', 'Priority valet parking'],
        available: 3
      }
    ]
  };

  const selectedTicketTier = event.ticketTiers.find(tier => tier.id === selectedTier) || event.ticketTiers[0];
  const subtotal = selectedTicketTier.price * formData.quantity;
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + serviceFee;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBooking = () => {
    // This would typically make an API call to process the booking
    console.log('Processing booking:', {
      eventId: event.id,
      tier: selectedTier,
      quantity: formData.quantity,
      customer: formData,
      total
    });
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Back Button */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Button>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 1, title: 'Details', icon: User },
                { step: 2, title: 'Payment', icon: CreditCard },
                { step: 3, title: 'Confirmation', icon: Check }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${currentStep >= step 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                    }
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 hidden sm:block ${
                    currentStep >= step ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {title}
                  </span>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      currentStep > step ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <div className="card-luxury p-8">
                  <h2 className="text-2xl font-bold mb-6">Booking Details</h2>
                  
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ticket Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Ticket Selection</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="quantity">Number of Tickets</Label>
                          <Select 
                            value={formData.quantity.toString()} 
                            onValueChange={(value) => handleInputChange('quantity', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(Math.min(selectedTicketTier.available, 8))].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} {i === 0 ? 'ticket' : 'tickets'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                          <textarea
                            id="specialRequests"
                            className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none"
                            rows={3}
                            value={formData.specialRequests}
                            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                            placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleNextStep} className="w-full btn-luxury">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="card-luxury p-8">
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                  
                  <div className="space-y-6">
                    {/* Payment Methods */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'stripe', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, American Express' },
                          { id: 'paypal', name: 'PayPal', icon: Shield, description: 'Secure PayPal payment' },
                          { id: 'barion', name: 'Barion', icon: CreditCard, description: 'Hungarian payment gateway' },
                          { id: 'otp', name: 'OTP SimplePay', icon: Shield, description: 'Hungarian bank transfer' }
                        ].map((method) => (
                          <div key={method.id} className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                            <div className="flex items-center gap-3">
                              <method.icon className="h-5 w-5 text-primary" />
                              <div>
                                <div className="font-medium">{method.name}</div>
                                <div className="text-sm text-muted-foreground">{method.description}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mock Card Details */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Card Details</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input id="cardName" placeholder="John Doe" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleBooking} className="flex-1 btn-luxury">
                        Complete Booking - €{total}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="card-luxury p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                    <p className="text-muted-foreground">
                      Your tickets have been sent to {formData.email}
                    </p>
                  </div>

                  <div className="border border-border rounded-lg p-6 mb-6">
                    <h3 className="font-semibold mb-4">Booking Reference</h3>
                    <div className="text-2xl font-mono font-bold text-primary mb-4">
                      BE-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please save this reference number for your records
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" onClick={() => navigate('/events')} className="flex-1">
                      Browse More Events
                    </Button>
                    <Button onClick={() => navigate('/')} className="flex-1 btn-luxury">
                      Return to Homepage
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card-luxury p-6 sticky top-4">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                
                {/* Event Info */}
                <div className="mb-6">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Ticket Details */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{selectedTicketTier.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formData.quantity} × €{selectedTicketTier.price}
                        </div>
                      </div>
                      <div className="font-bold">€{subtotal}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>€{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>€{serviceFee}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>€{total}</span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">
                      Secure booking protected by SSL encryption
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;