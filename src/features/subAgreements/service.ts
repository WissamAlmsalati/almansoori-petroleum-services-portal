import api from '@/features/auth/api';

export type BackendSubAgreement = {
    id: number;
    client_id: number;
    name: string;
    amount: string | number;
    balance: string | number;
    start_date?: string;
    end_date?: string;
    file_path?: string | null;
    file_name?: string | null;
    client?: { id: number; name: string };
};

export const subAgreementsService = {
    async list(params?: { page?: number }) {
        const res = await api.get<any>('/sub-agreements', { params });
        const body = res.data;
        if (Array.isArray(body?.data?.data)) return body.data.data as BackendSubAgreement[];
        if (Array.isArray(body?.data)) return body.data as BackendSubAgreement[];
        return [] as BackendSubAgreement[];
    },
    async getByClient(clientId: number, params?: { page?: number }) {
        const res = await api.get<any>(`/clients/${clientId}/sub-agreements`, { params });
        const body = res.data;
        if (Array.isArray(body?.data?.sub_agreements)) return body.data.sub_agreements as BackendSubAgreement[];
        return [] as BackendSubAgreement[];
    },
    async create(payload: { client_id: number; name: string; amount: number; balance: number; start_date?: string; end_date?: string; }) {
        const res = await api.post('/sub-agreements', payload);
        return res.data;
    },
    async update(id: number, payload: { name?: string; amount?: number; balance?: number; start_date?: string; end_date?: string; }) {
        const res = await api.put(`/sub-agreements/${id}`, payload);
        return res.data;
    },
    async remove(id: number) {
        const res = await api.delete(`/sub-agreements/${id}`);
        return res.data;
    }
};


