import { useCallback } from 'react';
import { mockApi } from '../services/mockApi';
import { Event, CreateEventRequest, UpdateEventRequest, PaginationParams } from '../types/api';
import { usePaginatedApi, useMutation, useApi } from './useApi';

// Hook for paginated events list
export function useEvents(params?: PaginationParams) {
  return usePaginatedApi(
    (paginationParams) => mockApi.getEvents(paginationParams),
    params
  );
}

// Hook for single event
export function useEvent(id: string) {
  return useApi(
    () => mockApi.getEventById(id),
    [id]
  );
}

// Hook for creating event
export function useCreateEvent() {
  return useMutation<Event, CreateEventRequest>(
    (eventData) => mockApi.createEvent(eventData)
  );
}

// Hook for updating event
export function useUpdateEvent() {
  return useMutation<Event, { id: string; updates: UpdateEventRequest }>(
    ({ id, updates }) => mockApi.updateEvent(id, updates)
  );
}

// Hook for deleting event
export function useDeleteEvent() {
  return useMutation<null, string>(
    (id) => mockApi.deleteEvent(id)
  );
}

// Combined events management hook
export function useEventManagement() {
  const events = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const handleCreateEvent = useCallback(async (eventData: CreateEventRequest) => {
    const success = await createEvent.mutate(eventData);
    if (success) {
      events.refetch();
    }
    return success;
  }, [createEvent.mutate, events.refetch]);

  const handleUpdateEvent = useCallback(async (id: string, updates: UpdateEventRequest) => {
    const success = await updateEvent.mutate({ id, updates });
    if (success) {
      events.refetch();
    }
    return success;
  }, [updateEvent.mutate, events.refetch]);

  const handleDeleteEvent = useCallback(async (id: string) => {
    const success = await deleteEvent.mutate(id);
    if (success) {
      events.refetch();
    }
    return success;
  }, [deleteEvent.mutate, events.refetch]);

  return {
    // Data and states
    events: events.data,
    pagination: events.pagination,
    loading: events.loading,
    error: events.error,
    
    // Actions
    createEvent: handleCreateEvent,
    updateEvent: handleUpdateEvent,
    deleteEvent: handleDeleteEvent,
    
    // Pagination
    changePage: events.changePage,
    changeLimit: events.changeLimit,
    sort: events.sort,
    refetch: events.refetch,
    
    // Mutation states
    createLoading: createEvent.loading,
    updateLoading: updateEvent.loading,
    deleteLoading: deleteEvent.loading,
    
    createError: createEvent.error,
    updateError: updateEvent.error,
    deleteError: deleteEvent.error
  };
}
