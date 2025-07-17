import api from "../../api";

export const tkbService = {
  fetchTkbSinhVien: async ({ maSv, hocKy, startOfWeek, endOfWeek }) => {
    try {
      const response = await api.get(`/tkb/tkb-sinh-vien`, {
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
