import api from './api';

export const khoaService = {
  // Lấy danh sách khoa có phân trang
  getKhoas: async () => {
    const response = await api.get('/khoa');
    return response.data?.content || [];
  },

  // Lấy thông tin một khoa
  getKhoa: async (maKhoa) => {
    const response = await api.get(`/khoa/${maKhoa}`);
    return response.data;
  },

  // Thêm khoa mới
  createKhoa: async (khoaData) => {
    const response = await api.post('/khoa', khoaData);
    return response.data;
  },

  // Cập nhật khoa
  updateKhoa: async (maKhoa, khoaData) => {
    const response = await api.put(`/khoa/${maKhoa}`, khoaData);
    return response.data;
  },

  // Xóa khoa
  deleteKhoa: async (maKhoa) => {
    const response = await api.delete(`/khoa/${maKhoa}`);
    return response.data;
  }
}; 