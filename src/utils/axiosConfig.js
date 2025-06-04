import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // Thay đổi URL này theo URL của backend của bạn
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor cho request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Xử lý các mã lỗi cụ thể
            switch (error.response.status) {
                case 401:
                    // Token hết hạn hoặc không hợp lệ
                    localStorage.removeItem('token');
                    window.location.href = '/admin/login';
                    break;
                case 403:
                    console.error('Không có quyền truy cập');
                    break;
                default:
                    console.error('Lỗi từ server:', error.response.data);
            }
        } else if (error.request) {
            console.error('Không nhận được phản hồi từ server');
        } else {
            console.error('Lỗi khi thiết lập request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 