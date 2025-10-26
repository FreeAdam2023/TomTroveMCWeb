import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { User } from '@/types';

// Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google 认证提供者
const googleProvider = new GoogleAuthProvider();

// 认证服务类
class AuthService {
  private currentUser: User | null = null;
  private authListeners: Array<(user: User | null) => void> = [];

  constructor() {
    // 监听认证状态变化
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // 获取 ID Token
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebase_token', token);
          
          // 构建用户信息
          this.currentUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            role: 'admin', // 这里应该从后端获取用户角色
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          };
          
          // 保存用户信息到本地存储
          localStorage.setItem('user_info', JSON.stringify(this.currentUser));
          
          // 通知所有监听器
          this.authListeners.forEach(listener => listener(this.currentUser));
        } catch (error) {
          console.error('获取用户信息失败:', error);
          this.currentUser = null;
          this.authListeners.forEach(listener => listener(null));
        }
      } else {
        this.currentUser = null;
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('user_info');
        this.authListeners.forEach(listener => listener(null));
      }
    });
  }

  // 邮箱密码登录
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // 验证用户是否为管理员
      await this.verifyAdminRole(token);
      
      return this.currentUser!;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Google 登录
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      // 验证用户是否为管理员
      await this.verifyAdminRole(token);
      
      return this.currentUser!;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // 登出
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      localStorage.removeItem('firebase_token');
      localStorage.removeItem('user_info');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 获取 ID Token
  async getIdToken(): Promise<string | null> {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return localStorage.getItem('firebase_token');
  }

  // 刷新 Token
  async refreshToken(): Promise<string | null> {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    return null;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // 检查是否为管理员
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // 添加认证状态监听器
  onAuthStateChange(listener: (user: User | null) => void): () => void {
    this.authListeners.push(listener);
    
    // 返回取消监听的函数
    return () => {
      const index = this.authListeners.indexOf(listener);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  // 验证管理员角色
  private async verifyAdminRole(token: string): Promise<void> {
    try {
      // 这里应该调用后端 API 验证用户角色
      // 暂时跳过验证，直接设置为管理员
      console.log('验证管理员角色:', token);
    } catch (error) {
      console.error('验证管理员角色失败:', error);
      throw new Error('您没有管理员权限');
    }
  }

  // 获取错误信息
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': '用户不存在',
      'auth/wrong-password': '密码错误',
      'auth/invalid-email': '邮箱格式不正确',
      'auth/user-disabled': '用户已被禁用',
      'auth/too-many-requests': '请求过于频繁，请稍后再试',
      'auth/network-request-failed': '网络连接失败',
      'auth/popup-closed-by-user': '登录窗口被关闭',
      'auth/cancelled-popup-request': '登录被取消',
    };
    
    return errorMessages[errorCode] || '登录失败，请重试';
  }
}

// 创建认证服务实例
export const authService = new AuthService();

// 导出 Firebase 实例
export { auth, app };
export default authService;
