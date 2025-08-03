import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../types/api';

// Generic API Hook
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Mutation Hook for API calls that modify data
export function useMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(params);
      
      if (response.success) {
        setData(response.data || null);
        return true;
      } else {
        setError(response.error || 'An error occurred');
        return false;
      }
    } catch (err) {
      setError('Network error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}

// Paginated API Hook
export function usePaginatedApi<T>(
  apiCall: (params?: PaginationParams) => Promise<ApiResponse<PaginatedResponse<T>>>,
  initialParams: PaginationParams = { page: 1, limit: 10 }
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: initialParams.page,
    limit: initialParams.limit,
    totalPages: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PaginationParams>(initialParams);

  const fetchData = useCallback(async (newParams?: PaginationParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentParams = newParams || params;
      const response = await apiCall(currentParams);
      
      if (response.success && response.data) {
        setData(response.data.items);
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages
        });
        if (newParams) {
          setParams(newParams);
        }
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall, params]);

  useEffect(() => {
    fetchData();
  }, []);

  const changePage = useCallback((page: number) => {
    fetchData({ ...params, page });
  }, [fetchData, params]);

  const changeLimit = useCallback((limit: number) => {
    fetchData({ ...params, limit, page: 1 });
  }, [fetchData, params]);

  const sort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    fetchData({ ...params, sortBy, sortOrder, page: 1 });
  }, [fetchData, params]);

  const refetch = useCallback(() => {
    fetchData(params);
  }, [fetchData, params]);

  return { 
    data, 
    pagination, 
    loading, 
    error, 
    changePage, 
    changeLimit, 
    sort, 
    refetch 
  };
}
