import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Breadcrumb, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import authService from '@/services/authService';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

// 菜单项配置
const menuItems: MenuProps['items'] = [
  {
    key: '/admin/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表板',
  },
  {
    key: '/admin/topics',
    icon: <BookOutlined />,
    label: '主题管理',
  },
  {
    key: '/admin/sentences',
    icon: <FileTextOutlined />,
    label: '句子管理',
  },
  {
    key: '/admin/attempts',
    icon: <HistoryOutlined />,
    label: '尝试记录',
  },
  {
    key: '/admin/mistakes',
    icon: <ExclamationCircleOutlined />,
    label: '错题管理',
  },
  {
    key: '/admin/statistics',
    icon: <BarChartOutlined />,
    label: '统计分析',
  },
];

// 面包屑映射
const breadcrumbMap: Record<string, string> = {
  '/admin/dashboard': '仪表板',
  '/admin/topics': '主题管理',
  '/admin/sentences': '句子管理',
  '/admin/attempts': '尝试记录',
  '/admin/mistakes': '错题管理',
  '/admin/statistics': '统计分析',
};

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const currentPath = location.pathname;
    setSelectedKey([currentPath]);
  }, [location.pathname]);

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await authService.signOut();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 生成面包屑
  const generateBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
      {
        title: '首页',
        href: '/admin/dashboard',
      },
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const title = breadcrumbMap[currentPath] || segment;
      breadcrumbItems.push({
        title,
        href: index === pathSegments.length - 1 ? undefined : currentPath,
      } as any);
    });

    return breadcrumbItems;
  };

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        className="admin-sider"
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo */}
        <div className="logo" style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          fontSize: sidebarCollapsed ? '16px' : '20px',
          fontWeight: 'bold',
          color: '#1890ff',
        }}>
          {sidebarCollapsed ? 'TT' : 'TomTrove'}
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          selectedKeys={selectedKey}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
          }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header className="admin-header" style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          {/* 左侧：折叠按钮和面包屑 */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
                marginRight: 16,
              }}
            />
            
            <Breadcrumb
              items={generateBreadcrumb()}
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* 右侧：用户信息 */}
          <Space>
        <span style={{ color: '#8c8c8c' }}>
          欢迎，{user?.displayName || user?.email || '用户'}
        </span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                src={user?.photoURL}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>

        {/* 主内容区域 */}
        <Content className="admin-content" style={{
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)',
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
