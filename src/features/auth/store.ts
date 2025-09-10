import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

export type User = {
    id: number;
    name: string;
    email: string;
    roles?: string[];
};

type LoginResponse = {
    token: string;
    user: User;
};

type AuthState = {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    hydrate: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            loading: false,
            error: null,
            clearError: () => set({ error: null }),
            login: async (email: string, password: string) => {
                set({ loading: true, error: null });
                try {
                    const res = await api.post<any>('/auth/login', { email, password });
                    const data = res.data as any;
                    // Support multiple backend shapes
                    const tokenFromHeader = res.headers?.authorization?.toString()?.replace(/^Bearer\s+/i, '') || null;
                    const token = data?.token || data?.access_token || data?.data?.token || tokenFromHeader || null;
                    const user = (data?.user || data?.data?.user) as User | undefined;

                    if (token) {
                        localStorage.setItem('token', token);
                    }

                    if (user) {
                        set({ token: token || null, user });
                    } else {
                        // Token-based session: fetch user only if token exists
                        if (token) {
                            const me = await api.get<User>('/auth/me');
                            set({ token, user: me.data });
                        } else {
                            throw new Error('No token provided by backend');
                        }
                    }
                } catch (err: any) {
                    const status = err?.response?.status;
                    const data = err?.response?.data;
                    let message: string | null = null;
                    if (typeof data === 'object' && data) {
                        if (typeof data.message === 'string' && data.message.trim()) message = data.message;
                        else if (data.errors && typeof data.errors === 'object') {
                            const firstField = Object.keys(data.errors)[0];
                            const firstMsg = Array.isArray(data.errors[firstField]) ? data.errors[firstField][0] : String(data.errors[firstField]);
                            if (firstMsg) message = String(firstMsg);
                        }
                    }
                    if (!message) {
                        if (status === 422) message = 'Invalid credentials';
                        else if (status === 401) message = 'Unauthorized';
                        else if (status >= 500) message = 'Server error. Please try again later.';
                        else message = 'Login failed';
                    }
                    set({ error: message });
                    throw err;
                } finally {
                    set({ loading: false });
                }
            },
            hydrate: async () => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (!token) return;
                set({ loading: true });
                try {
                    const res = await api.get<User>('/auth/me');
                    set({ user: res.data, token });
                } catch (err) {
                    localStorage.removeItem('token');
                    set({ user: null, token: null });
                } finally {
                    set({ loading: false });
                }
            },
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (e) {
                    // ignore
                }
                localStorage.removeItem('token');
                set({ user: null, token: null });
            }
        }),
        {
            name: 'auth',
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);


