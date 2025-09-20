import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Laravel backend base URL (configurable via Vite env)
const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL;
const BASE_URL = (typeof envBase === 'string' && envBase.length > 0)
  ? envBase
  : 'http://127.0.0.1:8000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token to every request (except login)
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isLoginRequest = url.includes('/auth/login');

    if (!isLoginRequest) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // If error is 401 (Unauthorized), clear token but do NOT hard-refresh.
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;


