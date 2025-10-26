import { useState, useEffect } from 'react';
import { Card, Select, Spin, message } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import Chart from '@/components/Chart';
import { statisticsService } from '@/services/translationService';
import type { Statistics } from '@/types';
import type { EChartsOption } from 'echarts';

const { Option } = Select;

interface UserGrowthChartProps {
  className?: string;
}

function UserGrowthChart({ className }: UserGrowthChartProps) {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartData, setChartData] = useState<Statistics['trends']['dailyUserGrowth']>([]);

  useEffect(() => {
    loadUserGrowthData();
  }, [period]);

  const loadUserGrowthData = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getUserGrowthData(period);
      setChartData(data as Statistics['trends']['dailyUserGrowth']);
    } catch (error) {
      message.error('加载用户增长数据失败');
      console.error('加载用户增长数据失败:', error);
      
      // 使用模拟数据
      const mockData = generateMockData(period);
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (period: '7d' | '30d' | '90d'): Statistics['trends']['dailyUserGrowth'] => {
    const data: Statistics['trends']['dailyUserGrowth'] = [];
    const now = new Date();
    
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // 生成模拟数据
      const baseNewUsers = Math.floor(Math.random() * 20) + 5;
      const baseActiveUsers = Math.floor(Math.random() * 50) + 30;
      
      data.push({
        date: date.toISOString().split('T')[0],
        newUsers: baseNewUsers,
        activeUsers: baseActiveUsers,
      });
    }
    
    return data;
  };

  const getChartOption = (): EChartsOption => {
    const dates = chartData.map(item => item.date);
    const newUsers = chartData.map(item => item.newUsers);
    const activeUsers = chartData.map(item => item.activeUsers);

    return {
      title: {
        text: '用户增长趋势',
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
          const newUsersValue = params.find((p: any) => p.seriesName === '新增用户')?.value || 0;
          const activeUsersValue = params.find((p: any) => p.seriesName === '活跃用户')?.value || 0;
          
          return `
            <div style="padding: 8px;">
              <div style="margin-bottom: 4px;"><strong>${date}</strong></div>
              <div style="color: #1890ff;">新增用户: ${newUsersValue}</div>
              <div style="color: #52c41a;">活跃用户: ${activeUsersValue}</div>
            </div>
          `;
        },
      },
      legend: {
        data: ['新增用户', '活跃用户'],
        top: 30,
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
        data: dates,
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
        name: '用户数量',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: '{value}',
        },
      },
      series: [
        {
          name: '新增用户',
          type: 'line',
          data: newUsers,
          smooth: true,
          lineStyle: {
            color: '#1890ff',
            width: 3,
          },
          itemStyle: {
            color: '#1890ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
              ],
            },
          },
          symbol: 'circle',
          symbolSize: 6,
        },
        {
          name: '活跃用户',
          type: 'line',
          data: activeUsers,
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
            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            用户增长趋势
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

export default UserGrowthChart;
