import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";
// const API_BASE_URL = "https://api.diemdanhstu.online/api";

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API endpoints
export const authService = {
  // Login endpoints
  loginStudent: (credentials) =>
    apiClient.post('/sinhvien/login', credentials).then(res => res.data),
  
  loginTeacher: (credentials) =>
    apiClient.post('/giangvien/login', credentials).then(res => res.data),
  
  loginAdmin: (credentials) =>
    apiClient.post('/admin/login', credentials).then(res => res.data),

  // Password reset endpoints
  requestOTP: (email, userType) => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/request-otp' : 'password-reset/user/request-otp';
    return apiClient.post(endpoint, { email }).then(res => res.data);
  },

  verifyOTPAndResetPassword: (data, userType) => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/verify-otp' : 'password-reset/user/verify-otp';
    return apiClient.post(endpoint, data).then(res => res.data);
  },

  verifyOTP: (email, otp, userType) => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/verify-otp' : 
      userType === 'TEACHER' ? 'password-reset/user/verify-otp' : 'password-reset/user/verify-otp';
    return apiClient.post(endpoint, { email, otp }).then(res => res.data);
  },

  resetPassword: (token, newPassword, userType) => {
    const endpoint = userType === 'ADMIN' ? 'password-reset/admin/reset-password' : 
      userType === 'TEACHER' ? 'password-reset/user/reset-password' : 'password-reset/user/reset-password';
    return apiClient.post(endpoint, { token, newPassword }).then(res => res.data);
  }
};

export const API_URL = API_BASE_URL;

export default apiClient; 