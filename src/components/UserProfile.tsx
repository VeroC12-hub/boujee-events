import React, { useState } from 'react';
import { User, Settings, Edit3, Camera, Share2, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, profile, signOut } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: profile?.full_name || '',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-50';
      case 'organizer': return 'text-blue-600 bg-blue-50';
      case 'member': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'organizer': return '🎯';
      case 'member': return '🌟';
      default: return '👤';
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h2>
        <p className="text-gray-400">Access your profile and account settings</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Picture & Basic Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name || user.email}`}
                alt={profile.full_name || user.email || 'User'}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
              />
              <button className="absolute -bottom-1 -right-1 bg-primary text-black p-2 rounded-full hover:bg-primary/80 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.full_name || 'User'}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(profile.role)}`}>
                  {getRoleIcon(profile.role)} {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  profile.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <Shield className="w-3 h-3" /> {profile.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
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
            <button 
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Member Since */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Member since {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Information
        </h3>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Here you would typically update the profile
                  setIsEditingProfile(false);
                }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Account Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="text-foreground">{profile.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-foreground">{profile.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since:</span>
                  <span className="text-foreground">{formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <span className="text-foreground text-sm">Account Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {onClose && (
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Close Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;