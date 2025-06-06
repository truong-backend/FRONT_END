import api from '../api.js';

export const lopService = {
  // Lấy danh sách lớp có phân trang và sắp xếp
  getLops: async (params) => {
    const response = await api.get('/lop', { params });
    return response.data;
  },

  // Lấy thông tin một lớp
  getLop: async (maLop) => {
    const response = await api.get(`/lop/${maLop}`);
    return response.data;
  },

  // Thêm lớp mới
  createLop: async (lopData) => {
    const response = await api.post('/lop', lopData);
    return response.data;
  },

  // Cập nhật lớp
  updateLop: async (maLop, lopData) => {
    const response = await api.put(`/lop/${maLop}`, lopData);
    return response.data;
  },

  // Xóa lớp
  deleteLop: async (maLop) => {
    const response = await api.delete(`/lop/${maLop}`);
    return response.data;
  }
}; 