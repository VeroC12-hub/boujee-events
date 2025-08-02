import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Star } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    price: string;
    image: string;
    category: string;
    rating: number;
    attendees: number;
    isVip: boolean;
    isPremium: boolean;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="card-luxury group hover:scale-105 transition-all duration-500 overflow-hidden">
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
          {event.isPremium && (
            <Badge className="bg-accent text-accent-foreground">
              Premium
            </Badge>
          )}
          {event.isVip && (
            <Badge className="bg-destructive text-destructive-foreground">
              VIP Available
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 flex items-center bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-white text-sm ml-1">{event.rating}</span>
        </div>

        {/* Price */}
        <div className="absolute bottom-4 right-4">
          <div className="text-white font-bold text-xl">
            From <span className="text-primary">{event.price}</span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-muted-foreground">{event.subtitle}</p>
        </div>

        {/* Event Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            {event.date}
            <Clock className="h-4 w-4 ml-4 mr-2 text-primary" />
            {event.time}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            {event.venue}, {event.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-primary" />
            {event.attendees.toLocaleString()} attending
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button className="btn-luxury flex-1">
            Get Tickets
          </Button>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;