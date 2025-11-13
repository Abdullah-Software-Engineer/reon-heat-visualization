/**
 * Runtime Data Service
 * Simple API service for fetching runtime data
 */

import type { RuntimeDataResponse, ApiError } from '../types/runtime-data.types';

/**
 * Fetches runtime data from the API
 */
export async function fetchRuntimeData(): Promise<RuntimeDataResponse> {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/runtime-data.json';
  
  try {
    const response = await fetch(apiEndpoint);
    
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

