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
  const { data, loading, error, refetch, isPolling } = useRuntimeData();
  const chartRef = useRef<ReactECharts>(null);

  const allDates = useMemo(() => (data ? extractDates(data) : []), [data]);

  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Initialize date range when data is loaded
  useEffect(() => {
    if (allDates.length > 0 && !dateRange.start) {
      setDateRange({ start: allDates[0], end: allDates[allDates.length - 1] });
    }
  }, [allDates, dateRange.start]);

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

  const handleDownload = useCallback(() => {
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
    } catch (error) {
      console.error('Failed to download chart:', error);
    }
  }, [dateRange]);

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

  if (loading) {
    return (
      <div className="w-full h-screen p-5 flex items-center justify-center">
        <p className="text-white">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen p-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-2">Error loading data</p>
          <p className="text-white/70 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || !allDates.length) {
    return (
      <div className="w-full h-screen p-5 flex items-center justify-center">
        <p className="text-white">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen p-5">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="m-0 text-xl font-medium text-white">
            Runtime Report
          </h1>
          {isPolling && (
            <div className="flex items-center gap-2 text-xs text-white/70" title="Real-time updates active">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <label className="text-sm text-white">From:</label>
            <input
              type="date"
              value={dateRange.start}
              min={allDates[0]}
              max={allDates[allDates.length - 1]}
              onChange={handleDateChange('start')}
              className="px-2 py-2 rounded border border-gray-300 text-sm bg-white text-gray-800"
            />
            <label className="text-sm text-white">To:</label>
            <input
              type="date"
              value={dateRange.end}
              min={allDates[0]}
              max={allDates[allDates.length - 1]}
              onChange={handleDateChange('end')}
              className="px-2 py-2 rounded border border-gray-300 text-sm bg-white text-gray-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="px-3 py-2 rounded border border-gray-300 text-sm font-medium bg-white/10 text-white cursor-pointer flex items-center gap-2 transition-colors duration-250 hover:bg-white/20"
              aria-label="Refresh data"
              title="Refresh data"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded border border-transparent text-sm font-medium bg-[#646cff] text-white cursor-pointer flex items-center gap-2 transition-colors duration-250 hover:bg-[#535bf2]"
              aria-label="Download chart as PNG"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-white/20 mb-4" />
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
