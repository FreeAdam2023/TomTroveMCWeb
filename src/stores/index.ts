import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  User, 
  Topic, 
  Sentence, 
  Attempt, 
  Mistake, 
  Statistics,
  PaginatedResponse 
} from '@/types';

// 认证状态接口
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// 主题管理状态接口
interface TopicState {
  topics: Topic[];
  currentTopic: Topic | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setTopics: (topics: Topic[]) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<TopicState['pagination']>) => void;
  addTopic: (topic: Topic) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  removeTopic: (id: string) => void;
}

// 句子管理状态接口
interface SentenceState {
  sentences: Sentence[];
  currentSentence: Sentence | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setSentences: (sentences: Sentence[]) => void;
  setCurrentSentence: (sentence: Sentence | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<SentenceState['pagination']>) => void;
  addSentence: (sentence: Sentence) => void;
  updateSentence: (id: string, updates: Partial<Sentence>) => void;
  removeSentence: (id: string) => void;
}

// 尝试记录状态接口
interface AttemptState {
  attempts: Attempt[];
  currentAttempt: Attempt | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setAttempts: (attempts: Attempt[]) => void;
  setCurrentAttempt: (attempt: Attempt | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<AttemptState['pagination']>) => void;
}

// 错题管理状态接口
interface MistakeState {
  mistakes: Mistake[];
  currentMistake: Mistake | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setMistakes: (mistakes: Mistake[]) => void;
  setCurrentMistake: (mistake: Mistake | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<MistakeState['pagination']>) => void;
  resolveMistake: (id: string) => void;
}

// 统计状态接口
interface StatisticsState {
  statistics: Statistics | null;
  loading: boolean;
  error: string | null;
  setStatistics: (statistics: Statistics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// UI 状态接口
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: string;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
}

// 创建认证状态 store
export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
);

// 创建主题管理状态 store
export const useTopicStore = create<TopicState>()(
  devtools(
    (set, get) => ({
      topics: [],
      currentTopic: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      setTopics: (topics) => set({ topics }),
      setCurrentTopic: (currentTopic) => set({ currentTopic }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      addTopic: (topic) => set((state) => ({
        topics: [topic, ...state.topics]
      })),
      updateTopic: (id, updates) => set((state) => ({
        topics: state.topics.map(topic => 
          topic.id === id ? { ...topic, ...updates } : topic
        ),
        currentTopic: state.currentTopic?.id === id 
          ? { ...state.currentTopic, ...updates }
          : state.currentTopic
      })),
      removeTopic: (id) => set((state) => ({
        topics: state.topics.filter(topic => topic.id !== id),
        currentTopic: state.currentTopic?.id === id ? null : state.currentTopic
      })),
    }),
    { name: 'topic-store' }
  )
);

// 创建句子管理状态 store
export const useSentenceStore = create<SentenceState>()(
  devtools(
    (set, get) => ({
      sentences: [],
      currentSentence: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      setSentences: (sentences) => set({ sentences }),
      setCurrentSentence: (currentSentence) => set({ currentSentence }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      addSentence: (sentence) => set((state) => ({
        sentences: [sentence, ...state.sentences]
      })),
      updateSentence: (id, updates) => set((state) => ({
        sentences: state.sentences.map(sentence => 
          sentence.id === id ? { ...sentence, ...updates } : sentence
        ),
        currentSentence: state.currentSentence?.id === id 
          ? { ...state.currentSentence, ...updates }
          : state.currentSentence
      })),
      removeSentence: (id) => set((state) => ({
        sentences: state.sentences.filter(sentence => sentence.id !== id),
        currentSentence: state.currentSentence?.id === id ? null : state.currentSentence
      })),
    }),
    { name: 'sentence-store' }
  )
);

// 创建尝试记录状态 store
export const useAttemptStore = create<AttemptState>()(
  devtools(
    (set) => ({
      attempts: [],
      currentAttempt: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      setAttempts: (attempts) => set({ attempts }),
      setCurrentAttempt: (currentAttempt) => set({ currentAttempt }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
    }),
    { name: 'attempt-store' }
  )
);

// 创建错题管理状态 store
export const useMistakeStore = create<MistakeState>()(
  devtools(
    (set) => ({
      mistakes: [],
      currentMistake: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      setMistakes: (mistakes) => set({ mistakes }),
      setCurrentMistake: (currentMistake) => set({ currentMistake }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      resolveMistake: (id) => set((state) => ({
        mistakes: state.mistakes.map(mistake => 
          mistake.id === id 
            ? { ...mistake, isResolved: true, resolvedAt: new Date().toISOString() }
            : mistake
        ),
        currentMistake: state.currentMistake?.id === id 
          ? { ...state.currentMistake, isResolved: true, resolvedAt: new Date().toISOString() }
          : state.currentMistake
      })),
    }),
    { name: 'mistake-store' }
  )
);

// 创建统计状态 store
export const useStatisticsStore = create<StatisticsState>()(
  devtools(
    (set) => ({
      statistics: null,
      loading: false,
      error: null,
      setStatistics: (statistics) => set({ statistics }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: 'statistics-store' }
  )
);

// 创建 UI 状态 store
export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      language: 'zh',
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'ui-store' }
  )
);
