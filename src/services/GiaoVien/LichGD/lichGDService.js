import api from "../../api.js";

export const lichGDService = {
  // Hàm lấy lịch giảng dạy theo mã giáo viên (tham số maGv)
  LayLichGiangDayGiangVien: async (maGv) => {
    try {
      const response = await api.get(`/lichgd/giang-vien/${maGv}`);
      return response.data; // trả về List<Object[]> hoặc List<LichGdDto> tùy backend
    } catch (error) {
      console.error('Lỗi lấy lịch giảng dạy giáo viên', error);
      return null;
    }
  },
};
