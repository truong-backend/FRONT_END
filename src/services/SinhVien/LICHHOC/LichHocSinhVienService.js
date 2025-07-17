import api from "../../api.js";

const LichHocSinhVienService = {
  // Lấy lịch học theo thứ (1-7: Thứ 2 đến Chủ nhật)
  getLichHocTheoThu: async (thu) => {
    try {
      const response = await api.get(`/monhoc/danh-sach-mon-hoc-theo-thu/${thu}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy lịch học theo thứ:", error);
      throw error;
    }
  },

  // Lấy lịch học cho tất cả các thứ trong tuần
  getLichHocToanTuan: async () => {
    try {
      const promises = [];
      for (let thu = 1; thu <= 7; thu++) {
        promises.push(
          api.get(`/monhoc/danh-sach-mon-hoc/${thu}`).then(response => ({
            thu,
            danhSachMon: response.data || []
          }))
        );
      }
      
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error("Lỗi khi lấy lịch học toàn tuần:", error);
      throw error;
    }
  }
};

export default LichHocSinhVienService;