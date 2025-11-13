/**
 * Runtime Data Service
 * Handles fetching and managing runtime data from the API
 */

import type { RuntimeDataResponse, ApiError } from '../types/runtime-data.types';

class RuntimeDataService {
  private readonly baseUrl: string;
  private cache: RuntimeDataResponse | null = null;
  private cacheTimestamp: number | null = null;
  private readonly cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches runtime data from the API
   * @param useCache - Whether to use cached data if available (default: true)
   * @returns Promise resolving to runtime data response
   * @throws ApiError if the request fails
   */
  async fetchRuntimeData(useCache: boolean = true): Promise<RuntimeDataResponse> {
    // Check cache if enabled
    if (useCache && this.cache && this.cacheTimestamp) {
      const now = Date.now();
      if (now - this.cacheTimestamp < this.cacheDuration) {
        return this.cache;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/runtime-data.json`);

      if (!response.ok) {
        throw this.createApiError(
          `Failed to fetch runtime data: ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      const data: RuntimeDataResponse = await response.json();

      // Validate response structure
      this.validateResponse(data);

      // Update cache
      this.cache = data;
      this.cacheTimestamp = Date.now();

      return data;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      // Network or parsing error
      throw this.createApiError(
        error instanceof Error ? error.message : 'Unknown error occurred while fetching runtime data',
        0,
        'Network Error'
      );
    }
  }

  /**
   * Validates the structure of the API response
   * @param data - The response data to validate
   * @throws ApiError if validation fails
   */
  private validateResponse(data: unknown): asserts data is RuntimeDataResponse {
    if (!data || typeof data !== 'object') {
      throw this.createApiError('Invalid response: data is not an object');
    }

    const response = data as Partial<RuntimeDataResponse>;

    if (!response.meta || typeof response.meta !== 'object') {
      throw this.createApiError('Invalid response: missing or invalid meta field');
    }

    if (!Array.isArray(response.meta.sources)) {
      throw this.createApiError('Invalid response: meta.sources is not an array');
    }

    if (!response.data || typeof response.data !== 'object') {
      throw this.createApiError('Invalid response: missing or invalid data field');
    }
  }

  /**
   * Creates a standardized API error object
   */
  private createApiError(
    message: string,
    status?: number,
    statusText?: string
  ): ApiError {
    const error: ApiError = {
      message,
      ...(status && { status }),
      ...(statusText && { statusText }),
    };

    return error;
  }

  /**
   * Clears the cached data
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Gets cached data without making a network request
   * @returns Cached data or null if no cache exists
   */
  getCachedData(): RuntimeDataResponse | null {
    if (this.cache && this.cacheTimestamp) {
      const now = Date.now();
      if (now - this.cacheTimestamp < this.cacheDuration) {
        return this.cache;
      }
    }
    return null;
  }
}

// Export singleton instance
export const runtimeDataService = new RuntimeDataService();

// Export class for custom instances
export { RuntimeDataService };

