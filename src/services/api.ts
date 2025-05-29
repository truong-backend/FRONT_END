import axios from 'axios';
import type { LoginRequest, UserLoginResponse, AdminLoginResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  loginStudent: (credentials: LoginRequest): Promise<UserLoginResponse> =>
    api.post('/sinhvien/login', credentials).then(res => res.data),
  
  loginTeacher: (credentials: LoginRequest): Promise<UserLoginResponse> =>
    api.post('/giangvien/login', credentials).then(res => res.data),
  
  loginAdmin: (credentials: LoginRequest): Promise<AdminLoginResponse> =>
    api.post('/admin/login', credentials).then(res => res.data),
};

export default api;