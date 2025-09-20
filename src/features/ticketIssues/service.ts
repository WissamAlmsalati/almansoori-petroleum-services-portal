import api from '@/services/api';

// Create payload
export interface TicketIssueCreateRequest {
  ticket_id: number;
  description: string;
  status: string; // 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  remarks?: string;
  date_reported: string; // YYYY-MM-DD
}

// API models
interface ApiTicketIssue {
  id: number;
  ticket_id: number;
  description: string;
  status: string;
  remarks: string | null;
  date_reported: string; // ISO
  created_at: string;
  updated_at: string;
  ticket?: {
    id: number;
    ticket_number: string;
    client_id: number;
    sub_agreement_id: number | null;
    call_out_job_id: number | null;
    date: string;
    status: string;
    amount: string;
    related_log_ids: number[];
    documents: any[];
    created_at: string;
    updated_at: string;
  };
}

interface ApiPagination<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Frontend model
export interface FrontendTicketIssue {
  id: string;
  ticketId: string;
  description: string;
  status: string;
  remarks?: string;
  dateReported: string;
  createdAt?: string;
  updatedAt?: string;
  ticket?: {
    id: number;
    ticket_number: string;
    client_id: number;
    sub_agreement_id: number | null;
    call_out_job_id: number | null;
    date: string;
    status: string;
    amount: string;
    related_log_ids: number[];
    documents: any[];
    created_at: string;
    updated_at: string;
  };
}

const transformApiToFrontend = (issue: ApiTicketIssue): FrontendTicketIssue => ({
  id: String(issue.id),
  ticketId: String(issue.ticket_id),
  description: issue.description,
  status: issue.status,
  remarks: issue.remarks || undefined,
  dateReported: issue.date_reported,
  createdAt: issue.created_at,
  updatedAt: issue.updated_at,
  ticket: issue.ticket
    ? {
        id: issue.ticket.id,
        ticket_number: issue.ticket.ticket_number,
        client_id: issue.ticket.client_id,
        sub_agreement_id: issue.ticket.sub_agreement_id,
        call_out_job_id: issue.ticket.call_out_job_id,
        date: issue.ticket.date,
        status: issue.ticket.status,
        amount: issue.ticket.amount,
        related_log_ids: issue.ticket.related_log_ids || [],
        documents: issue.ticket.documents || [],
        created_at: issue.ticket.created_at,
        updated_at: issue.ticket.updated_at,
      }
    : undefined,
});

export const ticketIssuesService = {
  async list(page: number = 1): Promise<{ items: FrontendTicketIssue[]; pagination: ApiPagination<ApiTicketIssue> }> {
    const response = await api.get<ApiResponse<ApiPagination<ApiTicketIssue>>>(`/ticket-issues?page=${page}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch ticket issues');
    }
    const apiPage = response.data.data;
    return {
      items: (apiPage.data || []).map(transformApiToFrontend),
      pagination: apiPage,
    };
  },

  async create(payload: TicketIssueCreateRequest): Promise<FrontendTicketIssue> {
    const response = await api.post<ApiResponse<ApiTicketIssue>>('/ticket-issues', payload);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create ticket issue');
    }
    return transformApiToFrontend(response.data.data);
  },

  async getById(id: number): Promise<FrontendTicketIssue> {
    const response = await api.get<ApiResponse<ApiTicketIssue>>(`/ticket-issues/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch ticket issue');
    }
    return transformApiToFrontend(response.data.data);
  },
};

export default ticketIssuesService;


