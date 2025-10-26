import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import AdminLayout from '@/layouts/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import TopicManagementPage from '@/pages/TopicManagementPage';
import SentenceManagementPage from '@/pages/SentenceManagementPage';
import AttemptManagementPage from '@/pages/AttemptManagementPage';
import MistakeManagementPage from '@/pages/MistakeManagementPage';
import StatisticsPage from '@/pages/StatisticsPage';
import { useAuthStore } from '@/stores';
import authService from '@/services/authService';

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// 公开路由组件（已登录用户重定向）
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}


// 主路由组件
function AppRoutes() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // 初始化认证状态
    const initAuth = async () => {
      setLoading(true);
      try {
        const user = authService.getCurrentUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 监听认证状态变化
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return (
    <Routes>
      {/* 公开路由 */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />

      {/* 受保护的管理路由 */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="topics" element={<TopicManagementPage />} />
        <Route path="sentences" element={<SentenceManagementPage />} />
        <Route path="attempts" element={<AttemptManagementPage />} />
        <Route path="mistakes" element={<MistakeManagementPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
      </Route>

      {/* 默认重定向 */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
