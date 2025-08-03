import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Star, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location: string;
    address?: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    spotsLeft: number;
    totalSpots?: number;
    organizer?: string;
  };
  viewMode?: 'grid' | 'list';
}

const EventCard = ({ event, viewMode = 'grid' }: EventCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleEventClick = () => {
    navigate(`/events/${event.id}`);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${event.id}`);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="card-luxury group hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={handleEventClick}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Event Image */}
          <div className="relative md:w-80 h-48 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {event.category}
              </Badge>
            </div>
          </div>

          {/* Event Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 truncate">
                  {event.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {event.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-primary">
                  €{event.price}
                </div>
                <div className="text-sm text-muted-foreground">
                  per person
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">
                  {formatDate(event.date)} {event.time && `at ${event.time}`}
                </span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm truncate">{event.location}</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Star className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{event.rating} rating</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{event.spotsLeft} spots left</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleBookClick}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Ticket className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div 
      className="card-luxury group hover:scale-105 transition-all duration-500 overflow-hidden cursor-pointer"
      onClick={handleEventClick}
    >
      {/* Event Image */}
      <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            {event.category}
          </Badge>
        </div>

        {/* Price */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg">
          <span className="font-bold text-lg">€{event.price}</span>
        </div>

        {/* Rating & Spots */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 text-white">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span className="text-sm font-medium">{event.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">{event.spotsLeft} left</span>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
            {event.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {formatDate(event.date)} {event.time && `at ${event.time}`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm truncate">{event.location}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Button
            onClick={handleBookClick}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Ticket className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;