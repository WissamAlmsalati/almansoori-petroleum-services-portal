import api from './api';

// Types for Ticket Issues
export interface TicketIssue {
  id: number;
  ticket_id: number;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  remarks?: string;
  date_reported: string;
  created_at?: string;
  updated_at?: string;
  ticket?: any; // Related service ticket
}

export interface CreateTicketIssueData {
  ticket_id: number;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  remarks?: string;
  date_reported: string;
}

export interface UpdateTicketIssueData {
  ticket_id?: number;
  description?: string;
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  remarks?: string;
  date_reported?: string;
}

export interface TicketIssueResponse {
  success: boolean;
  data: TicketIssue | TicketIssue[];
  message: string;
}

class TicketIssueService {
  private baseUrl = '/ticket-issues';

  async getTicketIssues(): Promise<TicketIssue[]> {
    try {
      const response = await api.get(this.baseUrl);
      console.log('Ticket issues API response:', response);
      
      // Handle different response structures
      let data;
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        // Direct array response
        data = response.data.data;
      } else if (response.data.success && response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        // Paginated response
        data = response.data.data.data;
      } else if (Array.isArray(response.data)) {
        // Direct array without success wrapper
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Paginated response without success wrapper
        data = response.data.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        data = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching ticket issues:', error);
      throw error;
    }
  }

  async getTicketIssue(id: string): Promise<TicketIssue> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error fetching ticket issue:', error);
      throw error;
    }
  }

  async createTicketIssue(data: CreateTicketIssueData): Promise<TicketIssue> {
    try {
      console.log('Creating ticket issue with data:', data);
      const response = await api.post(this.baseUrl, data);
      console.log('Ticket issue creation response:', response);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error creating ticket issue:', error);
      throw error;
    }
  }

  async updateTicketIssue(id: string, data: UpdateTicketIssueData): Promise<TicketIssue> {
    try {
      console.log('Updating ticket issue with data:', data);
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      console.log('Ticket issue update response:', response);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Error updating ticket issue:', error);
      throw error;
    }
  }

  async deleteTicketIssue(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting ticket issue:', error);
      throw error;
    }
  }

  async getTicketIssuesByTicket(ticketId: string): Promise<TicketIssue[]> {
    try {
      const response = await api.get(`${this.baseUrl}/ticket/${ticketId}`);
      console.log('Ticket issues by ticket API response:', response);
      
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
      console.error('Error fetching ticket issues by ticket:', error);
      throw error;
    }
  }
}

export default new TicketIssueService(); 