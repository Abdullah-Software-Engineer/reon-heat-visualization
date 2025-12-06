import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useRuntimeData } from '../hooks';
import {
  extractDates,
  filterDatesByRange,
  extractTimeSlots,
  transformToHeatmapData,
} from '../utils';
import { createChartOptions } from '../utils';
import DateRangePicker, { type DateRange } from './DateRangePicker';
import DownloadButton from './DownloadButton';
import Loader from './Loader';

interface HeatmapProps {
  enableAnimation?: boolean;
}

const Heatmap: React.FC<HeatmapProps> = ({ enableAnimation = true }) => {
  const { data, loading, error } = useRuntimeData();
  const chartRef = useRef<ReactECharts>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  const allDates = useMemo(() => (data ? extractDates(data) : []), [data]);

  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });

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

  // Handle window resize to update chart on mobile/desktop switch
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Force chart resize
      const chart = chartRef.current?.getEchartsInstance();
      if (chart) {
        chart.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const chartOptions = useMemo(() => {
    if (!data) return {};
    return createChartOptions(data, timeSlots, filteredDates, heatmapData, enableAnimation);
  }, [data, timeSlots, filteredDates, heatmapData, enableAnimation, windowWidth]);

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
      csvRows.push('Date,Time,Source,Description,rtsources,sys_volt,batt_curr,batt_volt,rect_curr,load_curr');
      
      // Add data rows
      filteredDates.forEach((date) => {
        const entries = data.data[date];
        if (entries) {
          entries.forEach((entry) => {
            // Find the source information based on rtsources value
            const source = data.meta.sources.find((s) => s.value === entry.rtsources);
            const sourceDisplay = source?.display ?? 'Unknown';
            const sourceDesc = source?.desc ?? 'N/A';
            
            // Escape CSV values that might contain commas or quotes
            const escapeCsv = (value: string | number): string => {
              const str = String(value);
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            };
            
            csvRows.push(
              `${date},${entry.time},${escapeCsv(sourceDisplay)},${escapeCsv(sourceDesc)},${entry.rtsources},${entry.sys_volt},${entry.batt_curr},${entry.batt_volt},${entry.rect_curr},${entry.load_curr}`
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
    } catch (error) {
      console.error('Failed to download data:', error);
    }
  }, [data, filteredDates, dateRange]);


  if (loading) {
    return <Loader fullScreen message="Loading data..." />;
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

  const isMobile = windowWidth <= 768;

  return (
    <div className={`w-full h-screen ${isMobile ? 'px-3 py-4' : 'p-5'}`}>
      {isMobile ? (
        <>
          {/* Mobile: Title centered on its own line */}
          <h1 className="m-0 text-lg text-center mb-3 font-medium text-gray-500">
            Runtime Report 2.0
          </h1>
          
          {/* Mobile: Date picker and Download button - justify-between */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <DateRangePicker
              availableDates={allDates}
              value={dateRange}
              onChange={setDateRange}
            />
            <DownloadButton
              options={[
                {
                  label: 'Download Image',
                  onDownload: handleDownloadImage,
                },
                {
                  label: 'Download Data',
                  onDownload: handleDownloadData,
                },
              ]}
            />
          </div>
        </>
      ) : (
        /* Desktop: Title and controls on same line with justify-between */
        <div className="flex justify-between items-center mb-1 gap-4">
          <h1 className="m-0 text-lg font-medium text-gray-500">
            Runtime Report 2.0
          </h1>
          <div className="flex items-center gap-2">
            <DateRangePicker
              availableDates={allDates}
              value={dateRange}
              onChange={setDateRange}
            />
            <DownloadButton
              options={[
                {
                  label: 'Download Image',
                  onDownload: handleDownloadImage,
                },
                {
                  label: 'Download Data',
                  onDownload: handleDownloadData,
                },
              ]}
            />
          </div>
        </div>
      )}
      
      {/* horizontal line */}
      <hr className={`w-full border-gray-300 ${isMobile ? 'mb-2' : 'mb-3'}`} />
      
      {/* heatmap chart */}
      <ReactECharts
        ref={chartRef}
        option={chartOptions}
        style={{ height: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)', width: '100%' }}
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
