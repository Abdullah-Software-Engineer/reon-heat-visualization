import type { RuntimeDataResponse, RuntimeDataPoint, RuntimeSource } from '../api/types/runtime-data.types';
import type { EChartsOption } from 'echarts';
import type { HeatmapDataPoint } from './heatmap.utils';

const ALLOWED_SOURCES = [
  'Battery',
  'Battery Solar',
  'Genset Battery',
  'Genset Solar Battery',
] as const;

/**
 * Detects if the current device is mobile
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Creates visual map configuration for the heatmap chart
 */
export const createVisualMap = (data: RuntimeDataResponse) => {
  const isMobile = isMobileDevice();
  const pieces = data.meta.sources
    .filter((source): source is RuntimeSource =>
      ALLOWED_SOURCES.includes(source.display as (typeof ALLOWED_SOURCES)[number])
    )
    .map((source) => ({
      min: source.value,
      max: source.value,
      color: source.color,
      label: source.display,
    }));

  // Mobile-specific adjustments
  if (isMobile) {
    // Truncate labels for mobile to prevent cutting
    const truncatedPieces = pieces.map(piece => ({
      ...piece,
      label: piece.label.length > 15 ? piece.label.substring(0, 15) + '...' : piece.label
    }));

    return {
      type: 'piecewise' as const,
      min: 0,
      max: 13,
      pieces: truncatedPieces,
      left: 'center',
      top: 'top',
      orient: 'horizontal' as const, // Keep horizontal but with better spacing
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 6, // Reduced gap for mobile
      textStyle: { 
        color: '#333', 
        fontSize: 9, // Smaller font for mobile
      },
      showLabel: true,
      // Add padding to prevent cutting
      padding: [5, 10, 5, 10],
      // Invert selection to show selected items
      inverse: false,
    };
  }

  // Desktop configuration
  return {
    type: 'piecewise' as const,
    min: 0,
    max: 13,
    pieces,
    left: 'center',
    top: 'top',
    orient: 'horizontal' as const,
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 15,
    textStyle: { color: '#333', fontSize: 12 },
    showLabel: true,
  };
};

/**
 * Creates smart tooltip positioning function that avoids blocking cells
 */
const createSmartTooltipPosition = () => {
  return (
    point: [number, number],
    _params: any,
    _dom: HTMLElement,
    _rect: any,
    size: { contentSize: [number, number]; viewSize: [number, number] }
  ): [number, number] => {
    const [x, y] = point;
    const [contentWidth, contentHeight] = size.contentSize;
    const [viewWidth, viewHeight] = size.viewSize;
    
    // Padding from the cursor to avoid tooltip blocking the cell
    const cursorPadding = 10;
    // Minimum space required for tooltip
    const tooltipPadding = 15;
    
    // Calculate available space in each direction
    const spaceTop = y;
    const spaceBottom = viewHeight - y;
    const spaceLeft = x;
    const spaceRight = viewWidth - x;
    
    // Estimate tooltip dimensions (with some padding)
    const tooltipWidth = contentWidth + tooltipPadding * 2;
    const tooltipHeight = contentHeight + tooltipPadding * 2;
    
    // Determine best position based on available space and cursor position
    // Priority: avoid blocking the cursor path to other cells
    let posX: number;
    let posY: number;
    
    // Horizontal positioning: prefer right side, fallback to left
    if (spaceRight >= tooltipWidth + cursorPadding) {
      // Position to the right of cursor
      posX = x + cursorPadding;
    } else if (spaceLeft >= tooltipWidth + cursorPadding) {
      // Position to the left of cursor
      posX = x - tooltipWidth - cursorPadding;
    } else {
      // Center horizontally if neither side has enough space
      posX = Math.max(tooltipPadding, Math.min(viewWidth - tooltipWidth - tooltipPadding, x - tooltipWidth / 2));
    }
    
    // Vertical positioning: 
    // For upper cells (top 35% of viewport), always show below
    // For mid and bottom cells, prefer bottom, fallback to top
    const isUpperCell = y < viewHeight * 0.35;
    
    if (isUpperCell) {
      // For upper cells, always position below
      posY = y + cursorPadding;
      // If there's not enough space below, position it as low as possible while staying below
      if (spaceBottom < tooltipHeight + cursorPadding) {
        posY = Math.min(y + cursorPadding, viewHeight - tooltipHeight - tooltipPadding);
      }
    } else {
      // For mid and bottom cells, prefer bottom, fallback to top
      if (spaceBottom >= tooltipHeight + cursorPadding) {
        // Position below cursor
        posY = y + cursorPadding;
      } else if (spaceTop >= tooltipHeight + cursorPadding) {
        // Position above cursor
        posY = y - tooltipHeight - cursorPadding;
      } else {
        // Center vertically if neither side has enough space
        posY = Math.max(tooltipPadding, Math.min(viewHeight - tooltipHeight - tooltipPadding, y - tooltipHeight / 2));
      }
    }
    
    // Ensure tooltip stays within viewport bounds
    posX = Math.max(tooltipPadding, Math.min(posX, viewWidth - tooltipWidth - tooltipPadding));
    posY = Math.max(tooltipPadding, Math.min(posY, viewHeight - tooltipHeight - tooltipPadding));
    
    return [posX, posY];
  };
};

/**
 * Creates tooltip formatter for heatmap chart
 */
