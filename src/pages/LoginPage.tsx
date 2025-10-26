import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import authService from '@/services/authService';

const { Title, Text } = Typography;

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 如果已登录，重定向到管理页面
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // 邮箱密码登录
  const handleEmailLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const user = await authService.signInWithEmail(values.email, values.password);
      setUser(user);
      message.success('登录成功');
      navigate('/admin/dashboard');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // Google 登录
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      setUser(user);
      message.success('登录成功');
      navigate('/admin/dashboard');
    } catch (error: any) {
      message.error(error.message || 'Google 登录失败');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* Logo 和标题 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            TomTrove
          </Title>
          <Text type="secondary">翻译练习管理系统</Text>
        </div>

        {/* 登录表单 */}
        <Form
          name="login"
          onFinish={handleEmailLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱地址"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* 分割线 */}
        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary">或</Text>
        </Divider>

        {/* Google 登录 */}
        <Button
          icon={<GoogleOutlined />}
          loading={googleLoading}
          onClick={handleGoogleLogin}
          block
          style={{
            height: 48,
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            border: '1px solid #d9d9d9',
            background: '#fff',
            color: '#262626',
          }}
        >
          使用 Google 登录
        </Button>

        {/* 提示信息 */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            仅限管理员使用
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
