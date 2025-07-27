import api from './api';
import { Client, ContactPerson } from '../types';

// API Response types
interface ApiClient {
  id: number;
  name: string;
  logo_url: string | null;
  logo_file_path: string | null;
  created_at: string;
  updated_at: string;
  contacts: ApiContact[];
}

interface ApiContact {
  id: number;
  client_id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateClientRequest {
  name: string;
  contacts: {
    name: string;
    email: string;
    phone: string;
    position: string;
  }[];
}

interface UpdateClientRequest {
  name: string;
  contacts: {
    name: string;
    email: string;
    phone: string;
    position: string;
  }[];
}

// Transform API client to frontend client
const transformApiClientToClient = (apiClient: ApiClient): Client => {
  return {
    id: apiClient.id.toString(),
    name: apiClient.name,
    logoUrl: apiClient.logo_url || `https://picsum.photos/seed/cli${apiClient.id}/40/40`,
    logoFile: null,
    contacts: apiClient.contacts.map(contact => ({
      id: contact.id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      position: contact.position
    }))
  };
};

export const clientService = {
  // Get all clients with pagination
  async getClients(page: number = 1, perPage: number = 10): Promise<{ clients: Client[], totalPages: number, total: number }> {
    try {
      const response = await api.get<ApiResponse<ApiClient[]>>(`/clients?page=${page}&per_page=${perPage}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch clients');
      }

      const clients = response.data.data.map(transformApiClientToClient);
      
      return {
        clients,
        totalPages: response.data.pagination?.totalPages || 1,
        total: response.data.pagination?.total || 0
      };
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  },

  // Create new client
  async createClient(clientData: { name: string; contacts: Omit<ContactPerson, 'id'>[] }): Promise<Client> {
    try {
      const requestData: CreateClientRequest = {
        name: clientData.name,
        contacts: clientData.contacts.map(contact => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position
        }))
      };

      const response = await api.post<ApiResponse<ApiClient>>('/clients', requestData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create client');
      }

      return transformApiClientToClient(response.data.data);
    } catch (error: any) {
      console.error('Error creating client:', error);
      throw new Error(error.response?.data?.message || 'Failed to create client');
    }
  },

  // Update existing client
  async updateClient(clientId: string, clientData: { name: string; contacts: Omit<ContactPerson, 'id'>[] }): Promise<Client> {
    try {
      const requestData: UpdateClientRequest = {
        name: clientData.name,
        contacts: clientData.contacts.map(contact => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          position: contact.position
        }))
      };

      const response = await api.put<ApiResponse<ApiClient>>(`/clients/${clientId}`, requestData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update client');
      }

      return transformApiClientToClient(response.data.data);
    } catch (error: any) {
      console.error('Error updating client:', error);
      throw new Error(error.response?.data?.message || 'Failed to update client');
    }
  },

  // Delete client
  async deleteClient(clientId: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/clients/${clientId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete client');
      }
    } catch (error: any) {
      console.error('Error deleting client:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete client');
    }
  }
};

export default clientService;
