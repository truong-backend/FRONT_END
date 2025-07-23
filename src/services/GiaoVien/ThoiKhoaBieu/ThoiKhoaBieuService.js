import api from "../../api.js";

export const ThoiKhoaBieuService = {
  // Hàm lấy thời khóa biểu theo mã giảng dạy
  LayTkbTheoMaGd: async (maGd) => {
    try {
      const response = await api.get(`/tkb/ma-gd/${maGd}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tải thời khóa biểu', error);
      return [];
    }
  },

  // Hàm tạo thời khóa biểu mới - gửi dữ liệu dạng JSON trong body
  TaoTkb: async (maGd, danhSachThu, maMh) => {
    try {
      // Chuyển đổi thứ từ JavaScript (0-6) sang backend format nếu cần
      // Backend sử dụng DayOfWeek.getValue() (1=Monday, 7=Sunday)
      const convertedThu = danhSachThu.map(thu => {
        // Nếu frontend đang gửi 1=Chủ nhật, 2=Thứ hai, ... 7=Thứ bảy
        // Backend cần 1=Thứ hai, 2=Thứ ba, ... 7=Chủ nhật
        if (thu === 1) return 7; // Chủ nhật
        return thu - 1; // Chuyển đổi các thứ khác
      });

      const requestBody = {
        maGd: maGd,
        thu: convertedThu, // Gửi array của các thứ đã chuyển đổi
        maMh: maMh
      };

      console.log('Gửi request body:', requestBody);

      const response = await api.post('/tkb/create', requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thời khóa biểu:', error);
      
      // Xử lý lỗi từ backend
      const errorMessage = error.response?.data || error.message || 'Lỗi khi tạo thời khóa biểu';
      throw new Error(errorMessage);
    }
  },

  // Hàm xóa thời khóa biểu theo mã giảng dạy
  XoaTkbTheoMaGd: async (maGd) => {
    try {
      const response = await api.delete(`/tkb/delete-by-ma-gd/${maGd}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa thời khóa biểu:', error);
      
      // Xử lý lỗi từ backend
      const errorMessage = error.response?.data || error.message || 'Lỗi khi xóa thời khóa biểu';
      throw new Error(errorMessage);
    }
  }
};