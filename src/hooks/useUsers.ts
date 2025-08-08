import { useCallback } from 'react';
import { User, CreateUserRequest, UpdateUserRequest, PaginationParams } from '../types/api';

// Mock implementations without external mockApi dependency
const mockUsers: User[] = [
  {
    id: '1',
    name: 'VeroC12-hub',
    email: 'veroc12@example.com',
    phone: '+1-555-0123',
    role: 'admin',
    status: 'active',
    avatar: 'https://via.placeholder.com/100x100/8B5CF6/FFFFFF?text=V',
    joinDate: '2025-01-15',
    lastLogin: '2025-08-03 03:30:30',
    eventsCreated: 8,
    eventsAttended: 12,
    totalSpent: 1250,
    verified: true
  }
];

// Simple hooks without complex API integration
export function useUsers(params?: PaginationParams) {
  return {
    data: mockUsers,
    pagination: {
      total: mockUsers.length,
      page: 1,
      limit: 10,
      totalPages: 1
    },
    loading: false,
    error: null,
    changePage: () => {},
    changeLimit: () => {},
    sort: () => {},
    refetch: () => {}
  };
}

export function useUser(id: string) {
  return {
    data: mockUsers.find(u => u.id === id) || null,
    loading: false,
    error: null,
    refetch: () => {}
  };
}

export function useCreateUser() {
  return {
    mutate: async (userData: CreateUserRequest) => {
      console.log('Create user:', userData);
      return true;
    },
    loading: false,
    error: null
  };
}

export function useUpdateUser() {
  return {
    mutate: async ({ id, updates }: { id: string; updates: UpdateUserRequest }) => {
      console.log('Update user:', id, updates);
      return true;
    },
    loading: false,
    error: null
  };
}

export function useDeleteUser() {
  return {
    mutate: async (id: string) => {
      console.log('Delete user:', id);
      return true;
    },
    loading: false,
    error: null
  };
}

export function useUserManagement() {
  const users = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleCreateUser = useCallback(async (userData: CreateUserRequest) => {
    const success = await createUser.mutate(userData);
    if (success) {
      users.refetch();
    }
    return success;
  }, [createUser.mutate, users.refetch]);

  const handleUpdateUser = useCallback(async (id: string, updates: UpdateUserRequest) => {
    const success = await updateUser.mutate({ id, updates });
    if (success) {
      users.refetch();
    }
    return success;
  }, [updateUser.mutate, users.refetch]);

  const handleDeleteUser = useCallback(async (id: string) => {
    const success = await deleteUser.mutate(id);
    if (success) {
      users.refetch();
    }
    return success;
  }, [deleteUser.mutate, users.refetch]);

  return {
    users: users.data,
    pagination: users.pagination,
    loading: users.loading,
    error: users.error,
    
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    
    changePage: users.changePage,
    changeLimit: users.changeLimit,
    sort: users.sort,
    refetch: users.refetch,
    
    createLoading: createUser.loading,
    updateLoading: updateUser.loading,
    deleteLoading: deleteUser.loading,
    
    createError: createUser.error,
    updateError: updateUser.error,
    deleteError: deleteUser.error
  };
}
