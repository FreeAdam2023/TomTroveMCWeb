import React from 'react';
import { Result, Button } from 'antd';
import { useAuthStore } from '@/stores';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  fallback?: React.ReactNode;
}

function PermissionGuard({ 
  children, 
  requiredRole = 'admin', 
  fallback 
}: PermissionGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  // 如果未登录，不渲染任何内容（由路由守卫处理）
  if (!isAuthenticated) {
    return null;
  }

  // 如果用户角色不满足要求
  if (user?.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回上一页
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}

// 高阶组件形式的权限守卫
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: 'admin' | 'user' = 'admin'
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard requiredRole={requiredRole}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

// 权限检查 Hook
export function usePermission(requiredRole: 'admin' | 'user' = 'admin') {
  const { user, isAuthenticated } = useAuthStore();
  
  const hasPermission = isAuthenticated && user?.role === requiredRole;
  
  return {
    hasPermission,
    user,
    isAuthenticated,
  };
}

export default PermissionGuard;
