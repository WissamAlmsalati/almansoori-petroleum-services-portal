import api from './api';
import { CallOutJob } from '../types';

export interface CreateCallOutJobData {
  client_id: number;
  job_name: string;
  work_order_number: string;
  description?: string;
  priority?: string;
  status?: string;
  start_date: string;
  end_date: string;
}

export interface UpdateCallOutJobData extends Partial<CreateCallOutJobData> {
  id: string;
}

export interface CallOutJobResponse {
  id: string;
  client_id: number;
  job_name: string;
  work_order_number: string;
  description?: string;
  priority?: string;
  status?: string;
  start_date: string;
  end_date: string;
  documents: any[];
  created_at?: string;
  updated_at?: string;
  client?: {
    id: number;
    name: string;
    logo_url?: string;
    logo_file_path?: string;
    contacts?: any[];
  };
}

class CallOutJobService {
  private baseUrl = '/call-out-jobs';

  async getCallOutJobs(): Promise<CallOutJobResponse[]> {
    try {
      const response = await api.get(this.baseUrl);
      console.log('Raw API response:', response);
      
      // Handle the Laravel API response structure
      let data = response.data;
      
      // Check if it's a success response with nested data
      if (data && data.success && data.data && data.data.data && Array.isArray(data.data.data)) {
        console.log('Extracting data from success response with pagination:', data.data.data);
        data = data.data.data;
      }
      // Check if it's a paginated response without success wrapper
      else if (data && data.data && Array.isArray(data.data)) {
        console.log('Extracting data from paginated response:', data.data);
        data = data.data;
      }
      // Check if it's a direct array
      else if (Array.isArray(data)) {
        console.log('Data is already an array:', data);
      }
      
      // If data is not an array, return empty array
      if (!Array.isArray(data)) {
        console.warn('API returned non-array data:', data);
        return [];
      }
      
      console.log('Final data to return:', data);
      return data;
    } catch (error) {
      console.error('Error fetching call out jobs:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  async getCallOutJob(id: string): Promise<CallOutJobResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call out job:', error);
      throw error;
    }
  }

  async createCallOutJob(data: CreateCallOutJobData): Promise<CallOutJobResponse> {
    try {
      console.log('Sending data to API:', data);
      const response = await api.post(this.baseUrl, data);
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating call out job:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      
      // If it's a 422 error or any other error, throw it to be handled by the hook
      throw error;
    }
  }

  async updateCallOutJob(id: string, data: Partial<CreateCallOutJobData>): Promise<CallOutJobResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating call out job:', error);
      throw error;
    }
  }

  async deleteCallOutJob(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting call out job:', error);
      throw error;
    }
  }
}

export default new CallOutJobService(); 