// src/pages/AboutPage.tsx
import React from 'react';
import { PublicNavbar } from '../components/navigation/PublicNavbar';
import { Star, Award, Users, Globe, Calendar, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  const stats = [
    { icon: Calendar, label: 'Events Organized', value: '500+', color: 'text-yellow-400' },
    { icon: Users, label: 'Happy Clients', value: '10,000+', color: 'text-blue-400' },
    { icon: Globe, label: 'Cities Worldwide', value: '25+', color: 'text-green-400' },
    { icon: Award, label: 'Awards Won', value: '15+', color: 'text-purple-400' }
  ];

  const teamMembers = [
    {
      name: 'Alexandra Chen',
      role: 'Founder & CEO',
      bio: 'Visionary leader with 15+ years in luxury event management',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Creative Director',
      bio: 'Award-winning designer creating unforgettable experiences',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'Sofia Williams',
      role: 'Operations Manager',
      bio: 'Ensuring flawless execution of every single detail',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'David Park',
      role: 'Technology Lead',
      bio: 'Building the future of event management technology',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    }
  ];

  const values = [
    {
      icon: Star,
      title: 'Excellence',
      description: 'We pursue perfection in every detail, ensuring each event exceeds expectations and creates lasting memories.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Our love for creating magical moments drives us to go above and beyond for every client and every event.'
    },
    {
      icon: Award,
      title: 'Innovation',
      description: 'We constantly push boundaries, embracing new technologies and creative approaches to event management.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building meaningful connections and fostering relationships that extend far beyond individual events.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-yellow-400">Boujee Events</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Creating extraordinary luxury experiences that transform ordinary moments 
            into unforgettable memories since 2010
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  Founded in 2010 with a simple yet ambitious vision: to redefine what luxury 
                  events could be. We started as a small team of passionate individuals who 
                  believed that every celebration deserved to be extraordinary.
                </p>
                <p>
                  Over the years, we've had the privilege of creating magical moments for 
                  thousands of clients across the globe. From intimate gatherings to grand 
                  celebrations, each event is crafted with meticulous attention to detail 
                  and a deep understanding of our clients' unique visions.
                </p>
                <p>
                  Today, Boujee Events stands as a premier luxury event management company, 
                  known for our innovation, creativity, and unwavering commitment to excellence. 
                  We don't just organize events – we create experiences that last a lifetime.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop"
                alt="Luxury Event"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className={`h-12 w-12 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                To create extraordinary luxury experiences that exceed expectations and forge 
                lasting memories. We are committed to delivering unparalleled service, innovative 
                solutions, and meticulous attention to detail in every event we orchestrate.
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                To be the world's most trusted and innovative luxury event management company, 
                setting new standards for excellence and creativity while building meaningful 
                connections within our global community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do and shape every experience we create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-yellow-400/20 p-4 rounded-full">
                    <value.icon className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The passionate professionals behind every extraordinary event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 mx-auto rounded-full object-cover border-4 border-gray-700 group-hover:border-yellow-400 transition-colors duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-yellow-400 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-yellow-400/10 to-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Magic Together?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Let's turn your vision into an extraordinary reality. Contact us today 
            to start planning your next unforgettable event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Get Started
            </button>
            <button className="border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              View Our Work
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
