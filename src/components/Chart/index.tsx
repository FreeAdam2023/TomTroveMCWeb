import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

export interface ChartProps {
  option: EChartsOption;
  height?: number | string;
  width?: number | string;
  className?: string;
  loading?: boolean;
  onChartReady?: (chart: echarts.ECharts) => void;
}

function Chart({
  option,
  height = 400,
  width = '100%',
  className,
  loading = false,
  onChartReady,
}: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);
    
    // 设置图表配置
    chartInstance.current.setOption(option);
    
    // 图表准备就绪回调
    onChartReady?.(chartInstance.current);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true);
    }
  }, [option]);

  useEffect(() => {
    if (chartInstance.current) {
      if (loading) {
        chartInstance.current.showLoading();
      } else {
        chartInstance.current.hideLoading();
      }
    }
  }, [loading]);

  return (
    <div
      ref={chartRef}
      className={className}
      style={{
        height,
        width,
        minHeight: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

export default Chart;
