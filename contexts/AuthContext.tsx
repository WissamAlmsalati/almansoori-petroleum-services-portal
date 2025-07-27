import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import authService from '../services/authService';
import { useMessages } from './MessageContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useMessages();

  // التحقق من وجود token عند تحميل التطبيق
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            // التحقق من صحة token مع الخادم
            try {
              const response = await authService.getCurrentUser();
              if (response.success && response.data) {
                setUser(response.data);
              }
            } catch (error) {
              // إذا فشل في الحصول على بيانات المستخدم، نقوم بتسجيل الخروج
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        showSuccess(response.message || 'تم تسجيل الدخول بنجاح');
        return true;
      } else {
        showError('فشل في تسجيل الدخول');
        return false;
      }
    } catch (error: any) {
      showError(error.message || 'حدث خطأ أثناء تسجيل الدخول');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      showSuccess('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      // حتى لو فشل الطلب، نقوم بتسجيل الخروج محلياً
      setUser(null);
      showError(error.message || 'حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      showError(error.message || 'فشل في تحديث بيانات المستخدم');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
