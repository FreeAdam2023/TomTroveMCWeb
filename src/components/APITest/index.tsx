import { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { sentenceService } from '@/services/translationService';

const { Title, Text } = Typography;

function APITestComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSentenceAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await sentenceService.getSentences({ page: 1, limit: 5 });
      setResult({
        success: true,
        data: response,
        message: '句子API连接成功！'
      });
    } catch (err: any) {
      setError(err.message || 'API连接失败');
      setResult({
        success: false,
        message: 'API连接失败'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="API连接测试" style={{ margin: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button 
          type="primary" 
          onClick={testSentenceAPI}
          loading={loading}
          icon={<CheckCircleOutlined />}
        >
          测试句子API连接
        </Button>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <Text style={{ marginLeft: 10 }}>正在测试API连接...</Text>
          </div>
        )}

        {result && (
          <Alert
            message={result.message}
            type={result.success ? 'success' : 'error'}
            icon={result.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            description={
              result.success ? (
                <div>
                  <Text strong>返回数据预览：</Text>
                  <pre style={{ marginTop: 8, fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : null
            }
          />
        )}

        {error && (
          <Alert
            message="连接失败"
            description={error}
            type="error"
            icon={<CloseCircleOutlined />}
          />
        )}
      </Space>
    </Card>
  );
}

export default APITestComponent;
