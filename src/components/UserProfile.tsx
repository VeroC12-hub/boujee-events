import React, { useState } from 'react';
import { 
  User, Settings, Heart, History, Star, Award, Bell, 
  Edit3, Calendar, TrendingUp, Gift, Crown, Shield
} from 'lucide-react';
import { usePublicUser } from '../contexts/PublicUserContext';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, isAuthenticated, logout, updateProfile } = usePublicUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'silver': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'gold': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'platinum': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '👑';
      default: return '⭐';
    }
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile(profileForm);
    if (success) {
      setIsEditingProfile(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-purple-600/10 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(user.tier)}`}>
                  <span>{getTierIcon(user.tier)}</span>
                  <span className="capitalize">{user.tier} Member</span>
                </div>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex h-96">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400/10 to-purple-600/10 rounded-lg border border-yellow-400/20">
              <div className="text-center">
                <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-400 font-semibold text-sm">{user.points} Points</p>
                <p className="text-gray-400 text-xs">Keep earning for rewards!</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Profile Information</h3>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-lg hover:bg-yellow-400/30 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditingProfile ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <p className="text-white">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <p className="text-white">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Member Since</label>
                        <p className="text-white">{new Date(user.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Loyalty Tier</label>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getTierColor(user.tier)}`}>
                          <span className="text-lg">{getTierIcon(user.tier)}</span>
                          <span className="capitalize font-medium">{user.tier}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Points Balance</label>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-semibold">{user.points} points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Event History</h3>
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No event history yet</p>
                  <p className="text-sm">Your attended events will appear here</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="text-white font-medium">Email Notifications</h4>
                        <p className="text-gray-400 text-sm">Receive updates about your bookings</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={user.preferences.notifications}
                        onChange={(e) => updateProfile({
                          preferences: { ...user.preferences, notifications: e.target.checked }
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="text-white font-medium">Newsletter</h4>
                        <p className="text-gray-400 text-sm">Get updates about new events and offers</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={user.preferences.newsletter}
                        onChange={(e) => updateProfile({
                          preferences: { ...user.preferences, newsletter: e.target.checked }
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Sign Out
                  </button>
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