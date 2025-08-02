import React, { useState } from "react";
import { Menu, Search, Calendar, User } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-4">
            <img 
              src="/favicon.png" 
              alt="Boujee Events Logo" 
              className="h-12 w-auto logo-glow"
              onError={(e) => {
                console.log('Logo failed to load from /be-logo.png - Check if file exists in public folder');
                console.log('Tried paths: /be-logo.png, /be-logo.jpg, /be-logo.svg');
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'block';
              }}
              onLoad={() => {
                console.log('Logo loaded successfully from /be-logo.png');
              }}
            />
            {/* Fallback text logo (hidden by default) */}
            <div className="text-3xl font-bold text-luxury logo-glow" style={{display: 'none'}}>be</div>
            <div className="hidden md:block text-left leading-tight">
              <h1 className="text-lg font-semibold text-foreground">Boujee Events</h1>
              <p className="text-xs text-muted-foreground">Setting the new standard</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#events" className="text-foreground hover:text-primary transition-colors">
              Events
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
            <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-primary transition-colors hidden md:flex">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-primary transition-colors hidden md:flex">
              <Calendar className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </button>
            <button className="btn-luxury hidden md:flex px-6 py-2">
              Get Tickets
            </button>
            
            {/* Mobile Menu */}
            <button
              className="p-2 text-gray-400 hover:text-primary transition-colors lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-border/30 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <a 
                href="#events" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </a>
              <a 
                href="#about" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#testimonials" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <a 
                href="#contact" 
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <button className="btn-luxury w-full mt-4 py-3">
                Get Tickets
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
