import { Component, ReactNode } from 'react';
import { Result, Button, Card } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // 调用错误处理回调
    this.props.onError?.(error, errorInfo);
    
    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/admin/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义的 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误页面
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
        }}>
          <Card style={{ maxWidth: 500, width: '100%' }}>
            <Result
              status="error"
              title="页面出现错误"
              subTitle="抱歉，页面遇到了一个错误。请尝试刷新页面或返回首页。"
              extra={[
                <Button 
                  type="primary" 
                  key="reload" 
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                >
                  刷新页面
                </Button>,
                <Button 
                  key="home" 
                  icon={<HomeOutlined />}
                  onClick={this.handleGoHome}
                >
                  返回首页
                </Button>,
              ]}
            />
            
            {/* 开发环境下显示详细错误信息 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ 
                marginTop: 20, 
                padding: 16, 
                background: '#f5f5f5', 
                borderRadius: 6,
                fontSize: '12px',
                fontFamily: 'monospace',
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>错误详情:</div>
                <div style={{ color: '#ff4d4f', marginBottom: 8 }}>
                  {this.state.error.message}
                </div>
                <div style={{ color: '#8c8c8c' }}>
                  {this.state.error.stack}
                </div>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
