import React from 'react';
import { Spin, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps {
  loading?: boolean;
  children?: React.ReactNode;
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
  className?: string;
}

function Loading({ 
  loading = true, 
  children, 
  tip = '加载中...', 
  size = 'default',
  fullScreen = false,
  className 
}: LoadingProps) {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (fullScreen) {
    return (
      <div 
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <Spin indicator={antIcon} tip={tip} size={size} />
      </div>
    );
  }

  if (children) {
    return (
      <div className={className} style={{ position: 'relative' }}>
        {children}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <Spin indicator={antIcon} tip={tip} size={size} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '50px',
      }}
    >
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
}

// 页面级加载组件
export function PageLoading({ tip = '页面加载中...' }: { tip?: string }) {
  return (
    <Card style={{ minHeight: '400px' }}>
      <Loading tip={tip} size="large" />
    </Card>
  );
}

// 表格加载组件
export function TableLoading({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Loading loading={loading} tip="数据加载中...">
      {children}
    </Loading>
  );
}

// 按钮加载组件
export function ButtonLoading({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <Loading loading={loading} size="small">
      {children}
    </Loading>
  );
}

export default Loading;
