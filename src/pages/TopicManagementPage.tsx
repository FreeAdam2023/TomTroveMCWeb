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
  Popconfirm,
  Typography,
  Row,
  Col,
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable, { TableActions } from '@/components/DataTable';
import MultilingualInput from '@/components/MultilingualInput';
import { useTopicStore } from '@/stores';
import { topicService } from '@/services/translationService';
import type { Topic, TopicCreateRequest, TopicUpdateRequest } from '@/types';

const { Title } = Typography;
const { Option } = Select;

function TopicManagementPage() {
  const {
    topics,
    loading,
    error,
    pagination,
    setTopics,
    setLoading,
    setError,
    setPagination,
    addTopic,
    updateTopic,
    removeTopic,
  } = useTopicStore();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchText || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      };
      
      const response = await topicService.getTopics(params);
      setTopics(response.items);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      setError('加载主题列表失败');
      console.error('加载主题列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTopics(1, pagination.limit);
  };

  const handleReset = () => {
    setSearchText('');
    setStatusFilter('all');
    loadTopics(1, pagination.limit);
  };

  const handleCreate = () => {
    setEditingTopic(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    form.setFieldsValue({
      name: topic.name,
      description: topic.description,
      isActive: topic.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await topicService.deleteTopic(id);
      removeTopic(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTopic) {
        // 更新主题
        const updateData: TopicUpdateRequest = {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        };
        
        const updatedTopic = await topicService.updateTopic(editingTopic.id, updateData);
        updateTopic(editingTopic.id, updatedTopic);
        message.success('更新成功');
      } else {
        // 创建主题
        const createData: TopicCreateRequest = {
          name: values.name,
          description: values.description,
          isActive: values.isActive ?? true,
        };
        
        const newTopic = await topicService.createTopic(createData);
        addTopic(newTopic);
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

  const columns: ColumnsType<Topic> = [
    {
      title: '主题名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: Record<string, string>) => (
        <div>
          <div>{name.zh || '未设置'}</div>
          {name.en && <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{name.en}</div>}
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: Record<string, string>) => (
        <div style={{ maxWidth: 200 }}>
          {description.zh || '未设置'}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '句子数量',
      dataIndex: 'sentenceCount',
      key: 'sentenceCount',
      width: 100,
      render: (count: number) => count || 0,
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
      onClick: (record: Topic) => {
        // 查看详情逻辑
        console.log('查看主题:', record);
      },
    },
    {
      ...TableActions.edit,
      onClick: handleEdit,
    },
    {
      ...TableActions.delete,
      onClick: (record: Topic) => {
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除主题"${record.name.zh || record.name.en}"吗？`,
          onOk: () => handleDelete(record.id),
        });
      },
    },
  ];

  return (
    <div className="topic-management-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        主题管理
      </Title>

      {/* 搜索和操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Input
                placeholder="搜索主题名称"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
              />
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
                onClick={() => loadTopics(pagination.page, pagination.limit)}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                新建主题
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <DataTable
          columns={columns}
          dataSource={topics}
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
              loadTopics(page, pageSize || pagination.limit);
            },
          }}
          actions={actions}
        />
      </Card>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingTopic ? '编辑主题' : '新建主题'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
          }}
        >
          <Form.Item
            label="主题名称"
            name="name"
            rules={[{ required: true, message: '请输入主题名称' }]}
          >
            <MultilingualInput
              placeholder="请输入主题名称"
              languages={['zh', 'en']}
              required
            />
          </Form.Item>

          <Form.Item
            label="主题描述"
            name="description"
            rules={[{ required: true, message: '请输入主题描述' }]}
          >
            <MultilingualInput
              placeholder="请输入主题描述"
              languages={['zh', 'en']}
              required
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

export default TopicManagementPage;
