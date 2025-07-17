import api from '../api.js';

export const monHocService = {
  // Lấy danh sách môn học có phân trang
  // getMonHocs: async (page = 0, size = 10, sortBy = 'maMh', sortDir = 'asc', search = '') => {
  //   const params = {
  //     page,
  //     size,
  //     sort: `${sortBy},${sortDir}`,
  //     ...(search && { search })
  //   };
  //   const response = await api.get('/monhoc', { params });
  //   return response.data;
  // },

  // Lấy tất cả môn học không phân trang
  getAllMonHocs: async () => {
    const response = await api.get('/monhoc/all');
    return response.data;
  },

  // Lấy thông tin một môn học
  getMonHoc: async (maMh) => {
    const response = await api.get(`/monhoc/${maMh}`);
    return response.data;
  },

  // Thêm môn học mới
  createMonHoc: async (monHocData) => {
    const response = await api.post('/monhoc', monHocData);
    return response.data;
  },

  // Cập nhật môn học
  updateMonHoc: async (maMh, monHocData) => {
    const response = await api.put(`/monhoc/${maMh}`, monHocData);
    return response.data;
  },

  // Xóa môn học
  deleteMonHoc: async (maMh) => {
    const response = await api.delete(`/monhoc/${maMh}`);
    return response.data;
  }
}; 