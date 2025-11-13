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
 * Creates visual map configuration for the heatmap chart
 */
export const createVisualMap = (data: RuntimeDataResponse) => {
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

  return {
    type: 'piecewise' as const,
    min: 0,
    max: 13,
    pieces,
    left: 'center',
    top: 'top',
    orient: 'horizontal' as const,
    itemWidth: 20,
    itemHeight: 14,
    itemGap: 15,
    textStyle: { color: '#333', fontSize: 12 },
    showLabel: true,
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
  const visualMap = createVisualMap(data);
  const seriesData: Array<[number, number, number]> = heatmapData.map(
    (item) => [item.timeIndex, item.dateIndex, item.value]
  );
  const shouldAnimate = enableAnimation && heatmapData.length < 10000;

  return {
    tooltip: {
      position: 'top' as const,
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: createTooltipFormatter(data, timeSlots, filteredDates) as any,
      trigger: 'item' as const,
      enterable: true, // Allow mouse to enter tooltip
      confine: true, // Keep tooltip within viewport
      hideDelay: 100 // Small delay before hiding
    },
    grid: { 
      height: '70%', 
      top: '15%', 
      left: '10%', 
      right: '10%' 
    },
    dataZoom: [
      {
        type: 'inside' as const,
        xAxisIndex: [0],
        start: 0,
        end: 100
      },
      {
        type: 'inside' as const,
        yAxisIndex: [0],
        start: 0,
        end: 100
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