const createTooltipFormatter = (
  data: RuntimeDataResponse,
  timeSlots: string[],
  filteredDates: string[]
) => {
  return (params: any): string => {
    if (!Array.isArray(params.data) || params.data.length < 2) {
      return '';
    }

    const [timeIndex, dateIndex] = params.data;
    const time = timeSlots[timeIndex];
    const date = filteredDates[dateIndex];

    if (!date || !time) return '';

    const entries = data.data[date];
    if (!entries || !entries[timeIndex]) return '';

    const entry: RuntimeDataPoint = entries[timeIndex];
    const source = data.meta.sources.find((s) => s.value === entry.rtsources);

    return `
      <div style="padding:8px;color:#fff;">
        <strong>Time:</strong> ${time}<br/>
        <strong>Source:</strong> ${source?.display ?? 'Unknown'}<br/>
        <strong>Description:</strong> ${source?.desc ?? 'N/A'}<br/>
        <strong>Battery Voltage:</strong> ${entry.batt_volt}<br/>
        <strong>Rect Current:</strong> ${entry.rect_curr}<br/>
        <strong>Battery Current:</strong> ${entry.batt_curr}<br/>
        <strong>Load Current:</strong> ${entry.load_curr}
      </div>
    `;
  };
};

/**
 * Creates ECharts configuration for the heatmap
 */
export const createChartOptions = (
  data: RuntimeDataResponse,
  timeSlots: string[],
  filteredDates: string[],
  heatmapData: HeatmapDataPoint[],
  enableAnimation: boolean = false
): EChartsOption => {
  const isMobile = isMobileDevice();
  const visualMap = createVisualMap(data);
  const seriesData: Array<[number, number, number]> = heatmapData.map(
    (item) => [item.timeIndex, item.dateIndex, item.value]
  );
  const shouldAnimate = enableAnimation && heatmapData.length < 10000;

  // Mobile-optimized tooltip configuration
  const tooltipConfig = isMobile ? {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    textStyle: { color: '#fff', fontSize: 12 },
    formatter: createTooltipFormatter(data, timeSlots, filteredDates) as any,
    trigger: 'item' as const,
    enterable: false, // Disable on mobile for better touch interaction
    confine: true, // Keep tooltip within viewport
    hideDelay: 0, // Close instantly when moving away
    showDelay: 0, // Show immediately on touch
    // Better positioning for mobile - show below for upper cells
    position: function (point: [number, number], _params: any, _dom: HTMLElement, _rect: any, size: any) {
      const [x, y] = point;
      const [contentWidth, contentHeight] = size.contentSize;
      const [viewWidth, viewHeight] = size.viewSize;
      
      // Center the tooltip horizontally on mobile
      const tooltipX = Math.max(10, Math.min(viewWidth - contentWidth - 10, x - contentWidth / 2));
      
      // For upper cells (top 35% of viewport), always show below
      // For mid and bottom cells, show above (to avoid blocking the cell)
      const isUpperCell = y < viewHeight * 0.35;
      const cursorPadding = 15;
      
      let tooltipY: number;
      if (isUpperCell) {
        // For upper cells, position below the touch point
        tooltipY = y + cursorPadding;
        // Ensure it stays within viewport
        tooltipY = Math.min(tooltipY, viewHeight - contentHeight - 10);
      } else {
        // For mid and bottom cells, position above the touch point
        tooltipY = y - contentHeight - cursorPadding;
        // Ensure it stays within viewport
        tooltipY = Math.max(10, tooltipY);
      }
      
      return [tooltipX, tooltipY];
    }
  } : {
    position: createSmartTooltipPosition() as any,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    textStyle: { color: '#fff' },
    formatter: createTooltipFormatter(data, timeSlots, filteredDates) as any,
    trigger: 'item' as const,
    enterable: true, // Allow mouse to enter tooltip on desktop
    confine: true, // Keep tooltip within viewport
    hideDelay: 0 // Close instantly when moving away
  };

  return {
    tooltip: tooltipConfig as any,
    grid: { 
      height: '70%', 
      top: '8%', 
      left: '10%', 
      right: '10%' 
    },
    dataZoom: [
      {
        type: 'inside' as const,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false,
        preventDefaultMouseMove: true
      },
      {
        type: 'inside' as const,
        yAxisIndex: [0],
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false,
        preventDefaultMouseMove: true
      }
    ],
    xAxis: {
      type: 'category' as const,
      data: timeSlots,
      splitArea: { show: true },
      axisLabel: {
        interval: 47,
        rotate: 45,
        fontSize: 10,
        formatter: (val: string) => val.split(':')[0] + ':00'
      },
      silent: false
    },
    yAxis: {
      type: 'category' as const,
      data: filteredDates,
      splitArea: { show: true },
      axisLabel: { fontSize: 11 }
    },
    visualMap,
    animation: shouldAnimate,
    animationDuration: shouldAnimate ? 750 : 0,
    animationEasing: shouldAnimate ? 'cubicOut' : 'linear',
    animationDelayUpdate: shouldAnimate ? (idx: number) => idx * 2 : 0,
    series: [
      {
        name: 'Runtime Sources',
        type: 'heatmap' as const,
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.5)',
            borderWidth: 2,
            borderColor: '#fff'
          },
          focus: 'none' as const
        },
        select: {
          itemStyle: {
            borderWidth: 2,
            borderColor: '#646cff'
          }
        }
      }
    ]
  };
};

