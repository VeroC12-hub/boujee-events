import { Button } from "@/components/ui/button";
import { Menu, Search, Calendar, User } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-luxury">be</div>
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-foreground">Boujee Events</h1>
              <p className="text-xs text-muted-foreground">Setting the new standard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#events" className="text-foreground hover:text-primary transition-colors">
              Events
            </a>
            <a href="#artists" className="text-foreground hover:text-primary transition-colors">
              Artists
            </a>
            <a href="#venues" className="text-foreground hover:text-primary transition-colors">
              Venues
            </a>
            <a href="#vip" className="text-foreground hover:text-primary transition-colors">
              VIP
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Calendar className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button className="btn-luxury hidden md:flex">
              Get Tickets
            </Button>
            
            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-border/30">
            <div className="flex flex-col space-y-4">
              <a href="#events" className="text-foreground hover:text-primary transition-colors">
                Events
              </a>
              <a href="#artists" className="text-foreground hover:text-primary transition-colors">
                Artists
              </a>
              <a href="#venues" className="text-foreground hover:text-primary transition-colors">
                Venues
              </a>
              <a href="#vip" className="text-foreground hover:text-primary transition-colors">
                VIP
              </a>
              <Button className="btn-luxury w-full mt-4">
                Get Tickets
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;