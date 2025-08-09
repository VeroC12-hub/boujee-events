import React, { useState, useEffect } from 'react';
import { usePublicUser } from '../contexts/PublicUserContext';
import { useAuth } from '../hooks/useAuth';

interface UserStats {
  eventsAttended: number;
  totalSpent: number;
  reviewsLeft: number;
  favoriteEvents: number;
}

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
  eventReminders: boolean;
  privacySettings: boolean;
}

interface SocialProfile {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

interface LoyaltyProgram {
  currentTier: string;
  points: number;
  nextTierPoints: number;
  benefits: string[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface FavoriteEvent {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventImage: string;
  addedAt: string;
}

interface HistoryItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  attendedDate: string;
  rating?: number;
  review?: string;
}

interface TransactionItem {
  id: string;
  eventId: string;
  eventTitle: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
  paymentMethod: string;
}

const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { 
    user: publicUser, 
    favorites = [], 
    history = [], 
    loyaltyProgram, 
    notifications = [], 
    getUnreadCount, 
    markNotificationRead, 
    updatePreferences 
  } = usePublicUser();

  // Use auth user if available, otherwise use public user
  const currentUser = user || publicUser;

  // Helper function to safely get user properties
  const getUserProperty = (user: any, property: string): any => {
    if (!user) return undefined;
    return user[property] || user[property.replace('_', '')] || (user.user_metadata && user.user_metadata[property]);
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences' | 'loyalty' | 'history'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: getUserProperty(currentUser, 'name') || getUserProperty(currentUser, 'full_name') || '',
    email: currentUser?.email || '',
    phone: '',
    bio: '',
    avatar: getUserProperty(currentUser, 'avatar') || getUserProperty(currentUser, 'avatar_url') || '',
    socialProfile: {
      twitter: '',
      instagram: '',
      linkedin: '',
      website: ''
    } as SocialProfile
  });

  // Mock data fallbacks
  const defaultStats: UserStats = {
    eventsAttended: getUserProperty(currentUser, 'stats')?.eventsAttended || 12,
    totalSpent: getUserProperty(currentUser, 'stats')?.totalSpent || 2450,
    reviewsLeft: getUserProperty(currentUser, 'stats')?.reviewsLeft || 8,
    favoriteEvents: favorites?.length || 5
  };

  const defaultPreferences: UserPreferences = {
    emailNotifications: getUserProperty(currentUser, 'preferences')?.emailNotifications ?? true,
    pushNotifications: getUserProperty(currentUser, 'preferences')?.pushNotifications ?? true,
    newsletter: getUserProperty(currentUser, 'preferences')?.newsletter ?? true,
    eventReminders: getUserProperty(currentUser, 'preferences')?.eventReminders ?? true,
    privacySettings: getUserProperty(currentUser, 'preferences')?.privacySettings ?? false
  };

  const defaultLoyaltyProgram: LoyaltyProgram = loyaltyProgram || {
    currentTier: getUserProperty(currentUser, 'loyaltyTier') || 'Gold',
    points: getUserProperty(currentUser, 'loyaltyPoints') || 2840,
    nextTierPoints: 5000,
    benefits: [
      'Priority booking access',
      '15% discount on all events',
      'Exclusive VIP events',
      'Personal concierge service'
    ]
  };

