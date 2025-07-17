// src/services/lichHocService.js
import api from "../api.js"; // giả sử api đã tạo axios instance với baseURL

export const lichHocService = {
  // Lấy danh sách sinh viên chưa học theo maGd
  getSinhVienChuaHoc: async (maGd) => {
    const response = await api.get(`/lichhoc/chua-hoc/${maGd}`);
    return response.data;
  },

  // Lấy danh sách sinh viên đã học theo maGd
  getSinhVienDaHoc: async (maGd) => {
    const response = await api.get(`/lichhoc/da-hoc/${maGd}`);
    return response.data;
  },

  // Thêm sinh viên vào lịch học
  themSinhVien: async ({ maSv, maGd }) => {
    const response = await api.post('/lichhoc/them', { maSv, maGd });
    return response.data;
  },

  // Xóa sinh viên khỏi lịch học
  xoaSinhVien: async (maSv, maGd) => {
    const response = await api.delete('/lichhoc/xoa', {
      params: { maSv, maGd }
    });
    return response.data;
  },
};
