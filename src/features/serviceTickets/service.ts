import api from '@/services/api';

interface ServiceTicketCreateRequest {
  client_id: number;
  sub_agreement_id: number | null;
  call_out_job_id: number | null;
  date: string;
  status: string;
  amount: number;
  related_log_ids: number[];
  documents: any[];
}
type ServiceTicketUpdateRequest = ServiceTicketCreateRequest;

interface ApiServiceTicket {
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
  client?: { id: number; name: string; logo_url?: string | null; logo_file_path?: string | null };
  sub_agreement?: { id: number; name: string; amount: string; balance: string };
  call_out_job?: { id: number; job_name: string; work_order_number: string } | null;
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

export interface FrontendServiceTicket {
  id: string;
  ticketNumber: string;
  clientId: string;
  subAgreementId?: string;
  callOutJobId?: string;
  date: string;
  status: string;
  amount: number;
  relatedLogIds: string[];
  documents: any[];
  createdAt?: string;
  updatedAt?: string;
  client?: { id: number; name: string; logo_url?: string; logo_file_path?: string; contacts?: any[] };
  subAgreement?: { id: number; name: string; amount: number; balance: number };
  callOutJob?: { id: number; job_name: string; work_order_number: string };
}

const transformApiToFrontend = (apiTicket: ApiServiceTicket): FrontendServiceTicket => ({
  id: String(apiTicket.id),
  ticketNumber: apiTicket.ticket_number,
  clientId: String(apiTicket.client_id),
  subAgreementId: apiTicket.sub_agreement_id ? String(apiTicket.sub_agreement_id) : undefined,
  callOutJobId: apiTicket.call_out_job_id ? String(apiTicket.call_out_job_id) : undefined,
  date: apiTicket.date,
  status: apiTicket.status,
  amount: parseFloat(apiTicket.amount),
  relatedLogIds: (apiTicket.related_log_ids || []).map(String),
  documents: [],
  createdAt: apiTicket.created_at,
  updatedAt: apiTicket.updated_at,
  client: apiTicket.client
    ? {
        id: apiTicket.client.id,
        name: apiTicket.client.name,
        logo_url: apiTicket.client.logo_url || undefined,
        logo_file_path: apiTicket.client.logo_file_path || undefined,
        contacts: [],
      }
    : undefined,
  subAgreement: apiTicket.sub_agreement
    ? {
        id: apiTicket.sub_agreement.id,
        name: apiTicket.sub_agreement.name,
        amount: parseFloat(apiTicket.sub_agreement.amount),
        balance: parseFloat(apiTicket.sub_agreement.balance),
      }
    : undefined,
  callOutJob: apiTicket.call_out_job
    ? {
        id: apiTicket.call_out_job.id,
        job_name: apiTicket.call_out_job.job_name,
        work_order_number: apiTicket.call_out_job.work_order_number,
      }
    : undefined,
});

export const serviceTicketService = {
  async create(ticket: ServiceTicketCreateRequest): Promise<FrontendServiceTicket> {
    const response = await api.post<ApiResponse<ApiServiceTicket>>('/service-tickets', ticket);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create service ticket');
    }
    return transformApiToFrontend(response.data.data);
  },

  async list(page: number = 1): Promise<{ items: FrontendServiceTicket[]; pagination: ApiPagination<ApiServiceTicket> }> {
    const response = await api.get<ApiResponse<ApiPagination<ApiServiceTicket>>>(`/service-tickets?page=${page}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch service tickets');
    }
    const apiPage = response.data.data;
    return {
      items: (apiPage.data || []).map(transformApiToFrontend),
      pagination: apiPage,
    };
  },

  async update(id: number, ticket: ServiceTicketUpdateRequest): Promise<FrontendServiceTicket> {
    const response = await api.put<ApiResponse<ApiServiceTicket>>(`/service-tickets/${id}`, ticket);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update service ticket');
    }
    return transformApiToFrontend(response.data.data);
  },
};

export type { ServiceTicketCreateRequest, ServiceTicketUpdateRequest };

export default serviceTicketService;


