import { useCallback } from 'react';
import { mockApi } from '../services/mockApi';
import { User, CreateUserRequest, UpdateUserRequest, PaginationParams } from '../types/api';
import { usePaginatedApi, useMutation, useApi } from './useApi';

// Hook for paginated users list
export function useUsers(params?: PaginationParams) {
  return usePaginatedApi(
    (paginationParams) => mockApi.getUsers(paginationParams),
    params
  );
}

// Hook for single user
export function useUser(id: string) {
  return useApi(
    () => mockApi.getUserById(id),
    [id]
  );
}

// Hook for creating user
export function useCreateUser() {
  return useMutation<User, CreateUserRequest>(
    (userData) => mockApi.createUser(userData)
  );
}

// Hook for updating user
export function useUpdateUser() {
  return useMutation<User, { id: string; updates: UpdateUserRequest }>(
    ({ id, updates }) => mockApi.updateUser(id, updates)
  );
}

// Hook for deleting user
export function useDeleteUser() {
  return useMutation<null, string>(
    (id) => mockApi.deleteUser(id)
  );
}

// Combined users management hook
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
    // Data and states
    users: users.data,
    pagination: users.pagination,
    loading: users.loading,
    error: users.error,
    
    // Actions
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    
    // Pagination
    changePage: users.changePage,
    changeLimit: users.changeLimit,
    sort: users.sort,
    refetch: users.refetch,
    
    // Mutation states
    createLoading: createUser.loading,
    updateLoading: updateUser.loading,
    deleteLoading: deleteUser.loading,
    
    createError: createUser.error,
    updateError: updateUser.error,
    deleteError: deleteUser.error
  };
}
