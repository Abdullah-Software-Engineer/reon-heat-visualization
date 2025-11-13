import type { RuntimeDataResponse, RuntimeDataPoint } from '../api/types/runtime-data.types';

export interface HeatmapDataPoint {
  timeIndex: number;
  dateIndex: number;
  value: number;
}

/**
 * Extracts all unique dates from runtime data and returns them sorted
 */
export const extractDates = (data: RuntimeDataResponse): string[] => {
  return Object.keys(data.data).sort();
};

/**
 * Filters dates based on start and end date range
 */
export const filterDatesByRange = (
  allDates: string[],
  startDate: string,
  endDate: string
): string[] => {
  if (!startDate || !endDate || allDates.length === 0) {
    return [];
  }
  return allDates.filter((date) => date >= startDate && date <= endDate);
};

/**
 * Extracts time slots from the first available date in the data
 */
export const extractTimeSlots = (data: RuntimeDataResponse, allDates: string[]): string[] => {
  const firstDate = allDates[0];
  if (!firstDate) return [];
  
  const entries = data.data[firstDate];
  return entries ? entries.map(entry => entry.time) : [];
};

/**
 * Transforms runtime data into heatmap data points
 */
export const transformToHeatmapData = (
  data: RuntimeDataResponse,
  filteredDates: string[]
): HeatmapDataPoint[] => {
  const result: HeatmapDataPoint[] = [];

  filteredDates.forEach((date, dateIndex) => {
    const entries = data.data[date];
    if (!entries) return;

    entries.forEach((entry, timeIndex) => {
      result.push({
        timeIndex,
        dateIndex,
        value: entry.rtsources,
      });
    });
  });

  return result;
};

/**
 * Gets the entry for a specific date and time index
 */
export const getEntryByIndices = (
  data: RuntimeDataResponse,
  date: string,
  timeIndex: number
): RuntimeDataPoint | null => {
  const entries = data.data[date];
  if (!entries || !entries[timeIndex]) return null;
  return entries[timeIndex];
};

