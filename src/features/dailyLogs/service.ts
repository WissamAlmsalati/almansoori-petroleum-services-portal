import api from '@/features/auth/api';

export type BackendDailyLog = {
  id: number;
  client_id: number;
  field: string;
  well: string;
  contract: string;
  job_no: string;
  date: string;
  linked_job_id?: string | null;
  personnel?: Array<{ name: string; position: string; hours?: number }>;
  equipment_used?: Array<{ name: string; hours?: number }>;
  almansoori_rep?: Array<{ name: string; position: string }>;
  mog_approval_1?: { name: string; signature?: string; date?: string };
  mog_approval_2?: { name: string; signature?: string; date?: string };
};

export const dailyLogsService = {
  async list(params?: { page?: number }) {
    const res = await api.get<any>('/daily-logs', { params });
    const body = res.data;
    if (Array.isArray(body?.data?.data)) return body.data.data as BackendDailyLog[];
    if (Array.isArray(body?.data)) return body.data as BackendDailyLog[];
    return [] as BackendDailyLog[];
  },
  async create(payload: BackendDailyLog | any) {
    const res = await api.post('/daily-logs', payload);
    return res.data;
  }
};


