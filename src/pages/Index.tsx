import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import EventsShowcase from "../components/EventsShowcase";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import { Star, Crown, Sparkles, Users, MapPin, Calendar, ArrowRight, Play, Volume2 } from "lucide-react";

// Premium Features Section
const PremiumFeatures = () => {
  const features = [
    {
      icon: <Crown className="w-8 h-8 text-primary" />,
      title: "Exclusive VIP Access",
      description: "Curated experiences for discerning guests with unparalleled luxury and sophistication."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Bespoke Event Planning",
      description: "Tailored experiences crafted to perfection, from intimate gatherings to grand celebrations."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Elite Network",
      description: "Connect with like-minded individuals in an exclusive community of luxury event enthusiasts."
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Premium Experience
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Redefining <span className="text-luxury">Luxury Events</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We don't just organize events—we create transformative experiences that leave lasting impressions and forge meaningful connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="card-luxury group hover:scale-105 transition-all duration-500 text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Alexandra Chen",
      role: "CEO, Luxury Brands International",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      content: "Boujee Events transformed our corporate gala into an unforgettable experience. The attention to detail and luxury service exceeded all expectations.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Entertainment Mogul",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      content: "Working with Boujee Events was seamless. They understood our vision and delivered a world-class event that our guests are still talking about.",
      rating: 5
    },
    {
      name: "Sofia Dubois",
      role: "Fashion Industry Executive",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      content: "The team's expertise in luxury event curation is unmatched. Every detail was perfect, from the venue to the final farewell.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by <span className="text-luxury">Industry Leaders</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it—hear from the visionaries who've experienced the Boujee difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="card-luxury group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                />
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Statistics Section
const StatsSection = () => {
  const stats = [
    { number: "500+", label: "Exclusive Events", description: "Curated luxury experiences" },
    { number: "50K+", label: "VIP Members", description: "Elite community worldwide" },
    { number: "98%", label: "Satisfaction Rate", description: "Exceeding expectations" },
    { number: "25+", label: "Global Cities", description: "Premium venues worldwide" }
  ];

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-4xl md:text-5xl font-bold text-luxury mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-400">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Call to Action Section
const CTASection = () => {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Experience <span className="text-luxury">Excellence?</span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join the elite circle of discerning individuals who demand nothing but the finest in luxury event experiences.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="btn-luxury group relative overflow-hidden px-8 py-4 text-lg">
            <span className="relative z-10 flex items-center gap-2">
              Become a Member
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
          
          <button className="px-8 py-4 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 font-semibold text-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            Watch Our Story
          </button>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Exclusive Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-200" />
            <span>No Setup Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400" />
            <span>24/7 Concierge</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function IndexPage() {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <Hero />
      <PremiumFeatures />
      <EventsShowcase />
      <StatsSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
