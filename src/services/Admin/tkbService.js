import api from "../api.js";

export const tkbService = {
  // Lấy tất cả thời khóa biểu
  getAllTkb: async () => {
    try {
      const response = await api.get('/tkb/all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy danh sách thời khóa biểu');
    }
  },

  // Lấy thông tin một thời khóa biểu theo ID
  getTkbById: async (id) => {
    try {
      const response = await api.get(`/tkb/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy thông tin thời khóa biểu');
    }
  },

  // Thêm thời khóa biểu mới
  createTkb: async (tkbData) => {
    try {
      if (!tkbData.maGd) throw new Error('Mã giảng dạy không được để trống');
      if (!tkbData.ngayHoc) throw new Error('Ngày học không được để trống');
      if (!tkbData.phongHoc) throw new Error('Phòng học không được để trống');
      if (!tkbData.stBd || !tkbData.stKt) throw new Error('Tiết bắt đầu và tiết kết thúc không được để trống');
      if (tkbData.stKt <= tkbData.stBd) throw new Error('Tiết kết thúc phải sau tiết bắt đầu');

      const response = await api.post('/tkb', {
        maGd: tkbData.maGd,
        ngayHoc: tkbData.ngayHoc,
        phongHoc: tkbData.phongHoc,
        stBd: parseInt(tkbData.stBd),
        stKt: parseInt(tkbData.stKt),
        ghiChu: tkbData.ghiChu || null
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  },

  // Cập nhật thông tin thời khóa biểu
  updateTkb: async (id, tkbData) => {
    try {
      if (!tkbData.maGd) throw new Error('Mã giảng dạy không được để trống');
      if (!tkbData.ngayHoc) throw new Error('Ngày học không được để trống');
      if (!tkbData.phongHoc) throw new Error('Phòng học không được để trống');
      if (!tkbData.stBd || !tkbData.stKt) throw new Error('Tiết bắt đầu và tiết kết thúc không được để trống');
      if (tkbData.stKt <= tkbData.stBd) throw new Error('Tiết kết thúc phải sau tiết bắt đầu');

      const response = await api.put(`/tkb/${id}`, {
        maGd: tkbData.maGd,
        ngayHoc: tkbData.ngayHoc,
        phongHoc: tkbData.phongHoc,
        stBd: parseInt(tkbData.stBd),
        stKt: parseInt(tkbData.stKt),
        ghiChu: tkbData.ghiChu || null
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  },

  // Xóa thời khóa biểu
  deleteTkb: async (id) => {
    try {
      const response = await api.delete(`/tkb/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi xóa thời khóa biểu');
    }
  },

  // Các hàm khác giữ nguyên...

  // ✅ Thêm cuối cùng đúng cú pháp
  fetchTkbSinhVien: async ({ maSv, hocKy, startOfWeek, endOfWeek }) => {
    try {
      const response = await api.get(`/tkb/tkb-giao-vien`, {
        params: {
          maSv,
          hocKy,
          startOfWeek,
          endOfWeek,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data || "Lỗi khi lấy thời khóa biểu giáo viên"
      );
    }
  }
};
