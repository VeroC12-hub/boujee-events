import React from 'react';
import { useAuth } from '../contexts/EnhancedAuthContext';
import EnhancedAdminDashboard from '../components/admin/EnhancedAdminDashboard';

const AdminDashboard: React.FC = () => {
  const { state: authState } = useAuth();
  
  // Ensure user is authenticated and is an admin
  if (!authState.isAuthenticated || !authState.user || authState.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <EnhancedAdminDashboard />;
};

export default AdminDashboard;
