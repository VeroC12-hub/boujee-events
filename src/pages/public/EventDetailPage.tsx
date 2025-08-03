import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Users, Star, Share2, Heart, 
  ArrowLeft, Ticket, Shield, Award, ChevronLeft, ChevronRight
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock event data - will be replaced with API call
  const event = {
    id: id || '1',
    title: 'Luxury New Year Gala',
    description: 'An exclusive celebration with world-class entertainment, featuring live performances from internationally renowned artists, gourmet dining experiences, and premium accommodations. This once-in-a-lifetime event promises to deliver an unforgettable evening of luxury and sophistication.',
    longDescription: `Join us for the most exclusive New Year's celebration in Budapest. This luxury gala event features:

• World-class entertainment including live orchestral performances
• Michelin-starred catering with international cuisine
• Premium open bar with rare spirits and vintage champagnes  
• Elegant dress code with formal attire required
• Professional photography and videography services
• Luxury gift bags for all attendees
• VIP networking opportunities with distinguished guests

The evening begins with a cocktail reception at 8:00 PM, followed by dinner service at 9:30 PM. Live entertainment starts at 11:00 PM, building up to our spectacular midnight celebration with fireworks over the Danube.`,
    date: '2024-12-31',
    time: '20:00',
    endTime: '02:00',
    location: 'Budapest Convention Center',
    address: '1123 Budapest, Alkotás utca 1-3, Hungary',
    venue: {
      name: 'Budapest Convention Center',
      capacity: 500,
      description: 'A stunning venue featuring panoramic views of the Danube River and modern luxury amenities.',
      amenities: ['Valet Parking', 'Coat Check', 'Premium Sound System', 'Climate Control', 'Accessibility']
    },
    price: 150,
    currency: 'EUR',
    images: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    category: 'Luxury Experiences',
    rating: 4.9,
    reviewCount: 127,
    spotsLeft: 25,
    totalSpots: 200,
    organizer: {
      name: 'Elite Events Budapest',
      rating: 4.8,
      eventsHosted: 45,
      description: 'Premier luxury event organizer specializing in exclusive experiences.'
    },
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
    ],
    schedule: [
      { time: '20:00', activity: 'Doors Open & Welcome Reception' },
      { time: '20:30', activity: 'Cocktail Hour & Networking' },
      { time: '21:30', activity: 'Dinner Service Begins' },
      { time: '23:00', activity: 'Live Entertainment Starts' },
      { time: '23:45', activity: 'Midnight Countdown Preparation' },
      { time: '00:00', activity: 'New Year Celebration & Fireworks' },
      { time: '00:30', activity: 'After-party & Dancing' },
      { time: '02:00', activity: 'Event Concludes' }
    ],
    reviews: [
      {
        id: '1',
        author: 'Maria K.',
        rating: 5,
        date: '2023-12-15',
        comment: 'Absolutely magnificent event! The attention to detail was extraordinary and the entertainment was world-class.'
      },
      {
        id: '2', 
        author: 'James R.',
        rating: 5,
        date: '2023-12-10',
        comment: 'Elite Events Budapest always delivers exceptional experiences. This was no exception - truly unforgettable!'
      },
      {
        id: '3',
        author: 'Sophie L.',
        rating: 4,
        date: '2023-12-08',
        comment: 'Beautiful venue and excellent service. The food was outstanding and the entertainment was fantastic.'
      }
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleBooking = (tierId: string) => {
    navigate(`/booking/${event.id}?tier=${tierId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Back Button */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>

      {/* Event Hero */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="relative">
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={event.images[currentImageIndex]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {event.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {event.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {event.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Event Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="secondary" className="mb-3">
                    {event.category}
                  </Badge>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-luxury">
                    {event.title}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={isWishlisted ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-8">
                {event.description}
              </p>

              {/* Event Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{event.time} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{event.venue.name}</div>
                    <div className="text-sm text-muted-foreground">{event.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{event.spotsLeft} spots remaining out of {event.totalSpots}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-primary" />
                  <span>{event.rating} ({event.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Ticket Tiers */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Select Your Experience</h3>
                {event.ticketTiers.map((tier) => (
                  <div key={tier.id} className="card-luxury p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">{tier.name}</h4>
                        <p className="text-muted-foreground text-sm">{tier.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          €{tier.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tier.available} available
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {tier.perks.map((perk, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      onClick={() => handleBooking(tier.id)} 
                      className="w-full"
                      disabled={tier.available === 0}
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      {tier.available === 0 ? 'Sold Out' : 'Book Now'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="details" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="venue">Venue</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="card-luxury p-8">
                <h3 className="text-2xl font-bold mb-6">About This Event</h3>
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  {event.longDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="card-luxury p-8">
                <h3 className="text-2xl font-bold mb-6">Event Organizer</h3>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{event.organizer.name}</h4>
                    <p className="text-muted-foreground mb-4">{event.organizer.description}</p>
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <span>{event.organizer.rating} rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{event.organizer.eventsHosted} events hosted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="card-luxury p-8">
                <h3 className="text-2xl font-bold mb-6">Event Schedule</h3>
                <div className="space-y-4">
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-20 text-primary font-bold">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.activity}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="venue">
              <div className="card-luxury p-8">
                <h3 className="text-2xl font-bold mb-6">Venue Information</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold mb-2">{event.venue.name}</h4>
                    <p className="text-muted-foreground mb-4">{event.venue.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{event.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Capacity: {event.venue.capacity} guests</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold mb-3">Venue Amenities</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {event.venue.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive map coming soon</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="card-luxury p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold">Reviews & Ratings</h3>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary fill-current" />
                    <span className="font-bold text-lg">{event.rating}</span>
                    <span className="text-muted-foreground">({event.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {event.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{review.author}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-primary fill-current' : 'text-muted-foreground'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-6">
                  Load More Reviews
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetailPage;