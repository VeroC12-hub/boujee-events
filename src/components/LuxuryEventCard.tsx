import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Star, Sparkles, Crown, Diamond, Zap, ChevronRight, Heart, Share2 } from 'lucide-react';

interface EventTier {
  name: string;
  price: string;
  perks: string[];
  available: number;
  icon: React.ReactNode;
  color: string;
}

interface LuxuryEventCardProps {
  event: {
    id: string;
    title: string;
    category: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    image: string;
    description: string;
    lineup?: string[];
    tiers: EventTier[];
    exclusive: boolean;
    soldOut: boolean;
  };
}

const LuxuryEventCard = ({ event }: LuxuryEventCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const tierIcons = {
    general: <Zap className="w-5 h-5" />,
    vip: <Crown className="w-5 h-5" />,
    platinum: <Diamond className="w-5 h-5" />
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative w-full h-[600px] transition-all duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transform: `rotateY(${isFlipped ? 180 : 0}deg) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="card-luxury h-full overflow-hidden group">
            {/* Image Section */}
            <div className="relative h-72 -m-6 mb-6">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              {/* Exclusive Badge */}
              {event.exclusive && (
                <div className="absolute top-4 left-4 glass-effect px-3 py-1 rounded-full flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-white">Exclusive</span>
                </div>
              )}

              {/* Category */}
              <div className="absolute top-4 right-4 bg-primary text-black px-3 py-1 rounded-full text-xs font-semibold">
                {event.category}
              </div>

              {/* Quick Actions */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className={`p-2 glass-effect rounded-full transition-all duration-300 ${
                    isLiked ? 'text-red-500 scale-110' : 'text-white hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 glass-effect rounded-full text-white hover:text-primary transition-colors duration-300"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                <p className="text-gray-300 text-sm">{event.description}</p>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-primary" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-primary" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-gray-300 col-span-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {event.venue}, {event.location}
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-400">Select Experience</span>
                  <span className="text-xs text-primary">Tap card for details</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {event.tiers.map((tier, index) => (
                    <button
                      key={tier.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTier(index);
                      }}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        selectedTier === index 
                          ? `border-primary ${tier.color} text-black` 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {tier.icon}
                        <span className="text-xs font-semibold">{tier.name}</span>
                        <span className="text-xs opacity-75">{tier.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={(e) => e.stopPropagation()}
                className={`w-full btn-luxury flex items-center justify-center gap-2 ${
                  event.soldOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={event.soldOut}
              >
                {event.soldOut ? 'Sold Out' : 'Reserve Now'}
                {!event.soldOut && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute w-full h-full rotate-y-180 backface-hidden">
          <div className="card-luxury h-full overflow-y-auto">
            <h4 className="text-xl font-bold text-primary mb-4">Event Details</h4>
            
            {/* Lineup */}
            {event.lineup && (
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-400 mb-2">Featured Artists</h5>
                <div className="space-y-2">
                  {event.lineup.map((artist, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-gray-300">{artist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tier Details */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-400">Experience Tiers</h5>
              {event.tiers.map((tier, index) => (
                <div 
                  key={tier.name}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    selectedTier === index 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tier.icon}
                      <span className="font-semibold text-white">{tier.name}</span>
                    </div>
                    <span className="text-primary font-bold">{tier.price}</span>
                  </div>
                  <ul className="space-y-1">
                    {tier.perks.map((perk, perkIndex) => (
                      <li key={perkIndex} className="text-xs text-gray-400 flex items-start gap-1">
                        <span className="text-primary">•</span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs text-gray-500">
                    {tier.available} spots remaining
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="mt-6 w-full btn-luxury"
            >
              Book {event.tiers[selectedTier].name} Experience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryEventCard;
