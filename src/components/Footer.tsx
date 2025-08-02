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
  Calendar
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

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#events" className="text-muted-foreground hover:text-primary transition-colors">Browse Events</a></li>
              <li><a href="#artists" className="text-muted-foreground hover:text-primary transition-colors">Featured Artists</a></li>
              <li><a href="#venues" className="text-muted-foreground hover:text-primary transition-colors">Premium Venues</a></li>
              <li><a href="#vip" className="text-muted-foreground hover:text-primary transition-colors">VIP Experiences</a></li>
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Stay Updated</h4>
            <p className="text-muted-foreground mb-4">
              Get exclusive access to presales and luxury event announcements.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Enter your email" 
                className="bg-input border-border"
              />
              <Button className="btn-luxury w-full">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Headquarters</p>
              <p className="text-sm text-muted-foreground">Budapest, Hungary</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">24/7 Support</p>
              <p className="text-sm text-muted-foreground">+36 1 234 5678</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Event Planning</p>
              <p className="text-sm text-muted-foreground">events@boujeevents.com</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Boujee Events Hungary. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;