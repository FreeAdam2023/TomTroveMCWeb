import { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Select, 
  DatePicker, 
  Space, 
  Spin,
  Tabs,
  Table,
  Tag,
  Progress,
} from 'antd';
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined,
  TrophyOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Chart from '@/components/Chart';
import StatCard, { StatCardGroup } from '@/components/StatCard';
import { useStatisticsStore } from '@/stores';
import { statisticsService } from '@/services/translationService';
import type { Statistics } from '@/types';
import dayjs from 'dayjs';
import type { EChartsOption } from 'echarts';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

function StatisticsPage() {
  const { statistics, loading, setStatistics, setLoading, setError } = useStatisticsStore();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await statisticsService.getStatistics();
      setStatistics(data);
    } catch (error) {
      setError('加载统计数据失败');
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 每日尝试趋势图表配置
  const getDailyAttemptsOption = (): EChartsOption => {
    if (!statistics?.trends?.dailyAttempts) {
      return {};
    }

    const data = statistics.trends.dailyAttempts;
    const dates = data.map(item => dayjs(item.date).format('MM-DD'));
    const counts = data.map(item => item.count);
    const scores = data.map(item => item.averageScore);

    return {
      title: {
        text: '每日尝试趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['尝试次数', '平均分数'],
        top: 30,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '尝试次数',
          position: 'left',
        },
        {
          type: 'value',
          name: '平均分数',
          position: 'right',
          min: 0,
          max: 100,
        },
      ],
      series: [
        {
          name: '尝试次数',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: '#1890ff',
          },
        },
        {
          name: '平均分数',
          type: 'line',
          yAxisIndex: 1,
          data: scores,
          itemStyle: {
            color: '#52c41a',
          },
          lineStyle: {
            width: 3,
          },
        },
      ],
    };
  };

  // 成功率趋势图表配置
  const getSuccessRateOption = (): EChartsOption => {
    if (!statistics?.trends?.weeklySuccessRate) {
      return {};
    }

    const data = statistics.trends.weeklySuccessRate;
    const weeks = data.map(item => item.week);
    const rates = data.map(item => item.rate);

    return {
      title: {
        text: '周成功率趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%',
      },
      xAxis: {
        type: 'category',
        data: weeks,
      },
      yAxis: {
        type: 'value',
        name: '成功率 (%)',
        min: 0,
        max: 100,
      },
      series: [
        {
          name: '成功率',
          type: 'line',
          data: rates,
          smooth: true,
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
                { offset: 1, color: 'rgba(82, 196, 26, 0.1)' },
              ],
            },
          },
        },
      ],
    };
  };

  // 主题热度排行图表配置
  const getTopicRankingOption = (): EChartsOption => {
    if (!statistics?.topicStats) {
      return {};
    }

    const data = statistics.topicStats
      .sort((a, b) => b.attemptCount - a.attemptCount)
      .slice(0, 10);

    return {
      title: {
        text: '主题热度排行',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'value',
        name: '尝试次数',
      },
      yAxis: {
        type: 'category',
        data: data.map(item => item.topicName),
        axisLabel: {
          interval: 0,
        },
      },
      series: [
        {
          name: '尝试次数',
          type: 'bar',
          data: data.map(item => item.attemptCount),
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    };
  };

  // 分数分布饼图配置
  const getScoreDistributionOption = (): EChartsOption => {
    if (!statistics?.overview) {
      return {};
    }

    const { averageScore } = statistics.overview;
    
    // 模拟分数分布数据
    const data = [
      { name: '优秀 (80-100分)', value: Math.round(averageScore * 0.3) },
      { name: '良好 (60-79分)', value: Math.round(averageScore * 0.4) },
      { name: '需改进 (0-59分)', value: Math.round(averageScore * 0.3) },
    ];

    return {
      title: {
        text: '分数分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: '分数分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
          },
        },
      ],
    };
  };

  if (loading && !statistics) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const statCards = statistics ? [
    {
      title: '总主题数',
      value: statistics.overview.totalTopics,
      icon: <BookOutlined />,
      color: '#1890ff',
    },
    {
      title: '总句子数',
      value: statistics.overview.totalSentences,
      icon: <FileTextOutlined />,
      color: '#52c41a',
    },
    {
      title: '总尝试次数',
      value: statistics.overview.totalAttempts,
      icon: <BarChartOutlined />,
      color: '#faad14',
    },
    {
      title: '总用户数',
      value: statistics.overview.totalUsers,
      icon: <UserOutlined />,
      color: '#722ed1',
    },
    {
      title: '平均分数',
      value: statistics.overview.averageScore,
      suffix: '分',
      precision: 1,
      icon: <TrophyOutlined />,
      color: '#eb2f96',
    },
    {
      title: '成功率',
      value: statistics.overview.successRate,
      suffix: '%',
      precision: 1,
      icon: <LineChartOutlined />,
      color: '#13c2c2',
    },
  ] : [];

  const topicStatsColumns = [
    {
      title: '主题名称',
      dataIndex: 'topicName',
      key: 'topicName',
    },
    {
      title: '尝试次数',
      dataIndex: 'attemptCount',
      key: 'attemptCount',
      sorter: (a: any, b: any) => a.attemptCount - b.attemptCount,
    },
    {
      title: '平均分数',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score: number) => (
        <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'}>
          {score.toFixed(1)}分
        </Tag>
      ),
      sorter: (a: any, b: any) => a.averageScore - b.averageScore,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <div>
          <Progress 
            percent={rate} 
            size="small" 
            strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#f5222d'}
          />
          <span style={{ marginLeft: 8 }}>{rate.toFixed(1)}%</span>
        </div>
      ),
      sorter: (a: any, b: any) => a.successRate - b.successRate,
    },
  ];

  return (
    <div className="statistics-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        统计分析
      </Title>

      {/* 统计概览 */}
      <StatCardGroup 
        cards={statCards} 
        columns={3} 
        gutter={16}
        className="statistics-overview"
      />

      {/* 图表区域 */}
      <Tabs defaultActiveKey="trends" style={{ marginTop: 24 }}>
        <TabPane tab="趋势分析" key="trends">
          <Row gutter={16}>
            <Col span={12}>
              <Card>
                <Chart 
                  option={getDailyAttemptsOption()} 
                  height={400}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Chart 
                  option={getSuccessRateOption()} 
                  height={400}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="主题分析" key="topics">
          <Row gutter={16}>
            <Col span={16}>
              <Card>
                <Chart 
                  option={getTopicRankingOption()} 
                  height={500}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Chart 
                  option={getScoreDistributionOption()} 
                  height={500}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="详细数据" key="details">
          <Card title="主题详细统计">
            <Table
              columns={topicStatsColumns}
              dataSource={statistics?.topicStats || []}
              pagination={false}
              loading={loading}
              rowKey="topicId"
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 最近活动 */}
      {statistics?.recentActivity && (
        <Card title="最近活动" style={{ marginTop: 24 }}>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {statistics.recentActivity.map((activity, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px 0',
                  borderBottom: index < statistics.recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{activity.description}</span>
                  <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    {dayjs(activity.timestamp).format('MM-DD HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default StatisticsPage;
