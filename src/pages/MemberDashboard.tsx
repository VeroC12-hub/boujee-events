import React, { useState } from 'react';
import { 
  User, Calendar, Crown, Ticket, CreditCard, Bell, Settings, LogOut,
  Star, TrendingUp, Gift, Users, MapPin, Clock, ChevronRight,
  Trophy, Sparkles, Heart, Share2, Download, Shield
} from 'lucide-react';

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock user data
  const user = {
    name: 'Alexandra Chen',
    email: 'alexandra@example.com',
    memberSince: 'January 2024',
    tier: 'Platinum',
    points: 12500,
    nextTier: 'Diamond',
    pointsToNext: 2500,
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Sunset Yacht Gala',
      date: 'Dec 15, 2025',
      location: 'Monaco',
      tier: 'VIP',
      image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400'
    },
    {
      id: 2,
      title: 'Golden Hour Festival',
      date: 'Mar 20, 2025',
      location: 'Ibiza',
      tier: 'Platinum',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
    }
  ];

  const pastEvents = [
    {
      id: 3,
      title: 'Midnight in Paradise',
      date: 'Nov 10, 2024',
      location: 'Maldives',
      rating: 5,
      photos: 124
    }
  ];

  const exclusiveOffers = [
    {
      id: 1,
      title: 'Early Access: Monaco Grand Prix VIP',
      discount: '20% OFF',
      expires: '48 hours'
    },
    {
      id: 2,
      title: 'Complimentary Upgrade to Platinum',
      discount: 'FREE',
      expires: '7 days'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Crown className="w-4 h-4" /> },
    { id: 'events', name: 'My Events', icon: <Calendar className="w-4 h-4" /> },
    { id: 'rewards', name: 'Rewards', icon: <Gift className="w-4 h-4" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const tierBenefits = {
    Platinum: [
      'Priority booking on all events',
      'Complimentary drinks at venues',
      'Access to member-only events',
      'Personal concierge service',
      'Free event cancellation'
    ],
    Diamond: [
      'All Platinum benefits',
      'Private jet coordination',
      'Backstage meet & greets',
      'Custom event planning',
      'Lifetime membership'
    ]
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-gray-400">Manage your exclusive experiences and membership</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="card-luxury mb-6">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={user.profileImage} 
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-primary text-sm font-semibold">{user.tier} Member</span>
                  </div>
                </div>
              </div>

              {/* Points Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Boujee Points</span>
                  <span className="font-semibold">{user.points.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                    style={{ width: `${(user.points / (user.points + user.pointsToNext)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {user.pointsToNext.toLocaleString()} points to {user.nextTier}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-primary text-black font-semibold' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-red-400">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card-luxury">
                    <div className="flex items-center justify-between mb-2">
                      <Ticket className="w-8 h-8 text-primary" />
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold">24</h3>
                    <p className="text-sm text-gray-400">Events Attended</p>
                  </div>
                  <div className="card-luxury">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-primary" />
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">+5 new</span>
                    </div>
                    <h3 className="text-2xl font-bold">156</h3>
                    <p className="text-sm text-gray-400">VIP Connections</p>
                  </div>
                  <div className="card-luxury">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="w-8 h-8 text-primary" />
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-bold">Top 5%</h3>
                    <p className="text-sm text-gray-400">Member Ranking</p>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Events
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="card-luxury group hover:scale-105 transition-transform duration-300">
                        <div className="flex gap-4">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">{event.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                              <Clock className="w-3 h-3" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                            <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                              {event.tier} Access
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 text-sm py-2 bg-primary text-black rounded-lg hover:bg-accent transition-colors">
                            View Details
                          </button>
                          <button className="p-2 border border-gray-700 rounded-lg hover:border-primary transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusive Offers */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Exclusive Offers
                  </h2>
                  <div className="space-y-3">
                    {exclusiveOffers.map(offer => (
                      <div key={offer.id} className="card-luxury flex items-center justify-between group">
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{offer.title}</h3>
                          <p className="text-sm text-gray-400">Expires in {offer.expires}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">{offer.discount}</span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">My Events</h2>
                
                {/* Event Tabs */}
                <div className="flex gap-4 border-b border-gray-800">
                  <button className="pb-4 px-2 border-b-2 border-primary text-primary">
                    Upcoming ({upcomingEvents.length})
                  </button>
                  <button className="pb-4 px-2 text-gray-400 hover:text-white transition-colors">
                    Past ({pastEvents.length})
                  </button>
                  <button className="pb-4 px-2 text-gray-400 hover:text-white transition-colors">
                    Wishlist (7)
                  </button>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="card-luxury">
                      <div className="flex flex-col md:flex-row gap-6">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full md:w-48 h-32 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                              <div className="space-y-1 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {event.date}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Crown className="w-4 h-4" />
                                  {event.tier} Experience
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button className="btn-luxury text-sm px-4 py-2">
                                Manage Booking
                              </button>
                              <button className="text-sm text-gray-400 hover:text-primary transition-colors">
                                Add to Calendar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Rewards & Benefits</h2>
                
                {/* Current Tier Benefits */}
                <div className="card-luxury">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      Your {user.tier} Benefits
                    </h3>
                    <span className="text-sm text-gray-400">Member since {user.memberSince}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tierBenefits[user.tier].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Tier Preview */}
                <div className="card-luxury border-2 border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Unlock {user.nextTier} Status
                    </h3>
                    <span className="text-sm text-primary">{user.pointsToNext} points away</span>
                  </div>
                  <p className="text-gray-400 mb-4">Upgrade to unlock these exclusive benefits:</p>
                  <div className="space-y-2">
                    {tierBenefits[user.nextTier].slice(-3).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-accent" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Points History */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Points Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Event Attendance</p>
                          <p className="text-sm text-gray-400">Golden Hour Festival</p>
                        </div>
                      </div>
                      <span className="text-green-500 font-semibold">+500</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Referral Bonus</p>
                          <p className="text-sm text-gray-400">Sarah J. joined</p>
                        </div>
                      </div>
                      <span className="text-primary font-semibold">+1,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Account Settings</h2>
                
                {/* Settings Sections */}
                <div className="space-y-4">
                  <div className="card-luxury">
                    <h3 className="font-semibold mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm">Event reminders</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm">Exclusive offers</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm">New event announcements</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </label>
                    </div>
                  </div>

                  <div className="card-luxury">
                    <h3 className="font-semibold mb-4">Payment Methods</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                            <p className="text-xs text-gray-400">Expires 12/25</p>
                          </div>
                        </div>
                        <button className="text-sm text-primary">Edit</button>
                      </div>
                      <button className="w-full py-3 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-primary hover:text-primary transition-colors">
                        + Add Payment Method
                      </button>
                    </div>
                  </div>

                  <div className="card-luxury">
                    <h3 className="font-semibold mb-4">Privacy & Security</h3>
                    <div className="space-y-3">
                      <button className="w-full text-left py-3 border-b border-gray-800 hover:text-primary transition-colors">
                        Change Password
                      </button>
                      <button className="w-full text-left py-3 border-b border-gray-800 hover:text-primary transition-colors">
                        Two-Factor Authentication
                      </button>
                      <button className="w-full text-left py-3 hover:text-primary transition-colors">
                        Download My Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
