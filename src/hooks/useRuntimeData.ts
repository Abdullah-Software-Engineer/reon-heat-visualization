import { useState, useEffect, useCallback } from 'react';
import { fetchRuntimeData } from '../api';
import type { RuntimeDataResponse, ApiError } from '../api';

interface UseRuntimeDataReturn {
  data: RuntimeDataResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing runtime data
 */
export const useRuntimeData = (): UseRuntimeDataReturn => {
  const [data, setData] = useState<RuntimeDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchRuntimeData();
      setData(result);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

