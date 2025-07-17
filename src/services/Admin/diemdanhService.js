import api from '../api.js';

export const diemdanhService = {
  getDanhSachHocKy: async () => {
    try {
      const response = await api.get('/lichgd/hoc-ky');
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học kỳ:', error);
      return [];
    }
  },

  getDanhSachDiemDanhTheoHocKy: async (hocKy, namHoc) => {
    try {
      const response = await api.get('diemdanh/report-hoc-ky', {
        params: { hocKy, namHoc }
      });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi lấy điểm danh theo học kỳ:', error);
      return [];
    }
  },

  getDanhSachMonHoc: async (hocKy, namHoc) => {
    try {
      const response = await api.get('/monhoc/mon-hoc-theo-hoc-ky-nam', {
        params: { hocKy, namHoc }
      });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách môn học:', error);
      return [];
    }
  },

  getDanhSachDiemDanhTheoMonHoc: async (hocKy, namHoc, maMh) => {
    try {
      const response = await api.get('diemdanh/report-mon-hoc', {
        params: { hocKy, namHoc, maMh }
      });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi lấy điểm danh theo môn học:', error);
      return [];
    }
  },

  getDanhSachGiangVien: async (hocKy, namHoc, maMh) => {
    try {
      const response = await api.get('/giao-vien/danh-sach-giao-vien', {
        params: { hocKy, namHoc, maMh }
      });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giảng viên:', error);
      return [];
    }
  },

  getDanhSachDiemDanhTheoGiangVien: async (hocKy, namHoc, maMh, maGv) => {
    try {
      const response = await api.get('/diemdanh/report/full', {
        params: { hocKy, namHoc, maMh, maGv }
      });
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi khi lấy điểm danh theo giảng viên:', error);
      return [];
    }
  }
};
