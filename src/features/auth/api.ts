import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if (status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
        }
        return Promise.reject(err);
    }
);

export default api;


