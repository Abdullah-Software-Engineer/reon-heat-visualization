import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { useRuntimeData } from '../hooks';
import {
  extractDates,
  filterDatesByRange,
  extractTimeSlots,
  transformToHeatmapData,
} from '../utils';
import { createChartOptions } from '../utils';

interface HeatmapProps {
  enableAnimation?: boolean;
}

const Heatmap: React.FC<HeatmapProps> = ({ enableAnimation = true }) => {
  const { data, loading, error } = useRuntimeData();
  const chartRef = useRef<ReactECharts>(null);

  const allDates = useMemo(() => (data ? extractDates(data) : []), [data]);

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize date range when data is loaded
  useEffect(() => {
    if (allDates.length > 0 && !dateRange.start) {
      setDateRange({ start: allDates[0], end: allDates[allDates.length - 1] });
    }
  }, [allDates, dateRange.start]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false);
      }
    };

    if (showDatePicker || showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, showDownloadDropdown]);

  const filteredDates = useMemo(
    () => filterDatesByRange(allDates, dateRange.start, dateRange.end),
    [allDates, dateRange.start, dateRange.end]
  );

  const timeSlots = useMemo(
    () => (data ? extractTimeSlots(data, allDates) : []),
    [data, allDates]
  );

  const heatmapData = useMemo(
    () => (data ? transformToHeatmapData(data, filteredDates) : []),
    [data, filteredDates]
  );

  const chartOptions = useMemo(() => {
    if (!data) return {};
    return createChartOptions(data, timeSlots, filteredDates, heatmapData, enableAnimation);
  }, [data, timeSlots, filteredDates, heatmapData, enableAnimation]);

  const handleDownloadImage = useCallback(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    try {
      const url = chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff',
      });

      const link = document.createElement('a');
      link.download = `runtime-report-${dateRange.start}-${dateRange.end}.png`;
      link.href = url;
      link.click();
      setShowDownloadDropdown(false);
    } catch (error) {
      console.error('Failed to download chart:', error);
    }
  }, [dateRange]);

  const handleDownloadData = useCallback(() => {
    if (!data) return;

    try {
      // Collect all data points for filtered dates
      const csvRows: string[] = [];
      
      // CSV Header
      csvRows.push('Date,Time,rtsources,sys_volt,batt_curr,batt_volt,rect_curr,load_curr');
      
      // Add data rows
      filteredDates.forEach((date) => {
        const entries = data.data[date];
        if (entries) {
          entries.forEach((entry) => {
            csvRows.push(
              `${date},${entry.time},${entry.rtsources},${entry.sys_volt},${entry.batt_curr},${entry.batt_volt},${entry.rect_curr},${entry.load_curr}`
            );
          });
        }
      });

      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.href = url;
      link.download = `runtime-data-${dateRange.start}-${dateRange.end}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
      setShowDownloadDropdown(false);
    } catch (error) {
      console.error('Failed to download data:', error);
    }
  }, [data, filteredDates, dateRange]);

  const handleDateChange = useCallback(
    (type: 'start' | 'end') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      if (type === 'start' && newDate <= dateRange.end) {
        setDateRange((prev) => ({ ...prev, start: newDate }));
      } else if (type === 'end' && newDate >= dateRange.start) {
        setDateRange((prev) => ({ ...prev, end: newDate }));
      }
    },
    [dateRange]
  );

  const formatDateRange = useCallback(() => {
    if (!dateRange.start || !dateRange.end) return '';
    return `${dateRange.start} ~ ${dateRange.end}`;
  }, [dateRange]);

  const handleReset = useCallback(() => {
    if (allDates.length > 0) {
      setDateRange({ start: allDates[0], end: allDates[allDates.length - 1] });
    }
  }, [allDates]);

  if (loading) {
    return (
      <div className="w-full h-screen p-5 flex items-center justify-center">
        <p className="text-gray-800">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen p-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 text-lg mb-2">Error loading data</p>
          <p className="text-gray-800/70 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || !allDates.length) {
    return (
      <div className="w-full h-screen p-5 flex items-center justify-center">
        <p className="text-gray-800">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen p-5">
      <div className="flex justify-between items-center mb-1 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-lg font-medium text-gray-500">
            Runtime Report 2.0
          </h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2" ref={datePickerRef}>
            <div className="relative">
              <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-3 py-2 rounded border border-gray-300 text-sm bg-white text-gray-800 cursor-pointer min-w-[200px]"
              >
                {formatDateRange() || 'Select date range'}
              </div>
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-4 z-50 flex flex-col gap-3 min-w-[300px]">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-800 whitespace-nowrap">From:</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      min={allDates[0]}
                      max={allDates[allDates.length - 1]}
                      onChange={handleDateChange('start')}
                      className="px-2 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-800 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-800 whitespace-nowrap">To:</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      min={allDates[0]}
                      max={allDates[allDates.length - 1]}
                      onChange={handleDateChange('end')}
                      className="px-2 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-800 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors flex-1"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors flex-1"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={downloadDropdownRef}>
              <button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="w-10 h-10 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer transition-colors duration-250 hover:bg-gray-50"
                aria-label="Download options"
                title="Download"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="text-gray-600"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              {showDownloadDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[160px]">
                  <button
                    onClick={handleDownloadImage}
                    className="w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-600"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Download Image
                  </button>
                  <button
                    onClick={handleDownloadData}
                    className="w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-600"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* horizontal line */}
      <hr className="w-full h-2px text-gray-400 mb-1" />
      {/* heatmap chart */}
      <ReactECharts
        ref={chartRef}
        option={chartOptions}
        style={{ height: 'calc(100vh - 200px)', width: '100%' }}
        opts={{ 
          renderer: 'canvas',
          devicePixelRatio: window.devicePixelRatio || 1
        }}
        notMerge={false}
      />
    </div>
  );
};

export default Heatmap;
