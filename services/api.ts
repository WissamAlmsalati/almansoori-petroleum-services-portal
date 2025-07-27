import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Laravel backend base URL - يمكن تغييرها حسب الحاجة
const BASE_URL = 'http://localhost:8000/api';

// إنشاء axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor لإضافة token إلى كل request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor لمعالجة الاستجابات والأخطاء
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // إذا كان الخطأ 401 (Unauthorized)، نقوم بإزالة token وإعادة توجيه للLogin
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
