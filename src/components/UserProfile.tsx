import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Heart, History, Star, Award, Bell, Users, 
  Edit3, Camera, MapPin, Calendar, TrendingUp, Gift, 
  ChevronRight, Crown, Zap, Shield, MessageSquare, Share2
} from 'lucide-react';
import { usePublicUser } from '../contexts/PublicUserContext';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { 
    user, 
    favorites, 
    history, 
    loyaltyProgram, 
    notifications,
    getUnreadCount,
    markNotificationRead,
    updateProfile,
    updatePreferences
  } = usePublicUser();

  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history' | 'loyalty' | 'notifications' | 'settings'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.socialProfile?.bio || '',
    isPublic: user?.socialProfile?.isPublic || false
  });

  const unreadCount = getUnreadCount();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-orange-600 bg-orange-50';
      case 'Silver': return 'text-gray-600 bg-gray-50';
      case 'Gold': return 'text-yellow-600 bg-yellow-50';
      case 'Platinum': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Platinum': return '💎';
      default: return '🏆';
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    await updateProfile({
      name: profileForm.name,
      socialProfile: {
        ...user.socialProfile,
        bio: profileForm.bio,
        isPublic: profileForm.isPublic
      }
    });
    setIsEditingProfile(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h2>
        <p className="text-gray-400">Access your favorites, history, and loyalty rewards</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Picture & Basic Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
              />
              <button className="absolute -bottom-1 -right-1 bg-primary text-black p-2 rounded-full hover:bg-primary/80 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(user.loyaltyTier)}`}>
                  {getTierIcon(user.loyaltyTier)} {user.loyaltyTier} Member
                </span>
                {user.isVip && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                    <Crown className="w-3 h-3" /> VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{user.stats.eventsAttended}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{formatCurrency(user.stats.totalSpent)}</div>
              <div className="text-sm text-muted-foreground">Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{user.loyaltyPoints.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{user.socialProfile.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Bio */}
        {(user.socialProfile.bio || isEditingProfile) && (
          <div className="mt-4 pt-4 border-t border-border">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={profileForm.isPublic}
                    onChange={(e) => setProfileForm({ ...profileForm, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm text-foreground">Make profile public</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{user.socialProfile.bio}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-card rounded-lg p-2">
        {[
          { id: 'profile', label: 'Overview', icon: User },
          { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
          { id: 'history', label: 'History', icon: History, count: history.length },
          { id: 'loyalty', label: 'Loyalty', icon: Award, highlight: true },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                activeTab === tab.id
                  ? 'bg-primary text-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              } ${tab.highlight ? 'ring-2 ring-yellow-500/30' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count && tab.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Overview */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <img src={item.eventImage} alt={item.eventTitle} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.eventTitle}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-muted-foreground">{item.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Overview */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Loyalty Status
              </h3>
              {loyaltyProgram && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getTierIcon(loyaltyProgram.currentTier)}</div>
                    <div className="text-lg font-semibold text-white">{loyaltyProgram.currentTier} Member</div>
                    <div className="text-sm text-muted-foreground">{loyaltyProgram.currentPoints.toLocaleString()} points</div>
                  </div>
                  
                  {loyaltyProgram.nextTier && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to {loyaltyProgram.nextTier}</span>
                        <span>{loyaltyProgram.pointsToNextTier} points needed</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${100 - (loyaltyProgram.pointsToNextTier / (loyaltyProgram.pointsToNextTier + loyaltyProgram.currentPoints) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Quick Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Event Reminders</span>
                  <input 
                    type="checkbox" 
                    checked={user.preferences.notifications.eventReminders}
                    onChange={(e) => updatePreferences({
                      notifications: {
                        ...user.preferences.notifications,
                        eventReminders: e.target.checked
                      }
                    })}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Early Access</span>
                  <input 
                    type="checkbox" 
                    checked={user.preferences.notifications.earlyAccess}
                    onChange={(e) => updatePreferences({
                      notifications: {
                        ...user.preferences.notifications,
                        earlyAccess: e.target.checked
                      }
                    })}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Deal Notifications</span>
                  <input 
                    type="checkbox" 
                    checked={user.preferences.notifications.deals}
                    onChange={(e) => updatePreferences({
                      notifications: {
                        ...user.preferences.notifications,
                        deals: e.target.checked
                      }
                    })}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites */}
        {activeTab === 'favorites' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Favorite Events ({favorites.length})
            </h3>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors">
                    <img 
                      src={favorite.eventImage} 
                      alt={favorite.eventTitle}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-medium text-foreground mb-2">{favorite.eventTitle}</h4>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(favorite.eventDate)}
                      </span>
                      <span>Added {formatDate(favorite.addedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No favorite events yet</p>
                <p className="text-sm text-muted-foreground mt-2">Explore events and add them to your favorites!</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Event History ({history.length})
            </h3>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <img 
                      src={item.eventImage} 
                      alt={item.eventTitle}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.eventTitle}</h4>
                      <p className="text-sm text-muted-foreground">{item.ticketType}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                        <span>{formatCurrency(item.amount)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'attended' ? 'bg-green-100 text-green-800' :
                          item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No event history yet</p>
                <p className="text-sm text-muted-foreground mt-2">Your attended events will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Loyalty Program */}
        {activeTab === 'loyalty' && loyaltyProgram && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Loyalty Program
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-2">{getTierIcon(loyaltyProgram.currentTier)}</div>
                    <h4 className="text-2xl font-bold text-white">{loyaltyProgram.currentTier} Member</h4>
                    <p className="text-muted-foreground">{loyaltyProgram.currentPoints.toLocaleString()} points</p>
                  </div>
                  
                  {loyaltyProgram.nextTier && (
                    <div className="bg-card/50 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to {loyaltyProgram.nextTier}</span>
                        <span>{loyaltyProgram.pointsToNextTier} points needed</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${100 - (loyaltyProgram.pointsToNextTier / (loyaltyProgram.pointsToNextTier + loyaltyProgram.currentPoints) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h5 className="font-semibold text-white mb-3">Your Benefits</h5>
                  <div className="space-y-2">
                    {Object.entries(loyaltyProgram.tierBenefits).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {value ? (
                          <Shield className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 border border-muted-foreground rounded opacity-50" />
                        )}
                        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          {key === 'discountPercentage' && value && ` (${loyaltyProgram.tierBenefits.discountPercentage}%)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Points History */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h4 className="font-semibold text-white mb-4">Points History</h4>
              <div className="space-y-3">
                {loyaltyProgram.history.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? <Zap className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'earned' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'earned' ? '+' : ''}{transaction.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Notifications ({notifications.length})
            </h3>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      notification.isRead 
                        ? 'bg-muted border-border' 
                        : 'bg-primary/5 border-primary/20'
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {notification.imageUrl && (
                        <img 
                          src={notification.imageUrl} 
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.date)}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications</p>
                <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Notification Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Event Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get notified about upcoming events</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={user.preferences.notifications.eventReminders}
                      onChange={(e) => updatePreferences({
                        notifications: {
                          ...user.preferences.notifications,
                          eventReminders: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Early Access</h4>
                      <p className="text-sm text-muted-foreground">Be first to know about new events</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={user.preferences.notifications.earlyAccess}
                      onChange={(e) => updatePreferences({
                        notifications: {
                          ...user.preferences.notifications,
                          earlyAccess: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Deal Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive special offers and discounts</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={user.preferences.notifications.deals}
                      onChange={(e) => updatePreferences({
                        notifications: {
                          ...user.preferences.notifications,
                          deals: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Recommendations</h4>
                      <p className="text-sm text-muted-foreground">Get personalized event suggestions</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={user.preferences.notifications.recommendations}
                      onChange={(e) => updatePreferences({
                        notifications: {
                          ...user.preferences.notifications,
                          recommendations: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Public Profile</h4>
                    <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={user.socialProfile.isPublic}
                    onChange={(e) => updateProfile({
                      socialProfile: {
                        ...user.socialProfile,
                        isPublic: e.target.checked
                      }
                    })}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;