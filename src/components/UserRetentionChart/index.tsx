import { useState, useEffect } from 'react';
import { Card, Select, Spin, message } from 'antd';
import { UserOutlined, HeartOutlined } from '@ant-design/icons';
import Chart from '@/components/Chart';
import { statisticsService } from '@/services/translationService';
import type { EChartsOption } from 'echarts';

const { Option } = Select;

interface UserRetentionChartProps {
  className?: string;
}

function UserRetentionChart({ className }: UserRetentionChartProps) {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartData, setChartData] = useState<Array<{ period: string; retentionRate: number }>>([]);

  useEffect(() => {
    loadUserRetentionData();
  }, [period]);

  const loadUserRetentionData = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getUserRetentionData(period);
      setChartData(data);
    } catch (error) {
      message.error('加载用户留存数据失败');
      console.error('加载用户留存数据失败:', error);
      
      // 使用模拟数据
      const mockData = generateMockData(period);
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (period: '7d' | '30d' | '90d'): Array<{ period: string; retentionRate: number }> => {
    const data: Array<{ period: string; retentionRate: number }> = [];
    const now = new Date();
    
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // 生成模拟留存率数据（通常在60-90%之间）
      const retentionRate = Math.floor(Math.random() * 30) + 60;
      
      data.push({
        period: date.toISOString().split('T')[0],
        retentionRate,
      });
    }
    
    return data;
  };

  const getChartOption = (): EChartsOption => {
    const periods = chartData.map(item => item.period);
    const retentionRates = chartData.map(item => item.retentionRate);

    return {
      title: {
        text: '用户留存率趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (params: any) => {
          const data = params[0];
          const date = data.axisValue;
          const retentionRate = data.value;
          
          return `
            <div style="padding: 8px;">
              <div style="margin-bottom: 4px;"><strong>${date}</strong></div>
              <div style="color: #52c41a;">留存率: ${retentionRate}%</div>
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: periods,
        axisLabel: {
          formatter: (value: string) => {
            // 根据周期格式化日期显示
            if (period === '7d') {
              return new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
            } else if (period === '30d') {
              return new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
            } else {
              return new Date(value).toLocaleDateString('zh-CN', { month: 'short' });
            }
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '留存率 (%)',
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: '留存率',
          type: 'line',
          data: retentionRates,
          smooth: true,
          lineStyle: {
            color: '#52c41a',
            width: 3,
          },
          itemStyle: {
            color: '#52c41a',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
              ],
            },
          },
          symbol: 'circle',
          symbolSize: 6,
          markLine: {
            data: [
              {
                yAxis: 80,
                name: '目标留存率',
                lineStyle: {
                  color: '#faad14',
                  type: 'dashed',
                },
                label: {
                  formatter: '目标: 80%',
                  position: 'end',
                },
              },
            ],
          },
        },
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
    };
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <HeartOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            用户留存率趋势
          </span>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 100 }}
            size="small"
          >
            <Option value="7d">7天</Option>
            <Option value="30d">30天</Option>
            <Option value="90d">90天</Option>
          </Select>
        </div>
      }
      className={className}
      style={{ height: 400 }}
    >
      <Spin spinning={loading}>
        <Chart
          option={getChartOption()}
          height={300}
          loading={loading}
        />
      </Spin>
    </Card>
  );
}

export default UserRetentionChart;
