import { api } from './api';
import type {
  Topic,
  TopicCreateRequest,
  TopicUpdateRequest,
  TopicQueryParams,
  Sentence,
  SentenceCreateRequest,
  SentenceUpdateRequest,
  SentenceQueryParams,
  Attempt,
  AttemptQueryParams,
  Mistake,
  MistakeQueryParams,
  Statistics,
  PaginatedResponse,
} from '@/types';

// 翻译主题管理 API
export const topicService = {
  // 获取主题列表
  getTopics: (params?: TopicQueryParams): Promise<PaginatedResponse<Topic>> =>
    api.get('/admin/translation/topics', { params }),
    
  // 创建新主题
  createTopic: (data: TopicCreateRequest): Promise<Topic> =>
    api.post('/admin/translation/topics', data),
    
  // 获取单个主题
  getTopic: (id: string): Promise<Topic> =>
    api.get(`/admin/translation/topics/${id}`),
    
  // 更新主题
  updateTopic: (id: string, data: TopicUpdateRequest): Promise<Topic> =>
    api.put(`/admin/translation/topics/${id}`, data),
    
  // 删除主题
  deleteTopic: (id: string): Promise<void> =>
    api.delete(`/admin/translation/topics/${id}`),
    
  // 批量更新主题状态
  batchUpdateTopics: (ids: string[], isActive: boolean): Promise<void> =>
    api.patch('/admin/translation/topics/batch', { ids, isActive }),
};

// 翻译句子管理 API
export const sentenceService = {
  // 获取句子列表
  getSentences: (params?: SentenceQueryParams): Promise<PaginatedResponse<Sentence>> =>
    api.get('/admin/translation/sentences', { params }),
    
  // 创建新句子
  createSentence: (data: SentenceCreateRequest): Promise<Sentence> =>
    api.post('/admin/translation/sentences', data),
    
  // 获取单个句子
  getSentence: (id: string): Promise<Sentence> =>
    api.get(`/admin/translation/sentences/${id}`),
    
  // 更新句子
  updateSentence: (id: string, data: SentenceUpdateRequest): Promise<Sentence> =>
    api.put(`/admin/translation/sentences/${id}`, data),
    
  // 删除句子
  deleteSentence: (id: string): Promise<void> =>
    api.delete(`/admin/translation/sentences/${id}`),
    
  // 批量更新句子顺序
  batchUpdateOrder: (updates: Array<{ id: string; order: number }>): Promise<void> =>
    api.patch('/admin/translation/sentences/batch-order', { updates }),
    
  // 批量导入句子
  importSentences: (data: { topicId: string; sentences: SentenceCreateRequest[] }): Promise<void> =>
    api.post('/admin/translation/sentences/import', data),
    
  // 导出句子
  exportSentences: (params?: SentenceQueryParams): Promise<Blob> =>
    api.get('/admin/translation/sentences/export', { 
      params, 
      responseType: 'blob' 
    }),
};

// 用户尝试记录管理 API
export const attemptService = {
  // 获取尝试记录列表
  getAttempts: (params?: AttemptQueryParams): Promise<PaginatedResponse<Attempt>> =>
    api.get('/admin/translation/attempts', { params }),
    
  // 获取单个尝试记录
  getAttempt: (id: string): Promise<Attempt> =>
    api.get(`/admin/translation/attempts/${id}`),
    
  // 导出尝试记录
  exportAttempts: (params?: AttemptQueryParams): Promise<Blob> =>
    api.get('/admin/translation/attempts/export', { 
      params, 
      responseType: 'blob' 
    }),
};

// 错题本管理 API
export const mistakeService = {
  // 获取错题列表
  getMistakes: (params?: MistakeQueryParams): Promise<PaginatedResponse<Mistake>> =>
    api.get('/admin/translation/mistakes', { params }),
    
  // 获取单个错题
  getMistake: (id: string): Promise<Mistake> =>
    api.get(`/admin/translation/mistakes/${id}`),
    
  // 标记错题为已解决
  resolveMistake: (id: string): Promise<void> =>
    api.put(`/admin/translation/mistakes/${id}/resolve`),
    
  // 批量解决错题
  batchResolveMistakes: (ids: string[]): Promise<void> =>
    api.patch('/admin/translation/mistakes/batch-resolve', { ids }),
};

// 统计分析 API
export const statisticsService = {
  // 获取整体统计数据
  getStatistics: (): Promise<Statistics> =>
    api.get('/admin/translation/statistics'),
    
  // 获取主题统计数据
  getTopicStatistics: (): Promise<Statistics['topicStats']> =>
    api.get('/admin/translation/statistics/topics'),
    
  // 获取趋势数据
  getTrends: (period: '7d' | '30d' | '90d'): Promise<Statistics['trends']> =>
    api.get('/admin/translation/statistics/trends', { 
      params: { period } 
    }),
    
  // 获取最近活动
  getRecentActivity: (limit?: number): Promise<Statistics['recentActivity']> =>
    api.get('/admin/translation/statistics/recent-activity', { 
      params: { limit } 
    }),
};

// 用户管理 API
export const userService = {
  // 获取用户列表
  getUsers: (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<any>> =>
    api.get('/admin/users', { params }),
    
  // 获取用户详情
  getUser: (id: string): Promise<any> =>
    api.get(`/admin/users/${id}`),
    
  // 更新用户信息
  updateUser: (id: string, data: any): Promise<any> =>
    api.put(`/admin/users/${id}`, data),
};

// 文件上传 API
export const uploadService = {
  // 上传文件
  uploadFile: (file: File, type: 'image' | 'document'): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 导出所有服务
export const translationService = {
  topics: topicService,
  sentences: sentenceService,
  attempts: attemptService,
  mistakes: mistakeService,
  statistics: statisticsService,
  users: userService,
  upload: uploadService,
};
