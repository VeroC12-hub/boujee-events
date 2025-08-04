import React from 'react';
import { Calendar, MapPin, Users, Star, Heart, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ImageGallery from './ImageGallery';

interface VisualEventCardProps {
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
    type: string;
    image: string;
    images: string[];
    price: string;
    description: string;
    status: string;
    ticketsSold: number;
    maxCapacity: number;
    featured: boolean;
  };
  onBook?: (eventId: number) => void;
  onShare?: (eventId: number) => void;
  onLike?: (eventId: number) => void;
  size?: 'small' | 'medium' | 'large';
}

const VisualEventCard: React.FC<VisualEventCardProps> = ({ 
  event, 
  onBook, 
  onShare, 
  onLike,
  size = 'medium' 
}) => {
  const allImages = event.images && event.images.length > 0 
    ? event.images 
    : [event.image];

  const sizeClasses = {
    small: 'h-48',
    medium: 'h-64',
    large: 'h-80'
  };

  const occupancyPercentage = (event.ticketsSold / event.maxCapacity) * 100;

  return (
    <Card className="group overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <CardContent className="p-0">
        {/* Image Gallery */}
        <div className={`relative ${sizeClasses[size]}`}>
          <ImageGallery 
            images={allImages}
            title={event.title}
            className="h-full"
          />
          
          {/* Status Badge */}
          {event.featured && (
            <Badge className="absolute top-4 left-4 bg-yellow-500 text-black hover:bg-yellow-600">
              ⭐ Featured
            </Badge>
          )}

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="outline"
              className="bg-white/90 hover:bg-white h-8 w-8"
              onClick={() => onLike?.(event.id)}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="bg-white/90 hover:bg-white h-8 w-8"
              onClick={() => onShare?.(event.id)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Event Type Badge */}
          <Badge 
            variant="secondary" 
            className="absolute bottom-4 left-4 bg-black/70 text-white border-none"
          >
            {event.type}
          </Badge>

          {/* Capacity Indicator */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.ticketsSold}/{event.maxCapacity}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Location */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {event.location}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Capacity Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Booking Progress</span>
              <span>{Math.round(occupancyPercentage)}% filled</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  occupancyPercentage > 80 ? 'bg-red-500' :
                  occupancyPercentage > 60 ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">{event.price}</span>
              <span className="text-gray-500 text-sm ml-1">per person</span>
            </div>
            <Button 
              onClick={() => onBook?.(event.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualEventCard;