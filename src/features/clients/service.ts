import api from '@/features/auth/api';

export type BackendClient = {
    id: number;
    name: string;
    address?: string;
    contact_email?: string;
    contact_phone?: string;
    created_at?: string;
    updated_at?: string;
};

export const clientService = {
    async list(params?: { page?: number; perPage?: number; search?: string }) {
        const res = await api.get<any>('/clients', { params });
        const body = res.data;
        if (Array.isArray(body)) return body as BackendClient[];
        if (Array.isArray(body?.data)) return body.data as BackendClient[];
        if (Array.isArray(body?.data?.data)) return body.data.data as BackendClient[];
        return [] as BackendClient[];
    },
    async create(payload: { name: string; contacts: Array<{ name: string; email: string; phone: string; position: string }>; }) {
        const res = await api.post<BackendClient>('/clients', payload);
        return res.data;
    },
    async update(id: number, payload: { name?: string; contacts?: Array<{ name: string; email: string; phone: string; position: string }>; }) {
        const res = await api.put<BackendClient>(`/clients/${id}`, payload);
        return res.data;
    },
    async remove(id: number) {
        const res = await api.delete(`/clients/${id}`);
        return res.data;
    }
};


