import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Crown, Gift, Sparkles, Calendar, MapPin, Clock } from "lucide-react";
import { useState } from "react";

interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  maxPerOrder: number;
  available: number;
  icon: React.ReactNode;
  color: string;
}

interface TicketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    date: string;
    time: string;
    venue: string;
    location: string;
  };
}

const TicketingModal = ({ isOpen, onClose, event }: TicketingModalProps) => {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  const ticketTiers: TicketTier[] = [
    {
      id: "general",
      name: "General Admission",
      price: 89,
      description: "Access to main event area",
      features: ["Main event access", "Basic amenities", "Standard entry"],
      maxPerOrder: 6,
      available: 450,
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-secondary"
    },
    {
      id: "premium",
      name: "Premium Experience",
      price: 199,
      description: "Enhanced experience with premium perks",
      features: ["Premium viewing area", "Complimentary drinks", "Fast track entry", "Premium restrooms"],
      maxPerOrder: 4,
      available: 150,
      icon: <Sparkles className="h-5 w-5" />,
      color: "bg-accent"
    },
    {
      id: "vip",
      name: "VIP Luxury",
      price: 399,
      description: "Ultimate luxury experience",
      features: ["VIP lounge access", "Meet & greet opportunities", "Luxury transportation", "Gourmet catering", "Dedicated concierge"],
      maxPerOrder: 2,
      available: 50,
      icon: <Crown className="h-5 w-5" />,
      color: "bg-primary"
    }
  ];

  const updateTicketCount = (tierId: string, change: number) => {
    setSelectedTickets(prev => {
      const current = prev[tierId] || 0;
      const tier = ticketTiers.find(t => t.id === tierId);
      const newCount = Math.max(0, Math.min(current + change, tier?.maxPerOrder || 0));
      
      if (newCount === 0) {
        const { [tierId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [tierId]: newCount };
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [tierId, count]) => {
    const tier = ticketTiers.find(t => t.id === tierId);
    return sum + (tier?.price || 0) * count;
  }, 0);

  const fees = totalPrice * 0.12; // 12% fees
  const finalTotal = totalPrice + fees;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-luxury">Select Your Tickets</DialogTitle>
        </DialogHeader>

        {/* Event Info */}
        <div className="card-luxury mb-6">
          <h3 className="text-xl font-bold text-foreground mb-4">{event.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {event.date}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {event.venue}
            </div>
          </div>
        </div>

        {/* Ticket Tiers */}
        <div className="space-y-4 mb-6">
          {ticketTiers.map((tier) => {
            const selectedCount = selectedTickets[tier.id] || 0;
            
            return (
              <div key={tier.id} className="card-luxury">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${tier.color}`}>
                        {tier.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{tier.name}</h4>
                        <p className="text-muted-foreground">{tier.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${tier.price}</div>
                        <div className="text-sm text-muted-foreground">{tier.available} left</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {tier.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateTicketCount(tier.id, -1)}
                      disabled={selectedCount === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{selectedCount}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateTicketCount(tier.id, 1)}
                      disabled={selectedCount >= tier.maxPerOrder}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        {totalTickets > 0 && (
          <div className="card-luxury">
            <h4 className="text-lg font-bold text-foreground mb-4">Order Summary</h4>
            
            <div className="space-y-2 mb-4">
              {Object.entries(selectedTickets).map(([tierId, count]) => {
                const tier = ticketTiers.find(t => t.id === tierId);
                if (!tier || count === 0) return null;
                
                return (
                  <div key={tierId} className="flex justify-between">
                    <span>{tier.name} x {count}</span>
                    <span>${(tier.price * count).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service fees (12%)</span>
                <span>${fees.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button className="btn-luxury w-full mt-6" size="lg">
              <Gift className="mr-2 h-5 w-5" />
              Proceed to Checkout
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketingModal;