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
  }, // ✅ thêm dấu phẩy tại đây

  // Hàm tạo thời khóa biểu
  TaoThoiKhoaBieu: async (maGd, thu) => {
    try {
      const response = await api.post(
        `/tkb/create`,
        new URLSearchParams({
          maGd: maGd.toString(),
          thu: thu.toString(),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thời khóa biểu', error);
      throw error;
    }
  },
};
