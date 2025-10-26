// 用户相关类型
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLoginAt?: string;
}

// 翻译主题类型
export interface Topic {
  id: string;
  name: Record<string, string>; // 多语言名称
  description: Record<string, string>; // 多语言描述
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sentenceCount?: number; // 句子数量（用于统计）
}

export interface TopicCreateRequest {
  name: Record<string, string>;
  description: Record<string, string>;
  isActive?: boolean;
}

export interface TopicUpdateRequest {
  name?: Record<string, string>;
  description?: Record<string, string>;
  isActive?: boolean;
}

export interface TopicQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'name' | 'sentenceCount';
  sortOrder?: 'asc' | 'desc';
}

// 翻译句子类型
export interface Sentence {
  id: string;
  topic_id: string;
  original_text: string;
  expected_translations: string[]; // 后端返回的是数组
  hints?: {
    keywords: string[];
    chinese_hints: string[];
    english_hints: string[];
  };
  difficulty: '初级' | '中级' | '高级'; // 后端使用中文
  order: number;
  is_active: boolean;
  created_at: string;
  topic?: Topic; // 关联的主题信息
}

export interface SentenceCreateRequest {
  topic_id: string;
  original_text: string;
  expected_translations: string[];
  hints?: {
    keywords: string[];
    chinese_hints: string[];
    english_hints: string[];
  };
  difficulty: '初级' | '中级' | '高级';
  order?: number;
  is_active?: boolean;
}

export interface SentenceUpdateRequest {
  topic_id?: string;
  original_text?: string;
  expected_translations?: string[];
  hints?: {
    keywords: string[];
    chinese_hints: string[];
    english_hints: string[];
  };
  difficulty?: '初级' | '中级' | '高级';
  order?: number;
  is_active?: boolean;
}

export interface SentenceQueryParams {
  page?: number;
  limit?: number;
  topic_id?: string;
  difficulty?: '初级' | '中级' | '高级';
  is_active?: boolean;
  search?: string;
  sortBy?: 'created_at' | 'order' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

// 用户尝试记录类型
export interface Attempt {
  id: string;
  userId: string;
  sentenceId: string;
  userTranslation: string;
  score: number;
  feedback: string;
  llmAnalysis: {
    accuracy: number;
    fluency: number;
    completeness: number;
    suggestions: string[];
  };
  createdAt: string;
  user?: User;
  sentence?: Sentence;
}

export interface AttemptQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  sentenceId?: string;
  topicId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minScore?: number;
  maxScore?: number;
  sortBy?: 'createdAt' | 'score';
  sortOrder?: 'asc' | 'desc';
}

// 错题本类型
export interface Mistake {
  id: string;
  userId: string;
  sentenceId: string;
  attemptId: string;
  mistakeType: 'grammar' | 'vocabulary' | 'structure' | 'other';
  description: string;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  user?: User;
  sentence?: Sentence;
  attempt?: Attempt;
}

export interface MistakeQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  sentenceId?: string;
  topicId?: string;
  mistakeType?: 'grammar' | 'vocabulary' | 'structure' | 'other';
  isResolved?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'mistakeType';
  sortOrder?: 'asc' | 'desc';
}

// 统计数据类型
export interface Statistics {
  overview: {
    totalTopics: number;
    totalSentences: number;
    totalAttempts: number;
    totalUsers: number;
    averageScore: number;
    successRate: number;
    // 用户增长相关统计
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
    userRetentionRate: number; // 用户留存率
  };
  trends: {
    dailyAttempts: Array<{
      date: string;
      count: number;
      averageScore: number;
    }>;
    weeklySuccessRate: Array<{
      week: string;
      rate: number;
    }>;
    // 用户增长趋势
    dailyUserGrowth: Array<{
      date: string;
      newUsers: number;
      activeUsers: number;
    }>;
    weeklyUserGrowth: Array<{
      week: string;
      newUsers: number;
      activeUsers: number;
    }>;
    monthlyUserGrowth: Array<{
      month: string;
      newUsers: number;
      activeUsers: number;
    }>;
  };
  topicStats: Array<{
    topicId: string;
    topicName: string;
    attemptCount: number;
    averageScore: number;
    successRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'attempt' | 'mistake' | 'topic_created' | 'sentence_created' | 'user_registered';
    description: string;
    timestamp: string;
    userId?: string;
    userName?: string;
  }>;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 通用查询参数
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 表单相关类型
export interface FormState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

// 表格列配置类型
export interface TableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

// 多语言配置
export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

// 主题色彩配置
export const THEME_COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  text: '#262626',
  textSecondary: '#8c8c8c',
  border: '#d9d9d9',
  background: '#f5f5f5',
} as const;
