import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Star, Heart, Share2, Users, Clock, 
  Ticket, ArrowLeft, Play, Download, MessageCircle, Send,
  ThumbsUp, Flag, ExternalLink, Navigation, Phone, Mail,
  CreditCard, Shield, CheckCircle, Gift, UserPlus
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface EventDetailProps {
  eventId?: string;
}

const EventDetail: React.FC<EventDetailProps> = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showComments, setShowComments] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Mock event data - replace with API call
  const event = {
    id: eventId || '1',
    title: "Budapest Summer Music Festival 2025",
    category: "Festival",
    shortDescription: "Three days of non-stop music featuring international and local artists",
    fullDescription: "Experience the magic of Budapest Summer Music Festival, featuring over 50 international and local artists across 5 stages. From electronic beats to acoustic sessions, immerse yourself in a weekend of unforgettable performances against the stunning backdrop of the Danube River.",
    date: "August 15-17, 2025",
    startTime: "16:00",
    endTime: "02:00",
    location: "Sziget Island, Budapest",
    venue: {
      name: "Sziget Festival Grounds",
      address: "Óbudai-sziget, 1033 Budapest, Hungary",
      capacity: 95000,
      amenities: ["Food Courts", "VIP Areas", "Camping", "ATMs", "Medical Center"],
      coordinates: { lat: 47.5316, lng: 19.0728 }
    },
    images: [
      "/api/placeholder/800/400",
      "/api/placeholder/800/400",
      "/api/placeholder/800/400",
      "/api/placeholder/800/400"
    ],
    video: "/api/placeholder/video.mp4",
    rating: 4.8,
    totalRatings: 1247,
    attendees: 12500,
    likes: 2341,
    organizer: {
      name: "Boujee Events Ltd.",
      avatar: "/api/placeholder/60/60",
      verified: true,
      rating: 4.9,
      eventsOrganized: 127
    },
    ticketTypes: [
      {
        id: 'early-bird',
        name: 'Early Bird',
        price: 89,
        originalPrice: 120,
        description: 'Limited time offer - Save 25%',
        available: 234,
        perks: ['All 3 days access', 'Welcome drink', 'Digital program'],
        groupDiscount: { min: 5, discount: 10 } // 10% off for 5+ tickets
      },
      {
        id: 'general',
        name: 'General Admission',
        price: 120,
        description: 'Full festival access',
        available: 1567,
        perks: ['All 3 days access', 'Digital program'],
        groupDiscount: { min: 10, discount: 15 }
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 299,
        description: 'Premium experience with exclusive perks',
        available: 89,
        perks: ['All 3 days access', 'VIP viewing areas', 'Complimentary drinks', 'Artist meet & greet', 'Premium toilets', 'Fast track entry'],
        groupDiscount: { min: 3, discount: 5 }
      },
      {
        id: 'backstage',
        name: 'Backstage Pass',
        price: 599,
        description: 'Ultimate festival experience',
        available: 12,
        perks: ['All VIP perks', 'Backstage access', 'Photo with headliners', 'Exclusive merchandise', 'Private transport'],
        groupDiscount: null // No group discount for premium tier
      }
    ],
    schedule: [
      {
        day: 1,
        date: "August 15, 2025",
        stages: [
          {
            name: "Main Stage",
            performances: [
              { time: "16:00", artist: "DJ Kálmán", genre: "Electronic" },
              { time: "18:00", artist: "Budapest Symphony", genre: "Classical" },
              { time: "20:30", artist: "Magna Cum Laude", genre: "Rock" },
              { time: "23:00", artist: "Martin Garrix", genre: "EDM" }
            ]
          },
          {
            name: "Acoustic Stage",
            performances: [
              { time: "17:00", artist: "Zséda", genre: "Pop" },
              { time: "19:00", artist: "Ákos", genre: "Alternative" },
              { time: "21:00", artist: "Hobo Blues Band", genre: "Blues" }
            ]
          }
        ]
      },
      {
        day: 2,
        date: "August 16, 2025",
        stages: [
          {
            name: "Main Stage",
            performances: [
              { time: "16:00", artist: "Local Talent Showcase", genre: "Various" },
              { time: "19:00", artist: "Tankcsapda", genre: "Metal" },
              { time: "22:00", artist: "Calvin Harris", genre: "EDM" }
            ]
          }
        ]
      }
    ],
    tags: ["Music", "Outdoor", "Multi-day", "International", "Food & Drinks"],
    ageRestriction: "16+",
    dresscode: "Casual/Festival wear",
    weather: { forecast: "Sunny, 28°C", indoor: false },
    accessibility: ["Wheelchair accessible", "Sign language interpreter", "Hearing loops"],
    parking: { available: true, price: "€5/day", spaces: 2000 },
    publicTransport: ["Metro Line 3 (Árpád híd)", "Bus 34, 106", "Special festival shuttles"]
  };

  const [comments, setComments] = useState([
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      rating: 5,
      text: "Absolutely incredible experience! The lineup was amazing and the organization was flawless. Can't wait for next year!",
      likes: 23,
      replies: 3,
      date: "2024-08-20",
      helpful: true
    },
    {
      id: 2,
      user: {
        name: "Marcus Weber",
        avatar: "/api/placeholder/40/40",
        verified: false
      },
      rating: 4,
      text: "Great festival overall. Sound quality was excellent, but the food was a bit overpriced. Still worth it!",
      likes: 15,
      replies: 1,
      date: "2024-08-19",
      helpful: true
    }
  ]);

  const selectedTicket = event.ticketTypes.find(t => t.id === selectedTicketType);
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;
  const groupDiscount = selectedTicket?.groupDiscount && quantity >= selectedTicket.groupDiscount.min 
    ? (totalPrice * selectedTicket.groupDiscount.discount) / 100 
    : 0;
  const finalPrice = totalPrice - groupDiscount;

  const handleTicketPurchase = () => {
    if (!selectedTicket) return;
    setShowPayment(true);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: comments.length + 1,
      user: {
        name: "Current User", // Replace with actual user
        avatar: "/api/placeholder/40/40",
        verified: false
      },
      rating: userRating,
      text: newComment,
      likes: 0,
      replies: 0,
      date: new Date().toISOString().split('T')[0],
      helpful: false
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
    setUserRating(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </button>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center px-4 py-2 rounded-lg ${isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </button>
            
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={event.images[0]} 
                  alt={event.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      {event.category}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      {event.ageRestriction}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {event.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {event.startTime} - {event.endTime}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </span>
                  </div>
                </div>
                
                {/* Play Video Button */}
                <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
                  <Play className="h-8 w-8 text-white ml-1" />
                </button>
              </div>
              
              {/* Event Stats */}
              <div className="p-6 border-b">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-xl font-bold">{event.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">{event.totalRatings} reviews</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-5 w-5 text-blue-500 mr-1" />
                      <span className="text-xl font-bold">{event.attendees.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">attending</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="h-5 w-5 text-red-500 mr-1" />
                      <span className="text-xl font-bold">{event.likes}</span>
                    </div>
                    <p className="text-sm text-gray-600">likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageCircle className="h-5 w-5 text-green-500 mr-1" />
                      <span className="text-xl font-bold">{comments.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">comments</p>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{event.fullDescription}</p>
                
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Event Schedule</h2>
              
              <div className="space-y-6">
                {event.schedule.map((day) => (
                  <div key={day.day} className="border-l-4 border-amber-500 pl-6">
                    <h3 className="text-lg font-semibold mb-4">Day {day.day} - {day.date}</h3>
                    
                    {day.stages.map((stage, stageIndex) => (
                      <div key={stageIndex} className="mb-6">
                        <h4 className="font-medium text-amber-600 mb-3">{stage.name}</h4>
                        <div className="grid gap-3">
                          {stage.performances.map((performance, perfIndex) => (
                            <div key={perfIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <span className="font-mono text-sm bg-white px-2 py-1 rounded">
                                  {performance.time}
                                </span>
                                <div>
                                  <p className="font-medium">{performance.artist}</p>
                                  <p className="text-sm text-gray-600">{performance.genre}</p>
                                </div>
                              </div>
                              <button className="text-amber-600 hover:text-amber-700">
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Venue & Location</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{event.venue.name}</h3>
                  <p className="text-gray-600 mb-4">{event.venue.address}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">Capacity: {event.venue.capacity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">GPS: {event.venue.coordinates.lat}, {event.venue.coordinates.lng}</span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.venue.amenities.map((amenity, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-gray-500">Interactive Map</p>
                  {/* Replace with actual map component */}
                </div>
              </div>
              
              {/* Transportation */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Getting There</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Public Transport</h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {event.publicTransport.map((transport, index) => (
                        <li key={index}>• {transport}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Parking</h5>
                    <p className="text-sm text-gray-600">
                      {event.parking.spaces} spaces available at {event.parking.price}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments & Ratings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Reviews & Comments</h2>
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  {showComments ? 'Hide' : 'Show'} Comments
                </button>
              </div>
              
              {/* Add Comment */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-3">Leave a Review</h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-600">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`text-xl ${star <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                
                {/* Comment Text */}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  rows={3}
                />
                
                <button 
                  onClick={handleCommentSubmit}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </button>
              </div>
              
              {/* Comments List */}
              {showComments && (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={comment.user.avatar} 
                          alt={comment.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{comment.user.name}</span>
                            {comment.user.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                            <div className="flex">
                              {[...Array(comment.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{comment.date}</span>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.text}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <button className="flex items-center hover:text-gray-700">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {comment.likes}
                            </button>
                            <button className="hover:text-gray-700">Reply</button>
                            <button className="hover:text-gray-700">
                              <Flag className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Ticket Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Ticket Selection */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6">Select Tickets</h2>
                
                <div className="space-y-4 mb-6">
                  {event.ticketTypes.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTicketType === ticket.id 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTicketType(ticket.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{ticket.name}</h3>
                          <p className="text-sm text-gray-600">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {ticket.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                €{ticket.originalPrice}
                              </span>
                            )}
                            <span className="text-xl font-bold text-amber-600">
                              €{ticket.price}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{ticket.available} left</p>
                        </div>
                      </div>
                      
                      {/* Perks */}
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                          {ticket.perks.slice(0, 2).map((perk, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {perk}
                            </span>
                          ))}
                          {ticket.perks.length > 2 && (
                            <span className="text-xs text-gray-500">+{ticket.perks.length - 2} more</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Group Discount */}
                      {ticket.groupDiscount && (
                        <div className="text-xs text-green-600">
                          <Gift className="h-3 w-3 inline mr-1" />
                          {ticket.groupDiscount.discount}% off for {ticket.groupDiscount.min}+ tickets
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Quantity Selection */}
                {selectedTicket && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(selectedTicket.available, quantity + 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Group Discount Info */}
                    {selectedTicket.groupDiscount && quantity >= selectedTicket.groupDiscount.min && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        <Gift className="h-4 w-4 inline mr-1" />
                        Group discount applied: -{selectedTicket.groupDiscount.discount}%
                      </div>
                    )}
                  </div>
                )}
                
                {/* Price Summary */}
                {selectedTicket && (
                  <div className="border-t pt-4 mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{selectedTicket.name} x {quantity}</span>
                        <span>€{totalPrice}</span>
                      </div>
                      {groupDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Group discount</span>
                          <span>-€{groupDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-amber-600">€{finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Purchase Button */}
                <button 
                  onClick={handleTicketPurchase}
                  disabled={!selectedTicket}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-4 rounded-lg font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Buy Tickets - €{finalPrice.toFixed(2)}
                </button>
                
                <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure payment powered by Stripe
                </div>
              </div>
              
              {/* Organizer Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold mb-4">Event Organizer</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={event.organizer.avatar} 
                    alt={event.organizer.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{event.organizer.name}</span>
                      {event.organizer.verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {event.organizer.rating} • {event.organizer.eventsOrganized} events
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Organizer
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow Organizer
                  </button>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold mb-4">Event Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dress Code</span>
                    <span>{event.dresscode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weather</span>
                    <span>{event.weather.forecast}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age Limit</span>
                    <span>{event.ageRestriction}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Accessibility</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {event.accessibility.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Complete Purchase</h2>
              <button 
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedTicket?.name} x {quantity}</span>
                  <span>€{finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="border border-gray-300 rounded-lg p-3 hover:border-blue-500 text-center">
                  💳 Card
                </button>
                <button className="border border-gray-300 rounded-lg p-3 hover:border-blue-500 text-center">
                  📱 PayPal
                </button>
                <button className="border border-gray-300 rounded-lg p-3 hover:border-blue-500 text-center">
                  🏦 Barion
                </button>
                <button className="border border-gray-300 rounded-lg p-3 hover:border-blue-500 text-center">
                  📲 Apple Pay
                </button>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-4 rounded-lg font-semibold">
              Pay €{finalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
