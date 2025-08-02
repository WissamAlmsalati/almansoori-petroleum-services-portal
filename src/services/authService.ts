import api from './api';

// Types for Authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
    token: string;
    token_type: string;
    expires_in: number;
  };
  message: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Set token in localStorage
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Get user from localStorage
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user in localStorage
  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Remove user from localStorage
  removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('Logging in with credentials:', credentials);
      
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response);
      
      const loginData = response.data;
      
      if (loginData.success && loginData.data) {
        // Save token and user data
        this.setToken(loginData.data.token);
        this.setUser(loginData.data.user);
        
        // Update API default headers with new token
        this.updateApiHeaders(loginData.data.token);
      }
      
      return loginData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  logout(): void {
    // Remove token and user data
    this.removeToken();
    this.removeUser();
    
    // Clear API default headers
    this.clearApiHeaders();
    
    // Redirect to login page
    window.location.href = '/';
  }

  // Update API headers with token
  updateApiHeaders(token: string): void {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Clear API headers
  clearApiHeaders(): void {
    delete api.defaults.headers.common['Authorization'];
  }

  // Initialize auth state (call this on app startup)
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.updateApiHeaders(token);
    }
  }

  // Refresh token (if needed)
  async refreshToken(): Promise<boolean> {
    try {
      const response = await api.post('/auth/refresh');
      const data = response.data;
      
      if (data.success && data.data && data.data.token) {
        this.setToken(data.data.token);
        this.updateApiHeaders(data.data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      const data = response.data;
      
      if (data.success && data.data) {
        this.setUser(data.data);
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

export default new AuthService();
