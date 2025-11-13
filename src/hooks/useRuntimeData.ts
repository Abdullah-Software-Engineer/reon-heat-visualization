import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRuntimeData } from '../api';
import type { RuntimeDataResponse, ApiError } from '../api';

interface UseRuntimeDataOptions {
  /**
   * Enable automatic polling for real-time updates
   * @default true
   */
  enablePolling?: boolean;
  /**
   * Polling interval in milliseconds
   * @default 30000 (30 seconds)
   */
  pollingInterval?: number;
}

interface UseRuntimeDataReturn {
  data: RuntimeDataResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  isPolling: boolean;
}

/**
 * Deep comparison helper to check if data has actually changed
 */
function hasDataChanged(
  oldData: RuntimeDataResponse | null,
  newData: RuntimeDataResponse | null
): boolean {
  if (!oldData && !newData) return false;
  if (!oldData || !newData) return true;
  
  // Compare JSON strings for deep equality
  return JSON.stringify(oldData) !== JSON.stringify(newData);
}

/**
 * Custom hook for fetching and managing runtime data with real-time updates
 */
export const useRuntimeData = (
  options: UseRuntimeDataOptions = {}
): UseRuntimeDataReturn => {
  const {
    enablePolling = true,
    pollingInterval = 30000, // 30 seconds default
  } = options;

  const [data, setData] = useState<RuntimeDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitialMountRef = useRef<boolean>(true);

  const fetchData = useCallback(async (silent = false) => {
    try {
      // Only show loading state on initial fetch or manual refetch
      if (!silent || isInitialMountRef.current) {
        setLoading(true);
      }
      setError(null);
      
      const result = await fetchRuntimeData();
      
      // Only update if data has actually changed
      setData((prevData) => {
        if (hasDataChanged(prevData, result)) {
          return result;
        }
        return prevData;
      });
    } catch (err) {
      // Only set error if not in silent mode (to avoid disrupting UI during polling)
      if (!silent) {
        setError(err as ApiError);
      } else {
        // Log polling errors silently
        console.warn('Failed to fetch data during polling:', err);
      }
    } finally {
      if (!silent || isInitialMountRef.current) {
        setLoading(false);
      }
      isInitialMountRef.current = false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling
  useEffect(() => {
    if (!enablePolling || pollingInterval <= 0) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchData(true); // Silent fetch during polling
    }, pollingInterval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [enablePolling, pollingInterval, fetchData]);

  return { data, loading, error, refetch: () => fetchData(false), isPolling };
};

