declare module 'echarts-for-react' {
  import { Component } from 'react';
  import { EChartsOption } from 'echarts';

  export interface ReactEChartsProps {
    option: EChartsOption;
    style?: React.CSSProperties;
    opts?: {
      renderer?: 'canvas' | 'svg';
      devicePixelRatio?: number;
    };
    onEvents?: Record<string, Function>;
    loadingOption?: object;
    showLoading?: boolean;
    theme?: string;
    notMerge?: boolean;
    lazyUpdate?: boolean;
  }

  export default class ReactECharts extends Component<ReactEChartsProps> {
    getEchartsInstance(): any;
  }
}

