import api from "../api.js";

export const LichGdService = {
  // Lấy danh sách lịch giảng dạy có phân trang và lọc
  getAllLichGd: async (
    page = 0,
    size = 10,
    sortBy = 'id',
    sortDir = 'asc',
    maGv = null,
    maMh = null,
    hocKy = null
  ) => {
    try {
      let url = `/lichgd?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
      
      // Thêm các tham số lọc nếu có
      if (maGv) url += `&maGv=${maGv}`;
      if (maMh) url += `&maMh=${maMh}`;
      if (hocKy !== null) url += `&hocKy=${hocKy}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy danh sách lịch giảng dạy');
    }
  },

  // Lấy thông tin một lịch giảng dạy theo ID
  getLichGdById: async (id) => {
    try {
      const response = await api.get(`/lichgd/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy thông tin lịch giảng dạy');
    }
  },

  // Thêm lịch giảng dạy mới
  createLichGd: async (lichGdData) => {
    try {
      // Validate dữ liệu trước khi gửi
      if (lichGdData.ngayKt && lichGdData.ngayBd) {
        const ngayBd = new Date(lichGdData.ngayBd);
        const ngayKt = new Date(lichGdData.ngayKt);
        if (ngayKt < ngayBd) {
          throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
        }
      }

      if (lichGdData.stKt <= lichGdData.stBd) {
        throw new Error('Tiết kết thúc phải sau tiết bắt đầu');
      }

      const response = await api.post('/lichgd', lichGdData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi thêm lịch giảng dạy');
    }
  },

  // Cập nhật thông tin lịch giảng dạy
  updateLichGd: async (id, lichGdData) => {
    try {
      // Validate dữ liệu trước khi gửi
      if (lichGdData.ngayKt && lichGdData.ngayBd) {
        const ngayBd = new Date(lichGdData.ngayBd);
        const ngayKt = new Date(lichGdData.ngayKt);
        if (ngayKt < ngayBd) {
          throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
        }
      }

      if (lichGdData.stKt <= lichGdData.stBd) {
        throw new Error('Tiết kết thúc phải sau tiết bắt đầu');
      }

      const response = await api.put(`/lichgd/${id}`, lichGdData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi cập nhật lịch giảng dạy');
    }
  },

  // Xóa lịch giảng dạy
  deleteLichGd: async (id) => {
    try {
      const response = await api.delete(`/lichgd/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi xóa lịch giảng dạy');
    }
  },

  // Helper function để kiểm tra tính hợp lệ của trường sắp xếp
  isValidSortField: (field) => {
    const validFields = ['id', 'nmh', 'phongHoc', 'ngayBd', 'ngayKt', 'stBd', 'stKt', 'hocKy'];
    return validFields.includes(field);
  }
};