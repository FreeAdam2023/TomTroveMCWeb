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
  Descriptions,
  Avatar,
  Tooltip,
} from 'antd';
import { 
  SearchOutlined, 
  EditOutlined, 
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable, { TableActions } from '@/components/DataTable';
import { userService } from '@/services/translationService';
import type { User } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

interface UserListItem {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

function UserManagementPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchText || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      };
      
      const response = await userService.getUsers(params);
      setUsers(response.items || []);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      setError('加载用户列表失败');
      console.error('加载用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers(1, pagination.limit);
  };

  const handleReset = () => {
    setSearchText('');
    setRoleFilter('all');
    setStatusFilter('all');
    loadUsers(1, pagination.limit);
  };

  const handleViewDetail = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDetailModalVisible(true);
  };

  const handleEdit = (user: UserListItem) => {
    setSelectedUser(user);
    form.setFieldsValue({
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedUser) {
        const updateData = {
          displayName: values.displayName,
          role: values.role,
          isActive: values.isActive,
        };
        
        await userService.updateUser(selectedUser.id, updateData);
        
        // 更新本地状态
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...updateData }
            : user
        ));
        
        message.success('用户信息更新成功');
        setIsEditModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      message.error('更新用户信息失败');
      console.error('更新用户信息失败:', error);
    }
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'user': return 'blue';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'user': return '普通用户';
      default: return role;
    }
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.photoURL} 
            icon={<UserOutlined />}
            style={{ marginRight: 8 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.displayName || '未设置'}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleString() : '从未登录',
    },
  ];

  const actions = [
    {
      ...TableActions.view,
      onClick: handleViewDetail,
    },
    {
      ...TableActions.edit,
      onClick: handleEdit,
    },
  ];

  return (
    <div className="user-management-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        用户管理
      </Title>

      {/* 搜索和操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Input
                placeholder="搜索用户邮箱或姓名"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
              />
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: 120 }}
              >
                <Option value="all">全部角色</Option>
                <Option value="admin">管理员</Option>
                <Option value="user">普通用户</Option>
              </Select>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
              >
                <Option value="all">全部状态</Option>
                <Option value="active">活跃</Option>
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
                onClick={() => loadUsers(pagination.page, pagination.limit)}
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
          dataSource={users}
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
              loadUsers(page, pageSize || pagination.limit);
            },
          }}
          actions={actions}
        />
      </Card>

      {/* 用户详情模态框 */}
      <Modal
        title="用户详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="头像">
              <Avatar 
                src={selectedUser.photoURL} 
                icon={<UserOutlined />}
                size={64}
              />
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              <Text code>{selectedUser.uid}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              <Space>
                <MailOutlined />
                {selectedUser.email}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="显示名称">
              {selectedUser.displayName || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              <Tag color={getRoleColor(selectedUser.role)}>
                {getRoleText(selectedUser.role)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                {selectedUser.isActive ? '活跃' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              <Space>
                <CalendarOutlined />
                {new Date(selectedUser.createdAt).toLocaleString()}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="最后登录">
              <Space>
                <CalendarOutlined />
                {selectedUser.lastLoginAt 
                  ? new Date(selectedUser.lastLoginAt).toLocaleString()
                  : '从未登录'
                }
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        width={500}
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
            label="显示名称"
            name="displayName"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="请输入显示名称" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="user">普通用户</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>活跃</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagementPage;
