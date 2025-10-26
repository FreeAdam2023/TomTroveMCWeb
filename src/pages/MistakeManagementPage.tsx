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
  Tooltip,
  message,
  Popconfirm,
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable, { TableActions } from '@/components/DataTable';
import { useMistakeStore, useTopicStore } from '@/stores';
import { mistakeService } from '@/services/translationService';
import type { Mistake, MistakeQueryParams } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function MistakeManagementPage() {
  const {
    mistakes,
    loading,
    error,
    pagination,
    setMistakes,
    setLoading,
    setError,
    setPagination,
    resolveMistake,
  } = useMistakeStore();

  const { topics } = useTopicStore();

  const [searchText, setSearchText] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [mistakeTypeFilter, setMistakeTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: MistakeQueryParams = {
        page,
        limit,
        userId: userFilter || undefined,
        sentenceId: searchText || undefined,
        topicId: topicFilter === 'all' ? undefined : topicFilter,
        mistakeType: mistakeTypeFilter === 'all' ? undefined : mistakeTypeFilter as any,
        isResolved: statusFilter === 'all' ? undefined : statusFilter === 'resolved',
        dateFrom: dateRange?.[0]?.format('YYYY-MM-DD'),
        dateTo: dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      
      const response = await mistakeService.getMistakes(params);
      setMistakes(response.items);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      setError('加载错题列表失败');
      console.error('加载错题列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadMistakes(1, pagination.limit);
  };

  const handleReset = () => {
    setSearchText('');
    setTopicFilter('all');
    setUserFilter('');
    setMistakeTypeFilter('all');
    setStatusFilter('all');
    setDateRange(null);
    loadMistakes(1, pagination.limit);
  };

  const handleViewDetail = (mistake: Mistake) => {
    setSelectedMistake(mistake);
    setIsDetailModalVisible(true);
  };

  const handleResolve = async (id: string) => {
    try {
      await mistakeService.resolveMistake(id);
      resolveMistake(id);
      message.success('已标记为已解决');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchResolve = async (ids: string[]) => {
    try {
      await mistakeService.batchResolveMistakes(ids);
      ids.forEach(id => resolveMistake(id));
      message.success(`已批量解决 ${ids.length} 个错题`);
    } catch (error) {
      message.error('批量操作失败');
    }
  };

  const getMistakeTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'blue';
      case 'vocabulary': return 'green';
      case 'structure': return 'orange';
      case 'other': return 'purple';
      default: return 'default';
    }
  };

  const getMistakeTypeText = (type: string) => {
    switch (type) {
      case 'grammar': return '语法错误';
      case 'vocabulary': return '词汇错误';
      case 'structure': return '结构错误';
      case 'other': return '其他错误';
      default: return type;
    }
  };

  const columns: ColumnsType<Mistake> = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user: any) => user?.displayName || user?.email || '未知用户',
    },
    {
      title: '错题类型',
      dataIndex: 'mistakeType',
      key: 'mistakeType',
      width: 100,
      render: (type: string) => (
        <Tag color={getMistakeTypeColor(type)}>
          {getMistakeTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '错误描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text: string) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: '相关句子',
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
      title: '主题',
      dataIndex: 'sentence',
      key: 'topic',
      width: 120,
      render: (sentence: any) => sentence?.topic?.name?.zh || '未知主题',
    },
    {
      title: '状态',
      dataIndex: 'isResolved',
      key: 'isResolved',
      width: 100,
      render: (isResolved: boolean) => (
        <Tag color={isResolved ? 'green' : 'red'} icon={isResolved ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
          {isResolved ? '已解决' : '未解决'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
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
    {
      key: 'resolve',
      label: '解决',
      icon: <CheckCircleOutlined />,
      onClick: (record: Mistake) => {
        Modal.confirm({
          title: '确认解决',
          content: `确定要标记这个错题为已解决吗？`,
          onOk: () => handleResolve(record.id),
        });
      },
      disabled: (record: Mistake) => record.isResolved,
      tooltip: '标记为已解决',
    },
  ];

  return (
    <div className="mistake-management-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        错题管理
      </Title>

      {/* 搜索和筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Input
                placeholder="搜索句子内容"
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
              <Select
                value={mistakeTypeFilter}
                onChange={setMistakeTypeFilter}
                style={{ width: 120 }}
              >
                <Option value="all">全部类型</Option>
                <Option value="grammar">语法错误</Option>
                <Option value="vocabulary">词汇错误</Option>
                <Option value="structure">结构错误</Option>
                <Option value="other">其他错误</Option>
              </Select>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
              >
                <Option value="all">全部状态</Option>
                <Option value="unresolved">未解决</Option>
                <Option value="resolved">已解决</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                style={{ width: 240 }}
                placeholder={['开始日期', '结束日期']}
              />
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
                onClick={() => loadMistakes(pagination.page, pagination.limit)}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <DataTable
          columns={columns}
          dataSource={mistakes}
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
              loadMistakes(page, pageSize || pagination.limit);
            },
          }}
          actions={actions}
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys: React.Key[], selectedRows: Mistake[]) => {
              // 可以在这里处理批量选择
              console.log('选中的行:', selectedRowKeys, selectedRows);
            },
            getCheckboxProps: (record: Mistake) => ({
              disabled: record.isResolved,
            }),
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="错题详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
          !selectedMistake?.isResolved && (
            <Popconfirm
              key="resolve"
              title="确认解决"
              description="确定要标记这个错题为已解决吗？"
              onConfirm={() => {
                handleResolve(selectedMistake!.id);
                setIsDetailModalVisible(false);
              }}
            >
              <Button type="primary" icon={<CheckCircleOutlined />}>
                标记为已解决
              </Button>
            </Popconfirm>
          ),
        ]}
      >
        {selectedMistake && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="用户" span={2}>
                {selectedMistake.user?.displayName || selectedMistake.user?.email || '未知用户'}
              </Descriptions.Item>
              <Descriptions.Item label="错题类型">
                <Tag color={getMistakeTypeColor(selectedMistake.mistakeType)}>
                  {getMistakeTypeText(selectedMistake.mistakeType)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedMistake.isResolved ? 'green' : 'red'}>
                  {selectedMistake.isResolved ? '已解决' : '未解决'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="主题">
                {selectedMistake.sentence?.topic?.name?.zh || '未知主题'}
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color={
                  selectedMistake.sentence?.difficulty === 'easy' ? 'green' :
                  selectedMistake.sentence?.difficulty === 'medium' ? 'orange' : 'red'
                }>
                  {selectedMistake.sentence?.difficulty === 'easy' ? '简单' :
                   selectedMistake.sentence?.difficulty === 'medium' ? '中等' : '困难'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="原文" span={2}>
                <Text copyable>{selectedMistake.sentence?.originalText}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="参考答案" span={2}>
                <Text copyable>{selectedMistake.sentence?.referenceAnswer}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="用户翻译" span={2}>
                <Text copyable>{selectedMistake.attempt?.userTranslation}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="错误描述" span={2}>
                <Text>{selectedMistake.description}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(selectedMistake.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {selectedMistake.resolvedAt && (
                <Descriptions.Item label="解决时间">
                  {dayjs(selectedMistake.resolvedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 相关尝试记录 */}
            {selectedMistake.attempt && (
              <>
                <div style={{ marginTop: 24 }}>
                  <Title level={4}>相关尝试记录</Title>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="尝试分数">
                      <Tag color={selectedMistake.attempt.score >= 80 ? 'green' : 
                                 selectedMistake.attempt.score >= 60 ? 'orange' : 'red'}>
                        {selectedMistake.attempt.score}分
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="尝试时间">
                      {dayjs(selectedMistake.attempt.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="LLM 反馈" span={2}>
                      <Text>{selectedMistake.attempt.feedback}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MistakeManagementPage;
