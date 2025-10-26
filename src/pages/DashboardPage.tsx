import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin } from 'antd';
import { 
  BookOutlined, 
  FileTextOutlined, 
  HistoryOutlined, 
  ExclamationCircleOutlined,
  UserOutlined,
  TrophyOutlined,
  UserAddOutlined,
  TeamOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import StatCard, { StatCardGroup } from '@/components/StatCard';
import UserGrowthChart from '@/components/UserGrowthChart';
import APITestComponent from '@/components/APITest';
import { useStatisticsStore } from '@/stores';
import { statisticsService } from '@/services/translationService';
import type { Statistics } from '@/types';

const { Title } = Typography;

function DashboardPage() {
  const { statistics, loading, setStatistics, setLoading, setError } = useStatisticsStore();
  const [recentActivity, setRecentActivity] = useState<Statistics['recentActivity']>([]);

  useEffect(() => {
    loadStatistics();
    loadRecentActivity();
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

  const loadRecentActivity = async () => {
    try {
      const data = await statisticsService.getRecentActivity(10);
      setRecentActivity(data);
    } catch (error) {
      console.error('加载最近活动失败:', error);
    }
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
      icon: <HistoryOutlined />,
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
      icon: <ExclamationCircleOutlined />,
      color: '#13c2c2',
    },
  ] : [];

  const userGrowthCards = statistics ? [
    {
      title: '今日新增用户',
      value: statistics.overview.newUsersToday,
      icon: <UserAddOutlined />,
      color: '#1890ff',
    },
    {
      title: '本周新增用户',
      value: statistics.overview.newUsersThisWeek,
      icon: <TeamOutlined />,
      color: '#52c41a',
    },
    {
      title: '本月新增用户',
      value: statistics.overview.newUsersThisMonth,
      icon: <RiseOutlined />,
      color: '#faad14',
    },
    {
      title: '今日活跃用户',
      value: statistics.overview.activeUsersToday,
      icon: <UserOutlined />,
      color: '#722ed1',
    },
    {
      title: '本周活跃用户',
      value: statistics.overview.activeUsersThisWeek,
      icon: <TeamOutlined />,
      color: '#eb2f96',
    },
    {
      title: '用户留存率',
      value: statistics.overview.userRetentionRate,
      suffix: '%',
      precision: 1,
      icon: <ExclamationCircleOutlined />,
      color: '#13c2c2',
    },
  ] : [];

  return (
    <div className="dashboard-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        仪表板
      </Title>

      {/* 统计卡片 */}
      <StatCardGroup 
        cards={statCards} 
        columns={3} 
        gutter={16}
        className="dashboard-stats"
      />

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <UserGrowthChart />
        </Col>
        <Col span={12}>
          <Card title="主题热度排行" style={{ height: 400 }}>
            <div style={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#8c8c8c'
            }}>
              图表组件待实现
            </div>
          </Card>
        </Col>
      </Row>

      {/* API连接测试 */}
      <APITestComponent />

      {/* 最近活动 */}
      <Card title="最近活动" style={{ marginTop: 24 }}>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px 0',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{activity.description}</span>
                  <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px' }}>
              暂无最近活动
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
