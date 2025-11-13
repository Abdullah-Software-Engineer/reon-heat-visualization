/**
 * Type definitions for Runtime Data API
 */

export interface RuntimeSource {
  color: string;
  display: string;
  name: string;
  value: number;
  desc: string;
}

export interface RuntimeDataPoint {
  time: string;
  rtsources: number;
  sys_volt: number;
  batt_curr: number;
  batt_volt: number;
  rect_curr: number;
  load_curr: number;
}

export interface RuntimeDataMeta {
  sources: RuntimeSource[];
}

export interface RuntimeDataResponse {
  meta: RuntimeDataMeta;
  data: Record<string, RuntimeDataPoint[]>;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
}

