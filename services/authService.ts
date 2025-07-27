import api from './api';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Manager' | 'User';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

class AuthService {
  /**
   * تسجيل الدخول
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // حفظ token و user data في localStorage
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * تسجيل مستخدم جديد (Admin only)
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      const response = await api.post<ApiResponse<User>>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * تسجيل الخروج
   */
  async logout(): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/logout');
      
      // إزالة البيانات من localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      return response.data;
    } catch (error: any) {
      // حتى لو فشل الطلب، نزيل البيانات من localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      throw this.handleError(error);
    }
  }

  /**
   * الحصول على بيانات المستخدم الحالي
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        // تحديث بيانات المستخدم في localStorage
        localStorage.setItem('user_data', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * التحقق من وجود token صالح
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * الحصول على بيانات المستخدم من localStorage
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * الحصول على token من localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * معالجة الأخطاء
   */
  private handleError(error: any): Error {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error) {
        return new Error(errorData.error.message || errorData.message || 'حدث خطأ غير متوقع');
      }
      return new Error(errorData.message || 'حدث خطأ غير متوقع');
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('حدث خطأ في الاتصال بالخادم');
  }
}

export default new AuthService();
