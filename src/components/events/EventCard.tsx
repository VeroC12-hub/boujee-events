// src/components/events/EventCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Star,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Event } from '@/types/events';
import { EventStatusBadge } from './EventStatusBadge';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onStatusChange?: (event: Event, status: Event['status']) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  showActions = false,
  onEdit,
  onDelete,
  onStatusChange,
  className = ''
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    if (price === 0) return 'FREE';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const capacityPercentage = (event.current_attendees / event.capacity) * 100;

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}>
      {/* Image Header */}
      <div 
        className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 relative overflow-hidden"
        onClick={() => navigate(`/events/${event.id}`)}
      >
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <EventStatusBadge status={event.status} size="sm" />
          {event.featured && (
            <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(event)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Event
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onStatusChange && event.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onStatusChange(event, 'published')}>
                    Publish
                  </DropdownMenuItem>
                )}
                {onStatusChange && event.status === 'published' && (
                  <DropdownMenuItem onClick={() => onStatusChange(event, 'draft')}>
                    Unpublish
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(event)}
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and Category */}
        <div className="space-y-2">
          <h3 
            className="font-semibold text-lg line-clamp-2 hover:text-purple-600 transition-colors"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            {event.title}
          </h3>
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
        </div>

        {/* Description */}
        {event.short_description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {event.short_description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.event_date)} at {event.event_time}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.venue}, {event.location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{event.current_attendees} / {event.capacity}</span>
            </div>
            
            <div className="flex items-center gap-1 font-semibold text-lg">
              <DollarSign className="h-4 w-4" />
              {formatPrice(event.price, event.currency)}
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(capacityPercentage)}% filled</span>
            <span>{event.capacity - event.current_attendees} spots left</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {event.status === 'published' && event.current_attendees < event.capacity ? (
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={() => navigate(`/events/${event.id}/book`)}
            >
              Book Now
            </Button>
          ) : event.status === 'published' && event.current_attendees >= event.capacity ? (
            <Button variant="outline" disabled className="w-full">
              Event Full
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
