// src/pages/ContactPage.tsx
import React, { useState } from 'react';
import { PublicNavbar } from '../components/navigation/PublicNavbar';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    budget: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate form submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        eventType: '',
        eventDate: '',
        budget: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      color: 'text-green-400'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['hello@boujeeevents.com', 'info@boujeeevents.com'],
      color: 'text-blue-400'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: ['123 Luxury Avenue', 'Beverly Hills, CA 90210'],
      color: 'text-red-400'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Mon - Fri: 9AM - 7PM', 'Sat - Sun: 10AM - 4PM'],
      color: 'text-yellow-400'
    }
  ];

  const eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday Party',
    'Anniversary',
    'Festival',
    'Gala',
    'Conference',
    'Product Launch',
    'Charity Event',
    'Other'
  ];

  const budgetRanges = [
    'Under $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000 - $250,000',
    '$250,000+'
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get In <span className="text-yellow-400">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Ready to create something extraordinary? Let's discuss your vision 
            and bring your dream event to life
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center hover:border-yellow-400 transition-colors">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-800 p-3 rounded-full">
                    <info.icon className={`h-6 w-6 ${info.color}`} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {info.title}
                </h3>
                <div className="space-y-1">
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-300 text-sm">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">
                Let's Plan Your Event
              </h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <p className="text-green-400 font-medium">
                    Thank you! We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <p className="text-red-400 font-medium">
                    Something went wrong. Please try again.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Event Type *
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
                    >
                      <option value="">Select budget range</option>
                      {budgetRanges.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Tell us about your event *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                    placeholder="Describe your vision, requirements, and any special details..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Visit Our Office
                </h3>
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center text-gray-400">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Interactive Map Coming Soon</p>
                    </div>
                  </div>
                  <div className="text-gray-300">
                    <h4 className="text-white font-semibold mb-2">Boujee Events Headquarters</h4>
                    <p className="mb-1">123 Luxury Avenue</p>
                    <p className="mb-4">Beverly Hills, CA 90210</p>
                    <p className="text-sm">
                      Located in the heart of Beverly Hills, our office is designed to 
                      inspire and showcase the luxury experiences we create.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-400/10 to-blue-500/10 rounded-xl p-8 border border-yellow-400/20">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-6 w-6 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">
                    Quick Response Guarantee
                  </h3>
                </div>
                <p className="text-gray-300 mb-4">
                  We understand that planning exceptional events requires timely communication. 
                  That's why we guarantee a response within 24 hours of receiving your inquiry.
                </p>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Emergency support available 24/7
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Free initial consultation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Personalized event planning
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "How far in advance should I book my event?",
                answer: "We recommend booking 3-6 months in advance for optimal venue selection and planning time. However, we can accommodate shorter timelines when needed."
              },
              {
                question: "Do you handle events outside of California?",
                answer: "Yes! We organize luxury events worldwide. Travel and accommodation costs are included in our planning packages for destination events."
              },
              {
                question: "What's included in your event planning services?",
                answer: "Our full-service packages include venue selection, vendor coordination, design and decor, timeline management, and day-of coordination."
              },
              {
                question: "Can I see examples of your previous work?",
                answer: "Absolutely! Check out our gallery page to see photos and videos from recent events, or schedule a consultation to view our complete portfolio."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
