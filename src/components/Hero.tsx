import { Button } from "@/components/ui/button";
import { Play, Calendar, MapPin, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Logo Integration */}
        <div className="mb-8 animate-fade-in">
          <div className="text-8xl md:text-9xl font-bold text-luxury mb-4 animate-gold-glow">
            be
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">
            Boujee Events
          </h1>
          <p className="text-xl md:text-2xl text-accent font-light tracking-wide">
            Setting the new standard
          </p>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
            Experience Luxury Events
            <span className="text-luxury"> Like Never Before</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            From exclusive VIP experiences to world-class entertainment, 
            discover events that redefine luxury and create unforgettable memories.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button className="btn-luxury text-lg px-8 py-6">
              <Calendar className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary/10">
              <Play className="mr-2 h-5 w-5" />
              Watch Preview
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="card-luxury text-center animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl font-bold text-luxury mb-2">50+</div>
              <p className="text-muted-foreground">Premium Events</p>
            </div>
            <div className="card-luxury text-center animate-scale-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-3xl font-bold text-luxury mb-2">100K+</div>
              <p className="text-muted-foreground">VIP Experiences</p>
            </div>
            <div className="card-luxury text-center animate-scale-in" style={{ animationDelay: '1s' }}>
              <div className="text-3xl font-bold text-luxury mb-2">25+</div>
              <p className="text-muted-foreground">Luxury Venues</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-primary rounded-full p-1">
            <div className="w-1 h-3 bg-primary rounded-full mx-auto animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;