  const mockNotifications: NotificationItem[] = notifications?.length > 0 ? notifications : [
    {
      id: '1',
      title: 'Event Reminder',
      message: 'Summer Music Festival is tomorrow!',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Booking Confirmed',
      message: 'Your booking for Tech Summit has been confirmed.',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const mockFavorites: FavoriteEvent[] = favorites?.length > 0 ? favorites : [
    {
      id: '1',
      eventId: 'event_1',
      eventTitle: 'Summer Music Festival',
      eventDate: '2025-08-15',
      eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
      addedAt: new Date().toISOString()
    }
  ];

  const mockHistory: HistoryItem[] = history?.length > 0 ? history : [
    {
      id: '1',
      eventId: 'event_past_1',
      eventTitle: 'Wine Tasting Evening',
      eventDate: '2025-01-15',
      attendedDate: '2025-01-15',
      rating: 5,
      review: 'Absolutely fantastic event!'
    }
  ];

  const mockTransactions: TransactionItem[] = [
    {
      id: '1',
      eventId: 'event_1',
      eventTitle: 'Summer Music Festival',
      amount: 299,
      date: '2025-01-10',
      status: 'completed',
      paymentMethod: 'Credit Card'
    }
  ];

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: getUserProperty(currentUser, 'name') || getUserProperty(currentUser, 'full_name') || '',
        email: currentUser.email || '',
        phone: '',
        bio: '',
        avatar: getUserProperty(currentUser, 'avatar') || getUserProperty(currentUser, 'avatar_url') || '',
        socialProfile: getUserProperty(currentUser, 'socialProfile') || {
          twitter: '',
          instagram: '',
          linkedin: '',
          website: ''
        }
      });
    }
  }, [currentUser]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const updates = {
        name: profileForm.name,
        socialProfile: profileForm.socialProfile
      };

      if (updateProfile) {
        await updateProfile(updates);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    const newPrefs = { [key]: value };
    if (updatePreferences) {
      updatePreferences(newPrefs);
    }
  };

  const handleNotificationRead = (notificationId: string) => {
    if (markNotificationRead) {
      markNotificationRead(notificationId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getUnreadNotificationCount = () => {
    if (getUnreadCount) {
      return getUnreadCount();
    }
    return mockNotifications.filter(n => !n.read).length;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <div className="text-white text-xl mb-4">Please sign in to view your profile</div>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-yellow-400/20 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                {profileForm.avatar ? (
                  <img 
                    src={profileForm.avatar} 
                    alt={profileForm.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-black text-2xl font-bold">
                    {profileForm.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profileForm.name || 'User'}</h1>
                <p className="text-gray-300">{currentUser?.email}</p>
                {getUserProperty(currentUser, 'loyaltyTier') && (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    getUserProperty(currentUser, 'loyaltyTier') === 'Diamond' ? 'bg-blue-500/20 text-blue-400' :
                    getUserProperty(currentUser, 'loyaltyTier') === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                    getUserProperty(currentUser, 'loyaltyTier') === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {getUserProperty(currentUser, 'loyaltyTier')} Member
                  </span>
                )}
                {getUserProperty(currentUser, 'isVip') && (
                  <span className="ml-2 inline-block px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                    VIP
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-yellow-400">{defaultStats.eventsAttended}</div>
            <div className="text-gray-300">Events Attended</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-green-400">{formatCurrency(defaultStats.totalSpent)}</div>
            <div className="text-gray-300">Total Spent</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-blue-400">{defaultStats.reviewsLeft}</div>
            <div className="text-gray-300">Reviews Left</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-bold text-purple-400">{defaultLoyaltyProgram.points}</div>
            <div className="text-gray-300">Loyalty Points</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-8">
          <div className="border-b border-white/10">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'profile', label: 'Profile', icon: '👤' },
                { key: 'notifications', label: 'Notifications', icon: '🔔', count: getUnreadNotificationCount() },
                { key: 'preferences', label: 'Preferences', icon: '⚙️' },
                { key: 'loyalty', label: 'Loyalty Program', icon: '🏆' },
                { key: 'history', label: 'History', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count && tab.count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Profile Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                    </div>
                    
                    {/* Social Profile */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Social Profiles</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Twitter username"
                          value={profileForm.socialProfile?.twitter || ''}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            socialProfile: { ...prev.socialProfile, twitter: e.target.value }
                          }))}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Instagram username"
                          value={profileForm.socialProfile?.instagram || ''}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            socialProfile: { ...prev.socialProfile, instagram: e.target.value }
                          }))}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        <p><span className="text-gray-400">Email:</span> {currentUser?.email}</p>
                        <p><span className="text-gray-400">Name:</span> {profileForm.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Social Profiles</h4>
                      <div className="space-y-2">
                        {profileForm.socialProfile?.twitter && (
                          <p><span className="text-gray-400">Twitter:</span> @{profileForm.socialProfile.twitter}</p>
                        )}
                        {profileForm.socialProfile?.instagram && (
                          <p><span className="text-gray-400">Instagram:</span> @{profileForm.socialProfile.instagram}</p>
                        )}
                        {!profileForm.socialProfile?.twitter && !profileForm.socialProfile?.instagram && (
                          <p className="text-gray-500">No social profiles added</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Notifications</h3>
                <div className="space-y-3">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.read 
                          ? 'bg-white/5 border-white/10' 
                          : 'bg-yellow-400/10 border-yellow-400/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => handleNotificationRead(notification.id)}
                            className="text-yellow-400 hover:text-yellow-300 text-sm"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Notification Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(defaultPreferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {key === 'emailNotifications' && 'Receive event updates via email'}
                          {key === 'pushNotifications' && 'Get push notifications on your device'}
                          {key === 'newsletter' && 'Subscribe to our weekly newsletter'}
                          {key === 'eventReminders' && 'Reminders about upcoming events'}
                          {key === 'privacySettings' && 'Enhanced privacy protection'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePreferenceChange(key as keyof UserPreferences, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loyalty Program Tab */}
            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Loyalty Program</h3>
                <div className="bg-gradient-to-r from-yellow-400/20 to-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold">{defaultLoyaltyProgram.currentTier} Tier</h4>
                      <p className="text-gray-300">{defaultLoyaltyProgram.points} points</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Next tier in</p>
                      <p className="font-semibold">
                        {defaultLoyaltyProgram.nextTierPoints - defaultLoyaltyProgram.points} points
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ 
                        width: `${(defaultLoyaltyProgram.points / defaultLoyaltyProgram.nextTierPoints) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Your Benefits</h4>
                  <ul className="space-y-2">
                    {defaultLoyaltyProgram.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Event History</h3>
                
                {/* Favorites Section */}
                <div>
                  <h4 className="font-medium mb-3">Favorite Events</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockFavorites.map((favorite) => (
                      <div key={favorite.id} className="bg-white/5 rounded-lg p-4">
                        <h5 className="font-medium">{favorite.eventTitle}</h5>
                        <p className="text-sm text-gray-400">{favorite.eventDate}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Past Events */}
                <div>
                  <h4 className="font-medium mb-3">Past Events</h4>
                  <div className="space-y-3">
                    {mockHistory.map((item) => (
                      <div key={item.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{item.eventTitle}</h5>
                            <p className="text-sm text-gray-400">Attended: {item.attendedDate}</p>
                            {item.rating && (
                              <div className="flex items-center mt-2">
                                <span className="text-yellow-400">{'★'.repeat(item.rating)}</span>
                                <span className="text-gray-400 ml-2">({item.rating}/5)</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {item.review && (
                          <p className="text-sm text-gray-300 mt-2 italic">"{item.review}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction History */}
                <div>
                  <h4 className="font-medium mb-3">Transaction History</h4>
                  <div className="space-y-3">
                    {mockTransactions.map((transaction) => (
                      <div key={transaction.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium">{transaction.eventTitle}</h5>
                            <p className="text-sm text-gray-400">{transaction.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default UserProfile;
