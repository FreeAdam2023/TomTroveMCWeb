import { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Table, 
  Tag, 
  Modal, 
  Typography,
  Row,
  Col,
  Descriptions,
  Progress,
  Tooltip,
  Divider,
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable, { TableActions } from '@/components/DataTable';
import { useAttemptStore, useTopicStore } from '@/stores';
import { attemptService } from '@/services/translationService';
import type { Attempt, AttemptQueryParams } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function AttemptManagementPage() {
  const {
    attempts,
    loading,
    error,
    pagination,
    setAttempts,
    setLoading,
    setError,
    setPagination,
  } = useAttemptStore();

  const { topics } = useTopicStore();

  const [searchText, setSearchText] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [scoreRange, setScoreRange] = useState<[number, number] | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: AttemptQueryParams = {
        page,
        limit,
        search: searchText || undefined,
        topicId: topicFilter === 'all' ? undefined : topicFilter,
        userId: userFilter || undefined,
        dateFrom: dateRange?.[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange?.[1]?.format('YYYY-MM-DD'),
        minScore: scoreRange?.[0],
        maxScore: scoreRange?.[1],
      };
      
      const response = await attemptService.getAttempts(params);
      setAttempts(response.items);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      setError('加载尝试记录失败');
      console.error('加载尝试记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadAttempts(1, pagination.limit);
  };

  const handleReset = () => {
    setSearchText('');
    setTopicFilter('all');
    setUserFilter('');
    setDateRange(null);
    setScoreRange(null);
    loadAttempts(1, pagination.limit);
  };

  const handleViewDetail = (attempt: Attempt) => {
    setSelectedAttempt(attempt);
    setIsDetailModalVisible(true);
  };

  const handleExport = async () => {
    try {
      const params: AttemptQueryParams = {
        search: searchText || undefined,
        topicId: topicFilter === 'all' ? undefined : topicFilter,
        userId: userFilter || undefined,
        dateFrom: dateRange?.[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange?.[1]?.format('YYYY-MM-DD'),
        minScore: scoreRange?.[0],
        maxScore: scoreRange?.[1],
      };
      
      const blob = await attemptService.exportAttempts(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attempts_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'orange';
    return 'red';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    return '需改进';
  };

  const columns: ColumnsType<Attempt> = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user: any) => user?.displayName || user?.email || '未知用户',
    },
    {
      title: '原文',
      dataIndex: 'sentence',
      key: 'sentence',
      width: 200,
      render: (sentence: any) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sentence?.originalText || '未知句子'}
        </div>
      ),
    },
    {
      title: '用户翻译',
      dataIndex: 'userTranslation',
      key: 'userTranslation',
      width: 200,
      render: (text: string) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score: number) => (
        <Tag color={getScoreColor(score)}>
          {score}分 ({getScoreText(score)})
        </Tag>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: '主题',
      dataIndex: 'sentence',
      key: 'topic',
      width: 120,
      render: (sentence: any) => sentence?.topic?.name?.zh || '未知主题',
    },
    {
      title: '尝试时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  const actions = [
    {
      ...TableActions.view,
      onClick: handleViewDetail,
    },
  ];

  return (
    <div className="attempt-management-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        尝试记录管理
      </Title>

      {/* 搜索和筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Input
                placeholder="搜索用户或翻译内容"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
              />
              <Select
                value={topicFilter}
                onChange={setTopicFilter}
                style={{ width: 150 }}
                placeholder="选择主题"
              >
                <Option value="all">全部主题</Option>
                {topics.map(topic => (
                  <Option key={topic.id} value={topic.id}>
                    {topic.name.zh || topic.name.en}
                  </Option>
                ))}
              </Select>
              <Input
                placeholder="用户ID或邮箱"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                style={{ width: 150 }}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                style={{ width: 240 }}
                placeholder={['开始日期', '结束日期']}
              />
              <Select
                placeholder="分数范围"
                style={{ width: 120 }}
                onChange={(value) => {
                  if (value === 'high') setScoreRange([80, 100]);
                  else if (value === 'medium') setScoreRange([60, 79]);
                  else if (value === 'low') setScoreRange([0, 59]);
                  else setScoreRange(null);
                }}
              >
                <Option value="high">80-100分</Option>
                <Option value="medium">60-79分</Option>
                <Option value="low">0-59分</Option>
              </Select>
              <Button onClick={handleSearch} type="primary" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<FilterOutlined />}>
                重置
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadAttempts(pagination.page, pagination.limit)}
              >
                刷新
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <DataTable
          columns={columns}
          dataSource={attempts}
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              loadAttempts(page, pageSize || pagination.limit);
            },
          }}
          actions={actions}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="尝试记录详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedAttempt && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="用户" span={2}>
                {selectedAttempt.user?.displayName || selectedAttempt.user?.email || '未知用户'}
              </Descriptions.Item>
              <Descriptions.Item label="主题">
                {selectedAttempt.sentence?.topic?.name?.zh || '未知主题'}
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color={
                  selectedAttempt.sentence?.difficulty === 'easy' ? 'green' :
                  selectedAttempt.sentence?.difficulty === 'medium' ? 'orange' : 'red'
                }>
                  {selectedAttempt.sentence?.difficulty === 'easy' ? '简单' :
                   selectedAttempt.sentence?.difficulty === 'medium' ? '中等' : '困难'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="原文" span={2}>
                <Text copyable>{selectedAttempt.sentence?.originalText}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="参考答案" span={2}>
                <Text copyable>{selectedAttempt.sentence?.referenceAnswer}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="用户翻译" span={2}>
                <Text copyable>{selectedAttempt.userTranslation}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="总分">
                <Tag color={getScoreColor(selectedAttempt.score)}>
                  {selectedAttempt.score}分
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="尝试时间">
                {dayjs(selectedAttempt.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            <Divider>LLM 分析结果</Divider>

            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {selectedAttempt.llmAnalysis.accuracy}
                    </div>
                    <div>准确性</div>
                    <Progress 
                      percent={selectedAttempt.llmAnalysis.accuracy} 
                      size="small"
                      strokeColor="#1890ff"
                    />
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {selectedAttempt.llmAnalysis.fluency}
                    </div>
                    <div>流畅性</div>
                    <Progress 
                      percent={selectedAttempt.llmAnalysis.fluency} 
                      size="small"
                      strokeColor="#52c41a"
                    />
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                      {selectedAttempt.llmAnalysis.completeness}
                    </div>
                    <div>完整性</div>
                    <Progress 
                      percent={selectedAttempt.llmAnalysis.completeness} 
                      size="small"
                      strokeColor="#faad14"
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider>反馈建议</Divider>
            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
              <Text>{selectedAttempt.feedback}</Text>
            </div>

            {selectedAttempt.llmAnalysis.suggestions.length > 0 && (
              <>
                <Divider>改进建议</Divider>
                <ul>
                  {selectedAttempt.llmAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index}>
                      <Text>{suggestion}</Text>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AttemptManagementPage;
