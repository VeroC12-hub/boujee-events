import { useCallback } from 'react';
import { vipService } from '../services/vipService';
import { VIPTier, VIPReservation, CreateVIPReservationRequest } from '../types/vip';
import { useApi, useMutation } from './useApi';

// Hook for VIP tiers
export function useVIPTiers() {
  return useApi(() => vipService.getVIPTiers());
}

// Hook for VIP reservations
export function useVIPReservations(eventId?: string) {
  return useApi(
    () => eventId ? vipService.getVIPReservations(eventId) : Promise.resolve({ success: false, error: 'No event ID provided', timestamp: new Date().toISOString() }),
    [eventId]
  );
}

// Hook for single VIP reservation
export function useVIPReservation(id: string) {
  return useApi(
    () => vipService.getVIPReservationById(id),
    [id]
  );
}

// Hook for creating VIP reservation
export function useCreateVIPReservation() {
  return useMutation<VIPReservation, CreateVIPReservationRequest>(
    (reservationData) => vipService.createVIPReservation(reservationData)
  );
}

// Hook for updating VIP reservation
export function useUpdateVIPReservation() {
  return useMutation<VIPReservation, { id: string; updates: Partial<VIPReservation> }>(
    ({ id, updates }) => vipService.updateVIPReservation(id, updates)
  );
}

// Hook for cancelling VIP reservation
export function useCancelVIPReservation() {
  return useMutation<null, string>(
    (id) => vipService.cancelVIPReservation(id)
  );
}

// Hook for VIP analytics
export function useVIPAnalytics(eventId?: string) {
  return useApi(
    () => eventId ? vipService.getVIPAnalytics(eventId) : Promise.resolve({ success: false, error: 'No event ID provided', timestamp: new Date().toISOString() }),
    [eventId]
  );
}

// Combined VIP management hook
export function useVIPManagement(eventId?: string) {
  const tiers = useVIPTiers();
  const reservations = useVIPReservations(eventId);
  const analytics = useVIPAnalytics(eventId);
  const createReservation = useCreateVIPReservation();
  const updateReservation = useUpdateVIPReservation();
  const cancelReservation = useCancelVIPReservation();

  const handleCreateReservation = useCallback(async (reservationData: CreateVIPReservationRequest) => {
    const success = await createReservation.mutate(reservationData);
    if (success) {
      reservations.refetch();
      tiers.refetch();
      analytics.refetch();
    }
    return success;
  }, [createReservation.mutate, reservations.refetch, tiers.refetch, analytics.refetch]);

  const handleUpdateReservation = useCallback(async (id: string, updates: Partial<VIPReservation>) => {
    const success = await updateReservation.mutate({ id, updates });
    if (success) {
      reservations.refetch();
      analytics.refetch();
    }
    return success;
  }, [updateReservation.mutate, reservations.refetch, analytics.refetch]);

  const handleCancelReservation = useCallback(async (id: string) => {
    const success = await cancelReservation.mutate(id);
    if (success) {
      reservations.refetch();
      tiers.refetch();
      analytics.refetch();
    }
    return success;
  }, [cancelReservation.mutate, reservations.refetch, tiers.refetch, analytics.refetch]);

  return {
    // Data
    tiers: tiers.data,
    reservations: reservations.data,
    analytics: analytics.data,
    
    // Loading states
    tiersLoading: tiers.loading,
    reservationsLoading: reservations.loading,
    analyticsLoading: analytics.loading,
    
    // Errors
    tiersError: tiers.error,
    reservationsError: reservations.error,
    analyticsError: analytics.error,
    
    // Actions
    createReservation: handleCreateReservation,
    updateReservation: handleUpdateReservation,
    cancelReservation: handleCancelReservation,
    
    // Mutation states
    createLoading: createReservation.loading,
    updateLoading: updateReservation.loading,
    cancelLoading: cancelReservation.loading,
    
    // Refetch
    refetchAll: () => {
      tiers.refetch();
      reservations.refetch();
      analytics.refetch();
    }
  };
}
