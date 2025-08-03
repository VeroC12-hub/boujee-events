import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Shield
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/30 pt-16 pb-8">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl font-bold text-luxury">be</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Boujee Events</h3>
                <p className="text-sm text-muted-foreground">Setting the new standard</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Creating unforgettable luxury experiences across Europe. 
              From exclusive VIP events to world-class entertainment.
            </p>
            
            {/* Premium Badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span>Premium & Secure</span>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <Button variant="outline" size="icon" className="border-primary hover:bg-primary/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-primary hover:bg-primary/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-primary hover:bg-primary/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-primary hover:bg-primary/10">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">VIP Events</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Corporate Galas</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Private Parties</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Yacht Experiences</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Premium Venues</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Press</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Concierge</a></li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                <span>hello@boujeeevents.com</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                <span>+36 1 234 5678</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>Budapest, Hungary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-border/30 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold text-foreground mb-2">Stay Updated</h4>
            <p className="text-muted-foreground mb-4">Get exclusive event invitations and updates</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-background border-border"
              />
              <Button className="bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <Separator className="my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">
            © 2025 Boujee Events by VeroC12-hub. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>Made with ❤️ in Hungary</span>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
