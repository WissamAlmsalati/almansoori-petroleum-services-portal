import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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

  // Check if user is authenticated on app startup
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Initialize auth service
      authService.initializeAuth();
      
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        // Get stored user data
        const storedUser = authService.getUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Try to get current user from API
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // Invalid token, logout
            authService.logout();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
