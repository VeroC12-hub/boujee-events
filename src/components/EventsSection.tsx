import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, MapPin } from "lucide-react";
import EventCard from "./EventCard";
import TicketingModal from "./TicketingModal";

const EventsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isTicketingOpen, setIsTicketingOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const categories = [
    { id: "all", name: "All Events", count: 24 },
    { id: "music", name: "Music", count: 8 },
    { id: "nightlife", name: "Nightlife", count: 6 },
    { id: "luxury", name: "Luxury", count: 4 },
    { id: "festivals", name: "Festivals", count: 6 }
  ];

  const events = [
    {
      id: "1",
      title: "Euphoria Music Festival",
      subtitle: "3-Day Premium Music Experience",
      date: "June 15-17, 2024",
      time: "7:00 PM",
      venue: "Grand Amphitheater",
      location: "Budapest, Hungary",
      price: "$199",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
      category: "music",
      rating: 4.9,
      attendees: 12500,
      isVip: true,
      isPremium: true
    },
    {
      id: "2",
      title: "Golden Gala Night",
      subtitle: "Exclusive VIP Experience",
      date: "July 8, 2024",
      time: "8:00 PM",
      venue: "Luxury Ballroom",
      location: "Vienna, Austria",
      price: "$299",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
      category: "luxury",
      rating: 4.8,
      attendees: 800,
      isVip: true,
      isPremium: true
    },
    {
      id: "3",
      title: "Underground Beats",
      subtitle: "Electronic Music Underground",
      date: "June 22, 2024",
      time: "10:00 PM",
      venue: "Club Voltage",
      location: "Prague, Czech Republic",
      price: "$89",
      image: "https://images.unsplash.com/photo-1574391884720-bbc2f99d8c65?w=800&h=600&fit=crop",
      category: "nightlife",
      rating: 4.7,
      attendees: 1200,
      isVip: false,
      isPremium: false
    },
    {
      id: "4",
      title: "Summer Solstice Festival",
      subtitle: "Multi-Genre Summer Celebration",
      date: "June 29-30, 2024",
      time: "2:00 PM",
      venue: "Central Park",
      location: "Bratislava, Slovakia",
      price: "$149",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      category: "festivals",
      rating: 4.6,
      attendees: 8500,
      isVip: true,
      isPremium: false
    },
    {
      id: "5",
      title: "Jazz & Wine Evening",
      subtitle: "Sophisticated Musical Experience",
      date: "July 12, 2024",
      time: "7:30 PM",
      venue: "Rooftop Terrace",
      location: "Budapest, Hungary",
      price: "$120",
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop",
      category: "music",
      rating: 4.8,
      attendees: 350,
      isVip: true,
      isPremium: true
    },
    {
      id: "6",
      title: "Neon Nights",
      subtitle: "Futuristic Party Experience",
      date: "July 5, 2024",
      time: "11:00 PM",
      venue: "Cyber Club",
      location: "Warsaw, Poland",
      price: "$75",
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=600&fit=crop",
      category: "nightlife",
      rating: 4.5,
      attendees: 950,
      isVip: false,
      isPremium: false
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openTicketing = (event: any) => {
    setSelectedEvent(event);
    setIsTicketingOpen(true);
  };

  return (
    <section id="events" className="py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Discover <span className="text-luxury">Premium Events</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated selection of luxury experiences, exclusive performances, and unforgettable moments
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, locations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 ${
                    selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-primary/10"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>

            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {filteredEvents.map((event, index) => (
            <div 
              key={event.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openTicketing(event)}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button className="btn-luxury">
            <Calendar className="mr-2 h-5 w-5" />
            Load More Events
          </Button>
        </div>

        {/* Ticketing Modal */}
        {selectedEvent && (
          <TicketingModal
            isOpen={isTicketingOpen}
            onClose={() => setIsTicketingOpen(false)}
            event={selectedEvent}
          />
        )}
      </div>
    </section>
  );
};

export default EventsSection;