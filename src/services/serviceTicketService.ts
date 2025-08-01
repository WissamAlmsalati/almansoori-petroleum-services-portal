import api from './api';

// Types for Service Tickets
export interface ServiceTicketDocument {
  name: string;
  file_path: string;
  file_type: string;
  upload_date: string;
}

export interface CreateServiceTicketData {
  client_id: number;
  sub_agreement_id?: number | null;
  call_out_job_id?: number | null;
  date: string;
  status: string;
  amount: number;
  related_log_ids?: number[];
  documents?: ServiceTicketDocument[];
}

export interface UpdateServiceTicketData extends Partial<CreateServiceTicketData> {
  id: string;
}

export interface ServiceTicketResponse {
  id: number;
  ticket_number: string;
  client_id: number;
  sub_agreement_id?: number | null;
  call_out_job_id?: number | null;
  date: string;
  status: string;
  amount: number;
  related_log_ids?: number[];
  documents?: ServiceTicketDocument[];
  created_at?: string;
  updated_at?: string;
  client?: {
    id: number;
    name: string;
    logo_url?: string;
    logo_file_path?: string;
    contacts?: any[];
  };
  sub_agreement?: {
    id: number;
    name: string;
    amount: number;
    balance: number;
  };
  call_out_job?: {
    id: number;
    job_name: string;
    work_order_number: string;
  };
}

export interface GenerateServiceTicketData {
  client_id: number;
  log_ids: number[];
  sub_agreement_id?: number | null;
  call_out_job_id?: number | null;
  date: string;
  status: string;
  amount: number;
}

class ServiceTicketService {
  private baseUrl = '/service-tickets';

  async getServiceTickets(): Promise<ServiceTicketResponse[]> {
    try {
      const response = await api.get(this.baseUrl);
      console.log('Raw API response for service tickets:', response);
      
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
      console.error('Error fetching service tickets:', error);
      return [];
    }
  }

  async getServiceTicket(id: string): Promise<ServiceTicketResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service ticket:', error);
      throw error;
    }
  }

  async createServiceTicket(data: CreateServiceTicketData): Promise<ServiceTicketResponse> {
    try {
      console.log('Sending data to API:', data);
      const response = await api.post(this.baseUrl, data);
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating service ticket:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  }

  async updateServiceTicket(id: string, data: Partial<CreateServiceTicketData>): Promise<ServiceTicketResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating service ticket:', error);
      throw error;
    }
  }

  async deleteServiceTicket(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting service ticket:', error);
      throw error;
    }
  }

  async getServiceTicketsByClient(clientId: string): Promise<ServiceTicketResponse[]> {
    try {
      const response = await api.get(`${this.baseUrl}/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service tickets by client:', error);
      throw error;
    }
  }

  async generateServiceTicket(data: GenerateServiceTicketData): Promise<ServiceTicketResponse> {
    try {
      console.log('Sending generate data to API:', data);
      const response = await api.post(`${this.baseUrl}/generate`, data);
      console.log('Generate API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error generating service ticket:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  }
}

export default new ServiceTicketService(); 