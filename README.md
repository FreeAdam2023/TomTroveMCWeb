# TomTrove 翻译练习管理系统

基于 React + TypeScript + Ant Design 的现代化翻译练习管理系统，提供完整的主题管理、句子管理、用户尝试记录和统计分析功能。

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript
- **UI 组件库**: Ant Design 5.x
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **图表库**: ECharts
- **认证**: Firebase Auth
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
src/
├── components/          # 通用组件
│   ├── DataTable/       # 数据表格组件
│   ├── MultilingualInput/ # 多语言输入组件
│   └── StatCard/        # 统计卡片组件
├── layouts/             # 布局组件
│   └── AdminLayout.tsx  # 管理后台布局
├── pages/               # 页面组件
│   ├── LoginPage.tsx    # 登录页面
│   ├── DashboardPage.tsx # 仪表板
│   ├── TopicManagementPage.tsx # 主题管理
│   └── SentenceManagementPage.tsx # 句子管理
├── services/            # API 服务
│   ├── api.ts          # HTTP 客户端配置
│   ├── authService.ts  # 认证服务
│   └── translationService.ts # 翻译服务
├── stores/              # 状态管理
│   └── index.ts        # Zustand stores
├── types/               # TypeScript 类型定义
│   └── index.ts        # 全局类型
├── routes/              # 路由配置
│   └── index.tsx       # 路由组件
├── styles/              # 样式文件
│   └── index.css       # 全局样式
└── main.tsx            # 应用入口
```

## 🛠️ 安装和运行

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量配置文件：
```bash
cp env.example .env.local
```

2. 配置 Firebase 项目信息：
```bash
# 在 .env.local 中配置你的 Firebase 项目信息
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... 其他配置
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🔧 功能特性

### 核心功能

- ✅ **用户认证**: Firebase 认证集成，支持邮箱密码和 Google 登录
- ✅ **主题管理**: 创建、编辑、删除翻译主题，支持多语言
- ✅ **句子管理**: 管理翻译句子，支持难度分级和排序
- ✅ **尝试记录**: 查看用户翻译尝试记录和评分
- ✅ **错题管理**: 管理用户错题本，支持标记解决状态
- ✅ **统计分析**: 数据统计和趋势分析

### 技术特性

- 🎨 **现代化 UI**: 基于 Ant Design 的美观界面
- 📱 **响应式设计**: 支持桌面端和移动端
- 🔒 **权限控制**: 基于角色的访问控制
- 🌍 **多语言支持**: 支持中文、英文等多语言
- ⚡ **性能优化**: 虚拟滚动、懒加载等优化
- 🛡️ **类型安全**: 完整的 TypeScript 类型定义

## 📊 API 接口

### 基础信息

- **Base URL**: `http://localhost:8000/api/v1`
- **认证方式**: Firebase ID Token (Bearer Token)
- **管理 API 路径**: `/admin/translation/*`

### 主要接口

#### 主题管理
- `GET /admin/translation/topics` - 获取主题列表
- `POST /admin/translation/topics` - 创建主题
- `PUT /admin/translation/topics/{id}` - 更新主题
- `DELETE /admin/translation/topics/{id}` - 删除主题

#### 句子管理
- `GET /admin/translation/sentences` - 获取句子列表
- `POST /admin/translation/sentences` - 创建句子
- `PUT /admin/translation/sentences/{id}` - 更新句子
- `DELETE /admin/translation/sentences/{id}` - 删除句子

#### 统计分析
- `GET /admin/translation/statistics` - 获取统计数据
- `GET /admin/translation/statistics/topics` - 获取主题统计

## 🎨 主题定制

系统支持自定义主题色彩，在 `src/main.tsx` 中修改主题配置：

```typescript
const theme = {
  token: {
    colorPrimary: '#1890ff',    // 主色调
    colorSuccess: '#52c41a',   // 成功色
    colorWarning: '#faad14',    // 警告色
    colorError: '#f5222d',      // 错误色
    // ... 其他配置
  },
};
```

## 📝 开发规范

### 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 遵循 ESLint 和 Prettier 规范
- 组件和函数添加 JSDoc 注释

### Git 提交规范

```bash
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 🚀 部署

### Docker 部署

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境变量

生产环境需要配置以下环境变量：

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_FIREBASE_API_KEY=your-production-firebase-key
# ... 其他 Firebase 配置
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: your-email@example.com
- GitHub Issues: [项目 Issues 页面](https://github.com/your-username/tomtrove-admin/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
