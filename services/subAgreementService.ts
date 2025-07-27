import api from './api';
import { SubAgreement, Client } from '../types';

// Laravel API response interfaces
interface LaravelSubAgreement {
  id: number;
  client_id: number;
  name: string;
  amount: string;
  balance: string;
  start_date: string;
  end_date: string;
  file_path: string | null;
  file_name: string | null;
  created_at: string;
  updated_at: string;
  client?: LaravelClient;
}

interface LaravelClient {
  id: number;
  name: string;
  logo_url: string | null;
  logo_file_path: string | null;
  created_at: string;
  updated_at: string;
  contacts: LaravelContact[];
}

interface LaravelContact {
  id: number;
  client_id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  created_at: string;
  updated_at: string;
}

interface LaravelSubAgreementsResponse {
  success: boolean;
  data: {
    current_page: number;
    data: LaravelSubAgreement[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  message: string;
}

interface LaravelSubAgreementResponse {
  success: boolean;
  data: LaravelSubAgreement;
  message: string;
}

// Transform Laravel sub-agreement to frontend format
const transformSubAgreement = (laravelSubAgreement: LaravelSubAgreement): SubAgreement => {
  return {
    id: laravelSubAgreement.id.toString(),
    clientId: laravelSubAgreement.client_id.toString(),
    name: laravelSubAgreement.name,
    amount: parseFloat(laravelSubAgreement.amount),
    balance: parseFloat(laravelSubAgreement.balance),
    startDate: laravelSubAgreement.start_date.split('T')[0], // Convert to YYYY-MM-DD format
    endDate: laravelSubAgreement.end_date.split('T')[0], // Convert to YYYY-MM-DD format
    fileName: laravelSubAgreement.file_name || undefined
  };
};

// Transform Laravel client to frontend format (for nested client data)
const transformClient = (laravelClient: LaravelClient): Client => {
  return {
    id: laravelClient.id.toString(),
    name: laravelClient.name,
    logoUrl: laravelClient.logo_url || `https://picsum.photos/seed/cli${laravelClient.id}/40/40`,
    contacts: laravelClient.contacts.map(contact => ({
      id: contact.id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      position: contact.position
    }))
  };
};

const subAgreementService = {
  // Get all sub-agreements with pagination
  async getSubAgreements(page: number = 1, perPage: number = 15): Promise<{
    subAgreements: SubAgreement[];
    clients: { [key: string]: Client }; // Map of client ID to client data
    totalPages: number;
    total: number;
    currentPage: number;
  }> {
    try {
      const response = await api.get<LaravelSubAgreementsResponse>(`/sub-agreements?page=${page}&per_page=${perPage}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch sub-agreements');
      }

      const subAgreements = response.data.data.data.map(transformSubAgreement);
      
      // Create a map of clients from the nested client data
      const clients: { [key: string]: Client } = {};
      response.data.data.data.forEach(agreement => {
        if (agreement.client) {
          clients[agreement.client.id.toString()] = transformClient(agreement.client);
        }
      });

      return {
        subAgreements,
        clients,
        totalPages: response.data.data.last_page,
        total: response.data.data.total,
        currentPage: response.data.data.current_page
      };
    } catch (error: any) {
      console.error('Error fetching sub-agreements:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch sub-agreements');
    }
  },

  // Get sub-agreements by client ID
  async getSubAgreementsByClient(clientId: string): Promise<SubAgreement[]> {
    try {
      const response = await api.get<LaravelSubAgreementsResponse>(`/sub-agreements/client/${clientId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch client sub-agreements');
      }

      return response.data.data.data.map(transformSubAgreement);
    } catch (error: any) {
      console.error('Error fetching client sub-agreements:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch client sub-agreements');
    }
  },

  // Create new sub-agreement
  async createSubAgreement(subAgreementData: Omit<SubAgreement, 'id'>): Promise<SubAgreement> {
    try {
      const laravelData = {
        client_id: parseInt(subAgreementData.clientId),
        name: subAgreementData.name,
        amount: subAgreementData.amount,
        balance: subAgreementData.balance,
        start_date: subAgreementData.startDate,
        end_date: subAgreementData.endDate
      };

      const response = await api.post<LaravelSubAgreementResponse>('/sub-agreements', laravelData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create sub-agreement');
      }

      return transformSubAgreement(response.data.data);
    } catch (error: any) {
      console.error('Error creating sub-agreement:', error);
      throw new Error(error.response?.data?.message || 'Failed to create sub-agreement');
    }
  },

  // Update sub-agreement
  async updateSubAgreement(id: string, subAgreementData: Partial<Omit<SubAgreement, 'id' | 'clientId'>>): Promise<SubAgreement> {
    try {
      const laravelData: any = {};
      
      if (subAgreementData.name !== undefined) laravelData.name = subAgreementData.name;
      if (subAgreementData.amount !== undefined) laravelData.amount = subAgreementData.amount;
      if (subAgreementData.balance !== undefined) laravelData.balance = subAgreementData.balance;
      if (subAgreementData.startDate !== undefined) laravelData.start_date = subAgreementData.startDate;
      if (subAgreementData.endDate !== undefined) laravelData.end_date = subAgreementData.endDate;

      const response = await api.put<LaravelSubAgreementResponse>(`/sub-agreements/${id}`, laravelData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update sub-agreement');
      }

      return transformSubAgreement(response.data.data);
    } catch (error: any) {
      console.error('Error updating sub-agreement:', error);
      throw new Error(error.response?.data?.message || 'Failed to update sub-agreement');
    }
  },

  // Delete sub-agreement
  async deleteSubAgreement(id: string): Promise<void> {
    try {
      const response = await api.delete(`/sub-agreements/${id}`);
      
      // Laravel may return different success indicators for DELETE
      if (response.status !== 200 && response.status !== 204) {
        throw new Error('Failed to delete sub-agreement');
      }
    } catch (error: any) {
      console.error('Error deleting sub-agreement:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete sub-agreement');
    }
  }
};

export default subAgreementService;
