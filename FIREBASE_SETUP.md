# Firebase 登录系统配置指南

## 1. 获取 Firebase 客户端配置

您需要从 Firebase 控制台获取以下信息：

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 选择您的项目 `tomtrove-7a7cd`
3. 点击项目设置（齿轮图标）
4. 滚动到"您的应用"部分
5. 选择 Web 应用或添加新的 Web 应用
6. 复制配置对象

## 2. 更新环境变量

在您的 `.env` 文件中更新以下配置：

```bash
# Firebase 配置 (客户端)
VITE_FIREBASE_API_KEY=您的API密钥
VITE_FIREBASE_AUTH_DOMAIN=tomtrove-7a7cd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tomtrove-7a7cd
VITE_FIREBASE_STORAGE_BUCKET=tomtrove-7a7cd.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=116432306095269400716
VITE_FIREBASE_APP_ID=您的应用ID
```

## 3. 启用 Firebase 认证

1. 在 Firebase 控制台中，转到"身份验证"
2. 点击"开始使用"
3. 在"登录方法"标签页中启用：
   - 电子邮件/密码
   - Google

## 4. 创建测试用户

1. 在 Firebase 控制台的"身份验证"部分
2. 点击"用户"标签页
3. 点击"添加用户"创建测试账户

## 5. 测试登录功能

启动开发服务器：
```bash
npm run dev
```

访问 http://localhost:3000/login 测试登录功能

## 6. 常见问题解决

### 问题1：Firebase 配置错误
- 确保所有环境变量都正确设置
- 检查 API 密钥和应用 ID 是否正确

### 问题2：认证失败
- 确保在 Firebase 控制台中启用了相应的登录方法
- 检查用户是否存在于 Firebase 中

### 问题3：权限问题
- 确保用户有管理员权限
- 检查后端 API 的权限验证逻辑

## 7. 安全注意事项

- 不要在前端代码中暴露服务账户私钥
- 使用环境变量管理敏感配置
- 在生产环境中使用 HTTPS
- 定期轮换 API 密钥
