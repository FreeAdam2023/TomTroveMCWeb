import { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Input, 
  Select, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  message,
  Typography,
  Row,
  Col,
  InputNumber,
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ReloadOutlined,
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable, { TableActions } from '@/components/DataTable';
import MultilingualInput from '@/components/MultilingualInput';
import { useSentenceStore, useTopicStore } from '@/stores';
import { sentenceService, topicService } from '@/services/translationService';
import type { Sentence, SentenceCreateRequest, SentenceUpdateRequest } from '@/types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function SentenceManagementPage() {
  const {
    sentences,
    loading,
    error,
    pagination,
    setSentences,
    setLoading,
    setError,
    setPagination,
    addSentence,
    updateSentence,
    removeSentence,
  } = useSentenceStore();

  const { topics } = useTopicStore();

  const [searchText, setSearchText] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSentences();
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await topicService.getTopics({ limit: 1000 });
      // 这里应该更新 topics store，暂时跳过
    } catch (error) {
      console.error('加载主题列表失败:', error);
    }
  };

  const loadSentences = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchText || undefined,
        topicId: topicFilter === 'all' ? undefined : topicFilter,
        difficulty: difficultyFilter === 'all' ? undefined : difficultyFilter as any,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      };
      
      const response = await sentenceService.getSentences(params);
      setSentences(response.items);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      setError('加载句子列表失败');
      console.error('加载句子列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadSentences(1, pagination.limit);
  };

  const handleReset = () => {
    setSearchText('');
    setTopicFilter('all');
    setDifficultyFilter('all');
    setStatusFilter('all');
    loadSentences(1, pagination.limit);
  };

  const handleCreate = () => {
    setEditingSentence(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (sentence: Sentence) => {
    setEditingSentence(sentence);
    form.setFieldsValue({
      topicId: sentence.topicId,
      originalText: sentence.originalText,
      referenceAnswer: sentence.referenceAnswer,
      hints: sentence.hints,
      difficulty: sentence.difficulty,
      order: sentence.order,
      isActive: sentence.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await sentenceService.deleteSentence(id);
      removeSentence(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSentence) {
        // 更新句子
        const updateData: SentenceUpdateRequest = {
          topicId: values.topicId,
          originalText: values.originalText,
          referenceAnswer: values.referenceAnswer,
          hints: values.hints,
          difficulty: values.difficulty,
          order: values.order,
          isActive: values.isActive,
        };
        
        const updatedSentence = await sentenceService.updateSentence(editingSentence.id, updateData);
        updateSentence(editingSentence.id, updatedSentence);
        message.success('更新成功');
      } else {
        // 创建句子
        const createData: SentenceCreateRequest = {
          topicId: values.topicId,
          originalText: values.originalText,
          referenceAnswer: values.referenceAnswer,
          hints: values.hints,
          difficulty: values.difficulty,
          order: values.order || 0,
          isActive: values.isActive ?? true,
        };
        
        const newSentence = await sentenceService.createSentence(createData);
        addSentence(newSentence);
        message.success('创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return difficulty;
    }
  };

  const columns: ColumnsType<Sentence> = [
    {
      title: '原文',
      dataIndex: 'originalText',
      key: 'originalText',
      width: 200,
      render: (text: string) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: '参考答案',
      dataIndex: 'referenceAnswer',
      key: 'referenceAnswer',
      width: 200,
      render: (text: string) => (
        <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {text}
        </div>
      ),
    },
    {
      title: '主题',
      dataIndex: 'topic',
      key: 'topic',
      width: 120,
      render: (topic: any) => topic?.name?.zh || '未知主题',
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty: string) => (
        <Tag color={getDifficultyColor(difficulty)}>
          {getDifficultyText(difficulty)}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const actions = [
    {
      ...TableActions.view,
      onClick: (record: Sentence) => {
        // 查看详情逻辑
        console.log('查看句子:', record);
      },
    },
    {
      ...TableActions.edit,
      onClick: handleEdit,
    },
    {
      ...TableActions.delete,
      onClick: (record: Sentence) => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除这个句子吗？`,
          onOk: () => handleDelete(record.id),
        });
      },
    },
  ];

  return (
    <div className="sentence-management-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        句子管理
      </Title>

      {/* 搜索和操作栏 */}
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
              <Select
                value={difficultyFilter}
                onChange={setDifficultyFilter}
                style={{ width: 120 }}
              >
                <Option value="all">全部难度</Option>
                <Option value="easy">简单</Option>
                <Option value="medium">中等</Option>
                <Option value="hard">困难</Option>
              </Select>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
              >
                <Option value="all">全部状态</Option>
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
              <Button onClick={handleSearch} type="primary">
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadSentences(pagination.page, pagination.limit)}
              >
                刷新
              </Button>
              <Button icon={<ImportOutlined />}>
                导入
              </Button>
              <Button icon={<ExportOutlined />}>
                导出
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                新建句子
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <DataTable
          columns={columns}
          dataSource={sentences}
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
              loadSentences(page, pageSize || pagination.limit);
            },
          }}
          actions={actions}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingSentence ? '编辑句子' : '新建句子'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            difficulty: 'medium',
            isActive: true,
            order: 0,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="所属主题"
                name="topicId"
                rules={[{ required: true, message: '请选择主题' }]}
              >
                <Select placeholder="选择主题">
                  {topics.map(topic => (
                    <Option key={topic.id} value={topic.id}>
                      {topic.name.zh || topic.name.en}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="难度"
                name="difficulty"
                rules={[{ required: true, message: '请选择难度' }]}
              >
                <Select>
                  <Option value="easy">简单</Option>
                  <Option value="medium">中等</Option>
                  <Option value="hard">困难</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="排序"
                name="order"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="原文"
            name="originalText"
            rules={[{ required: true, message: '请输入原文' }]}
          >
            <TextArea rows={3} placeholder="请输入原文" />
          </Form.Item>

          <Form.Item
            label="参考答案"
            name="referenceAnswer"
            rules={[{ required: true, message: '请输入参考答案' }]}
          >
            <TextArea rows={3} placeholder="请输入参考答案" />
          </Form.Item>

          <Form.Item
            label="提示信息"
            name="hints"
          >
            <MultilingualInput
              placeholder="请输入提示信息"
              languages={['zh', 'en']}
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SentenceManagementPage;
