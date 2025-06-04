import api from './api';

export const adminService = {
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
  },

  // Lấy danh sách admin có phân trang và sắp xếp
  getAdmins: async (params) => {
    const response = await api.get('/admin', { params });
    return response.data;
  },

  // Lấy thông tin một admin
  getAdmin: async (id) => {
    const response = await api.get(`/admin/${id}`);
    return response.data;
  },

  // Thêm admin mới
  createAdmin: async (adminData) => {
    const response = await api.post('/admin', adminData);
    return response.data;
  },

  // Cập nhật admin
  updateAdmin: async (id, adminData) => {
    const response = await api.put(`/admin/${id}`, adminData);
    return response.data;
  },

  // Xóa admin
  deleteAdmin: async (id) => {
    const response = await api.delete(`/admin/${id}`);
    return response.data;
  }
}; 