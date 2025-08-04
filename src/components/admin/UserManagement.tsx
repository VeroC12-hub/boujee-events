import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'organizer' | 'user';
  status: 'active' | 'inactive' | 'banned';
  avatar: string;
  joinDate: string;
  lastLogin: string;
  eventsCreated: number;
  eventsAttended: number;
  totalSpent: number;
  verified: boolean;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'VeroC12-hub',
      email: 'veroc12@example.com',
      phone: '+1-555-0123',
      role: 'admin',
      status: 'active',
      avatar: 'https://via.placeholder.com/100x100/8B5CF6/FFFFFF?text=V',
      joinDate: '2025-01-15',
      lastLogin: '2025-08-03 03:11:25',
      eventsCreated: 8,
      eventsAttended: 12,
      totalSpent: 1250,
      verified: true
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0234',
      role: 'organizer',
      status: 'active',
      avatar: 'https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=JS',
      joinDate: '2025-02-10',
      lastLogin: '2025-08-02 18:45:21',
      eventsCreated: 5,
      eventsAttended: 8,
      totalSpent: 650,
      verified: true
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1-555-0345',
      role: 'user',
      status: 'active',
      avatar: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=SJ',
      joinDate: '2025-03-05',
      lastLogin: '2025-08-01 14:20:15',
      eventsCreated: 0,
      eventsAttended: 15,
      totalSpent: 890,
      verified: true
    },
    {
      id: '4',
      name: 'Mike Davis',
      email: 'mike.davis@example.com',
      phone: '+1-555-0456',
      role: 'organizer',
      status: 'inactive',
      avatar: 'https://via.placeholder.com/100x100/F59E0B/FFFFFF?text=MD',
      joinDate: '2025-01-20',
      lastLogin: '2025-07-15 09:30:45',
      eventsCreated: 3,
      eventsAttended: 4,
      totalSpent: 320,
      verified: false
    },
    {
      id: '5',
      name: 'Emma Wilson',
      email: 'emma.w@example.com',
      phone: '+1-555-0567',
      role: 'user',
      status: 'banned',
      avatar: 'https://via.placeholder.com/100x100/EF4444/FFFFFF?text=EW',
      joinDate: '2025-04-12',
      lastLogin: '2025-07-28 16:12:33',
      eventsCreated: 0,
      eventsAttended: 2,
      totalSpent: 0,
      verified: false
    },
    {
      id: '6',
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      phone: '+1-555-0678',
      role: 'user',
      status: 'active',
      avatar: 'https://via.placeholder.com/100x100/6366F1/FFFFFF?text=AC',
      joinDate: '2025-05-18',
      lastLogin: '2025-08-03 01:15:42',
      eventsCreated: 1,
      eventsAttended: 6,
      totalSpent: 450,
      verified: true
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'organizer': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus as User['status'] } : user
    ));
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole as User['role'] } : user
    ));
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    organizers: users.filter(u => u.role === 'organizer').length,
    verified: users.filter(u => u.verified).length
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-600 mt-2">Manage users, roles, and permissions across your platform</p>
            <p className="text-sm text-gray-500 mt-1">Current time: 2025-08-03 03:11:25 UTC | User: VeroC12-hub</p>
          </div>
          
          <button
            onClick={() => alert('Create User Modal would open here')}
            className="btn-luxury text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">➕</span>
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="card-luxury">
          <div className="flex items-center">
            <span className="text-3xl text-primary mr-4">👤</span>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card-luxury">
          <div className="flex items-center">
            <span className="text-3xl text-green-600 mr-4">✅</span>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="card-luxury">
          <div className="flex items-center">
            <span className="text-3xl text-purple-600 mr-4">🛡️</span>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Admins</h3>
              <p className="text-2xl font-bold text-white">{stats.admins}</p>
            </div>
          </div>
        </div>
        
        <div className="card-luxury">
          <div className="flex items-center">
            <span className="text-3xl text-primary mr-4">🎯</span>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Organizers</h3>
              <p className="text-2xl font-bold text-white">{stats.organizers}</p>
            </div>
          </div>
        </div>
        
        <div className="card-luxury">
          <div className="flex items-center">
            <span className="text-3xl text-green-600 mr-4">✓</span>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Verified</h3>
              <p className="text-2xl font-bold text-white">{stats.verified}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card-luxury mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">🔽</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-border bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="organizer">Organizer</option>
                <option value="user">User</option>
              </select>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-background">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={user.avatar} 
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          {user.verified && (
                            <span className="ml-2 text-green-500">✓</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getRoleColor(user.role)}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="organizer">Organizer</option>
                      <option value="user">User</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(user.status)}`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <div>Created: {user.eventsCreated}</div>
                    <div className="text-gray-500">Attended: {user.eventsAttended}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${user.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary hover:text-blue-900"
                        title="View Details"
                      >
                        <span className="text-sm">👁️</span>
                      </button>
                      <button
                        onClick={() => alert(`Edit ${user.name}`)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit User"
                      >
                        <span className="text-sm">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <span className="text-sm">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-400 block mb-4">👤</span>
          <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  className="h-20 w-20 rounded-full" 
                  src={selectedUser.avatar} 
                  alt={selectedUser.name}
                />
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                    {selectedUser.verified && (
                      <span className="ml-2 text-green-500 text-lg">✓</span>
                    )}
                  </div>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-white">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Join Date</label>
                  <p className="text-white">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Events Created</label>
                  <p className="text-white">{selectedUser.eventsCreated}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Events Attended</label>
                  <p className="text-white">{selectedUser.eventsAttended}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Spent</label>
                  <p className="text-white">${selectedUser.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="text-white">{selectedUser.lastLogin}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-border bg-background rounded-lg text-gray-700 hover:bg-background"
                >
                  Close
                </button>
                <button 
                  onClick={() => alert(`Edit ${selectedUser.name}`)}
                  className="px-4 py-2 btn-luxury text-white rounded-lg hover:bg-accent"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
