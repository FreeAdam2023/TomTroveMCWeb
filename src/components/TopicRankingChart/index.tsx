import { useState, useEffect } from 'react';
import { Card, Select, Spin, message } from 'antd';
import { BookOutlined, TrophyOutlined } from '@ant-design/icons';
import Chart from '@/components/Chart';
import { statisticsService } from '@/services/translationService';
import type { Statistics } from '@/types';
import type { EChartsOption } from 'echarts';

const { Option } = Select;

interface TopicRankingChartProps {
  className?: string;
}

function TopicRankingChart({ className }: TopicRankingChartProps) {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<Statistics['topicStats']>([]);

  useEffect(() => {
    loadTopicRankingData();
  }, []);

  const loadTopicRankingData = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getTopicStatistics();
      setChartData(data);
    } catch (error) {
      message.error('加载主题统计失败');
      console.error('加载主题统计失败:', error);
      
      // 使用模拟数据
      const mockData = generateMockData();
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): Statistics['topicStats'] => {
    const topics = [
      '日常对话',
      '商务英语',
      '旅游用语',
      '学术写作',
      '科技词汇',
      '医疗术语',
      '法律英语',
      '金融英语',
    ];

    return topics.map((topic, index) => ({
      topicId: `topic-${index + 1}`,
      topicName: topic,
      attemptCount: Math.floor(Math.random() * 500) + 100,
      averageScore: Math.floor(Math.random() * 30) + 70,
      successRate: Math.floor(Math.random() * 30) + 60,
    })).sort((a, b) => b.attemptCount - a.attemptCount);
  };

  const getChartOption = (): EChartsOption => {
    const sortedData = [...chartData].sort((a, b) => b.attemptCount - a.attemptCount);
    const top10 = sortedData.slice(0, 10);
    
    const topicNames = top10.map(item => item.topicName);
    const attemptCounts = top10.map(item => item.attemptCount);
    const averageScores = top10.map(item => item.averageScore);

    return {
      title: {
        text: '主题热度排行',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          const index = data.dataIndex;
          const topic = top10[index];
          
          return `
            <div style="padding: 8px;">
              <div style="margin-bottom: 4px;"><strong>${topic.topicName}</strong></div>
              <div style="color: #1890ff;">尝试次数: ${topic.attemptCount}</div>
              <div style="color: #52c41a;">平均分数: ${topic.averageScore}</div>
              <div style="color: #faad14;">成功率: ${topic.successRate}%</div>
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
        data: topicNames,
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        name: '尝试次数',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: '{value}',
        },
      },
      series: [
        {
          name: '尝试次数',
          type: 'bar',
          data: attemptCounts,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#1890ff' },
                { offset: 1, color: '#40a9ff' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: '#096dd9',
            },
          },
          animationDelay: (idx: number) => idx * 100,
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
          主题热度排行
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

export default TopicRankingChart;
