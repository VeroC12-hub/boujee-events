// src/hooks/useRoleAccess.ts - Complete Role-Based Access Control Hook
import { useAuth } from '../contexts/AuthContext';

export const useRoleAccess = () => {
  const { profile, user } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  const isOrganizer = profile?.role === 'organizer';
  const isMember = profile?.role === 'member';
  const isViewer = profile?.role === 'viewer';
  
  return {
    // Role checks
    isAdmin,
    isOrganizer,
    isMember,
    isViewer,
    userRole: profile?.role,
    userId: user?.id,
    
    // Permission checks
    canAccessDashboard: isAdmin || isOrganizer,
    canViewAnalytics: isAdmin || isOrganizer,
    canManageAllEvents: isAdmin,
    canManageOwnEvents: isAdmin || isOrganizer,
    canDeletePaidEvents: isAdmin,
    canManageAllUsers: isAdmin,
    canManageMedia: isAdmin || isOrganizer,
    canManageSystem: isAdmin,
    canManageHomepage: isAdmin || isOrganizer,
    canManageBanners: isAdmin, // Banners are admin-only
    canCreateEvents: isAdmin || isOrganizer,
    
    // Helper functions
    hasRole: (roles: string[]) => {
      return profile?.role && roles.includes(profile.role);
    },
    
    requiresRole: (requiredRoles: string[]) => {
      if (!profile?.role) return false;
      return requiredRoles.includes(profile.role);
    },
    
    hasElevatedAccess: isAdmin || isOrganizer,
    
    // Navigation helpers
    getDashboardPath: () => {
      switch (profile?.role) {
        case 'admin': return '/admin-dashboard';
        case 'organizer': return '/organizer-dashboard';
        case 'member': return '/member-dashboard';
        default: return '/dashboard';
      }
    },
    
    getHomepageMediaPath: () => {
      return (isAdmin || isOrganizer) ? '/admin/homepage-media' : null;
    },

    // Access level helpers
    getAccessLevel: () => {
      if (isAdmin) return 'full';
      if (isOrganizer) return 'limited';
      if (isMember) return 'basic';
      return 'none';
    },

    // Section access checks
    canAccessSection: (section: string) => {
      switch (section) {
        case 'overview':
          return isAdmin || isOrganizer;
        case 'events':
          return isAdmin || isOrganizer;
        case 'analytics':
          return isAdmin || isOrganizer;
        case 'media':
          return isAdmin || isOrganizer;
        case 'users':
          return isAdmin;
        case 'settings':
          return isAdmin;
        default:
          return false;
      }
    },

    // Event-specific permissions
    canEditEvent: (eventOwnerId?: string) => {
      if (isAdmin) return true;
      if (isOrganizer && eventOwnerId === user?.id) return true;
      return false;
    },

    canDeleteEvent: (eventOwnerId?: string, isPaid?: boolean) => {
      if (isAdmin) return true;
      if (isPaid && !isAdmin) return false; // Only admins can delete paid events
      if (isOrganizer && eventOwnerId === user?.id) return true;
      return false;
    },

    // User management permissions
    canViewUser: (targetUserId?: string) => {
      if (isAdmin) return true;
      if (targetUserId === user?.id) return true; // Can view own profile
      return false;
    },

    canEditUser: (targetUserId?: string) => {
      if (isAdmin) return true;
      if (targetUserId === user?.id) return true; // Can edit own profile
      return false;
    },

    canDeleteUser: (targetUserId?: string) => {
      if (!isAdmin) return false;
      if (targetUserId === user?.id) return false; // Cannot delete own account
      return true;
    },

    // Media permissions
    canUploadMedia: () => {
      return isAdmin || isOrganizer;
    },

    canDeleteMedia: (mediaOwnerId?: string) => {
      if (isAdmin) return true;
      if (isOrganizer && mediaOwnerId === user?.id) return true;
      return false;
    },

    // Analytics permissions
    canViewGlobalAnalytics: () => {
      return isAdmin;
    },

    canViewOwnAnalytics: () => {
      return isAdmin || isOrganizer;
    },

    // System permissions
    canModifySystemSettings: () => {
      return isAdmin;
    },

    canViewSystemLogs: () => {
      return isAdmin;
    },

    canManageRoles: () => {
      return isAdmin;
    },

    // Financial permissions
    canViewFinancials: (targetUserId?: string) => {
      if (isAdmin) return true;
      if (isOrganizer && targetUserId === user?.id) return true;
      return false;
    },

    canProcessRefunds: () => {
      return isAdmin;
    },

    // Communication permissions
    canSendBroadcast: () => {
      return isAdmin;
    },

    canModerateComments: () => {
      return isAdmin || isOrganizer;
    }
  };
};
