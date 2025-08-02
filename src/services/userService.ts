import api from './api';

// Types for User Management
export interface UserRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: UserRole[];
  avatar_url?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  avatar?: File;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  avatar?: File;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UserFilters {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  admin_users: number;
  manager_users: number;
  user_users: number;
  recent_registrations: number;
}

export interface UserActivityLog {
  id: number;
  user_id: number;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserResponse {
  success: boolean;
  data: User | User[];
  message: string;
}

export interface ResetPasswordData {
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

class UserService {
  private baseUrl = '/users';

  async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      console.log('Users API response:', response);
      
      // Handle different response structures
      let data;
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        data = response.data.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        data = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  async getAvailableRoles(): Promise<string[]> {
    try {
      const response = await api.get(`${this.baseUrl}/roles`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      console.log('Creating user with data:', data);
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.password_confirmation);
      formData.append('role', data.role);
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await api.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      console.log('Updating user with data:', data);
      
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.role) formData.append('role', data.role);
      if (data.status) formData.append('status', data.status);
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await api.put(`${this.baseUrl}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async resetUserPassword(id: string, data: ResetPasswordData): Promise<void> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/reset-password`, data);
      return response.data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  }

  async getUserActivityLog(id: string): Promise<UserActivityLog[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/activity-log`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching user activity log:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async bulkDeleteUsers(userIds: number[]): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/bulk-delete`, { user_ids: userIds });
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  }

  // Profile Management
  async getMyProfile(): Promise<User> {
    try {
      const response = await api.get('/profile');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateMyProfile(data: { name?: string; email?: string; avatar?: File }): Promise<User> {
    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      const response = await api.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      const response = await api.post('/profile/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}

export default new UserService(); 