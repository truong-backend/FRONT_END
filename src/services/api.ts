import axios from 'axios';
import type { 
  LoginRequest, 
  UserLoginResponse, 
  AdminLoginResponse,
  ResetPasswordResponse,
  OTPVerificationResponse,
  UserRole,
  PasswordResetVerificationRequest
} from '../types/auth';

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
      window.location.href = '/student/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Login endpoints
  loginStudent: (credentials: LoginRequest): Promise<UserLoginResponse> =>
    api.post('/sinhvien/login', credentials).then(res => res.data),
  
  loginTeacher: (credentials: LoginRequest): Promise<UserLoginResponse> =>
    api.post('/giangvien/login', credentials).then(res => res.data),
  
  loginAdmin: (credentials: LoginRequest): Promise<AdminLoginResponse> =>
    api.post('/admin/login', credentials).then(res => res.data),

  // Password reset endpoints
  requestOTP: (email: string, userType: UserRole): Promise<ResetPasswordResponse> => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/request-otp' : 'password-reset/user/request-otp';
    return api.post(endpoint, { email }).then(res => res.data);
  },

  verifyOTPAndResetPassword: (data: PasswordResetVerificationRequest, userType: UserRole): Promise<ResetPasswordResponse> => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/verify-otp' : 'password-reset/user/verify-otp';
    return api.post(endpoint, data).then(res => res.data);
  },

  verifyOTP: (email: string, otp: string, userType: UserRole): Promise<OTPVerificationResponse> => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/verify-otp' : 
      userType === 'TEACHER' ? 'password-reset/user/verify-otp' : 'password-reset/user/verify-otp';
    return api.post(endpoint, { email, otp }).then(res => res.data);
  },

  resetPassword: (token: string, newPassword: string, userType: UserRole): Promise<ResetPasswordResponse> => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/reset-password' : 
      userType === 'TEACHER' ? 'password-reset/user/reset-password' : 'password-reset/user/reset-password';
    return api.post(endpoint, { token, newPassword }).then(res => res.data);
  }
};

export const API_URL = "http://localhost:8080/api/";

export default api;