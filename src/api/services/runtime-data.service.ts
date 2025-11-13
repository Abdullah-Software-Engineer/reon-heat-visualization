/**
 * Runtime Data Service
 * Simple API service for fetching runtime data
 */

import type { RuntimeDataResponse, ApiError } from '../types/runtime-data.types';

/**
 * Fetches runtime data from the API
 * @param skipCache - If true, adds a cache-busting query parameter to ensure fresh data
 */
export async function fetchRuntimeData(skipCache = true): Promise<RuntimeDataResponse> {
  let apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/runtime-data.json';
  
  // Add cache-busting parameter to ensure we get fresh data
  if (skipCache) {
    const separator = apiEndpoint.includes('?') ? '&' : '?';
    apiEndpoint = `${apiEndpoint}${separator}_t=${Date.now()}`;
  }
  
  try {
    const response = await fetch(apiEndpoint, {
      // Ensure we don't use cached responses
      cache: skipCache ? 'no-cache' : 'default',
      headers: {
        'Cache-Control': skipCache ? 'no-cache' : 'default',
      },
    });
    
    if (!response.ok) {
      throw {
        message: `Failed to fetch data: ${response.statusText}`,
        status: response.status,
        statusText: response.statusText,
      } as ApiError;
    }

    const data: RuntimeDataResponse = await response.json();
    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      throw error as ApiError;
    }
    
    throw {
      message: error instanceof Error ? error.message : 'Failed to fetch runtime data',
    } as ApiError;
  }
}

