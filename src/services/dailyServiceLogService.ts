import api from './api';

export interface PersonnelData {
  name: string;
  position: string;
  hours?: number;
}

export interface EquipmentData {
  name: string;
  hours?: number;
}

export interface ApprovalData {
  name: string;
  signature?: string;
  date: string;
}

export interface CreateDailyServiceLogData {
  client_id: number;
  field: string;
  well: string;
  contract: string;
  job_no: string;
  date: string;
  linked_job_id?: string;
  personnel?: PersonnelData[];
  equipment_used?: EquipmentData[];
  almansoori_rep?: PersonnelData[];
  mog_approval_1?: ApprovalData;
  mog_approval_2?: ApprovalData;
}

export interface UpdateDailyServiceLogData extends Partial<CreateDailyServiceLogData> {
  id: string;
}

export interface DailyServiceLogResponse {
  id: string;
  log_number: string;
  client_id: number;
  field: string;
  well: string;
  contract: string;
  job_no: string;
  date: string;
  linked_job_id?: string;
  personnel?: PersonnelData[];
  equipment_used?: EquipmentData[];
  almansoori_rep?: PersonnelData[];
  mog_approval_1?: ApprovalData;
  mog_approval_2?: ApprovalData;
  excel_file_path?: string;
  excel_file_name?: string;
  pdf_file_path?: string;
  pdf_file_name?: string;
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

// Interface for Excel generation response
export interface ExcelGenerationResponse {
  success: boolean;
  data: {
    file_path: string;
    file_name: string;
    download_url: string;
    public_download_url: string;
    force_download_url: string;
  };
  message: string;
}

class DailyServiceLogService {
  private baseUrl = '/daily-logs';

  async getDailyServiceLogs(): Promise<DailyServiceLogResponse[]> {
    try {
      const response = await api.get(this.baseUrl);
      console.log('Raw API response for daily logs:', response);
      
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
      console.error('Error fetching daily service logs:', error);
      return [];
    }
  }

  async getDailyServiceLog(id: string): Promise<DailyServiceLogResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily service log:', error);
      throw error;
    }
  }

  async createDailyServiceLog(data: CreateDailyServiceLogData): Promise<DailyServiceLogResponse> {
    try {
      console.log('Sending data to API:', data);
      const response = await api.post(this.baseUrl, data);
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating daily service log:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  }

  async updateDailyServiceLog(id: string, data: Partial<CreateDailyServiceLogData>): Promise<DailyServiceLogResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating daily service log:', error);
      throw error;
    }
  }

  async deleteDailyServiceLog(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting daily service log:', error);
      throw error;
    }
  }

  async generateExcel(id: string): Promise<ExcelGenerationResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/generate-excel`);
      return response.data;
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  }

  async downloadExcel(id: string): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/download-excel`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading Excel:', error);
      throw error;
    }
  }
}

export default new DailyServiceLogService(); 