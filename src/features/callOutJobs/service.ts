import api from '@/features/auth/api';

export type BackendCallOutJob = {
    id: number;
    client_id: number;
    job_name: string;
    work_order_number: string;
    description?: string | null;
    priority?: string | null;
    start_date?: string;
    end_date?: string;
    status?: string;
};

export const callOutJobsService = {
    async list(params?: { page?: number }) {
        const res = await api.get<any>('/call-out-jobs', { params });
        const body = res.data;
        if (Array.isArray(body?.data?.data)) return body.data.data as BackendCallOutJob[];
        if (Array.isArray(body?.data)) return body.data as BackendCallOutJob[];
        return [] as BackendCallOutJob[];
    },
    async create(payload: { client_id: number; job_name: string; work_order_number: string; start_date?: string; end_date?: string; status?: string; priority?: string; description?: string; }) {
        const res = await api.post('/call-out-jobs', payload);
        return res.data;
    },
    async update(id: number, payload: { job_name?: string; work_order_number?: string; start_date?: string; end_date?: string; status?: string; priority?: string; description?: string; }) {
        const res = await api.put(`/call-out-jobs/${id}`, payload);
        return res.data;
    },
    async remove(id: number) {
        const res = await api.delete(`/call-out-jobs/${id}`);
        return res.data;
    }
};


