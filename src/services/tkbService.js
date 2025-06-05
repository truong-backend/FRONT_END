import api from "./api";

export const tkbService = {
  // Lấy danh sách thời khóa biểu có phân trang và lọc
  getAllTkb: async (
    page = 0,
    size = 10,
    sortBy = 'ngayHoc',
    sortDir = 'asc',
    maGd = null,
    ngayHoc = null,
    startDate = null,
    endDate = null
  ) => {
    try {
      // Validate sort field
      const validSortFields = ['id', 'ngayHoc', 'phongHoc', 'stBd', 'stKt'];
      if (!validSortFields.includes(sortBy)) {
        throw new Error('Trường sắp xếp không hợp lệ');
      }

      // Validate dates
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      let url = `/tkb?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
      
      // Thêm các tham số lọc nếu có
      if (maGd) url += `&maGd=${maGd}`;
      if (ngayHoc) url += `&ngayHoc=${ngayHoc}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await api.get(url);
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
      // Validate dữ liệu trước khi gửi
      if (!tkbData.maGd) {
        throw new Error('Mã giảng dạy không được để trống');
      }

      if (!tkbData.ngayHoc) {
        throw new Error('Ngày học không được để trống');
      }

      if (!tkbData.phongHoc) {
        throw new Error('Phòng học không được để trống');
      }

      if (!tkbData.stBd || !tkbData.stKt) {
        throw new Error('Tiết bắt đầu và tiết kết thúc không được để trống');
      }

      if (tkbData.stKt <= tkbData.stBd) {
        throw new Error('Tiết kết thúc phải sau tiết bắt đầu');
      }

      const response = await api.post('/tkb', tkbData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi thêm thời khóa biểu');
    }
  },

  // Cập nhật thông tin thời khóa biểu
  updateTkb: async (id, tkbData) => {
    try {
      // Validate dữ liệu trước khi gửi
      if (!tkbData.maGd) {
        throw new Error('Mã giảng dạy không được để trống');
      }

      if (!tkbData.ngayHoc) {
        throw new Error('Ngày học không được để trống');
      }

      if (!tkbData.phongHoc) {
        throw new Error('Phòng học không được để trống');
      }

      if (!tkbData.stBd || !tkbData.stKt) {
        throw new Error('Tiết bắt đầu và tiết kết thúc không được để trống');
      }

      if (tkbData.stKt <= tkbData.stBd) {
        throw new Error('Tiết kết thúc phải sau tiết bắt đầu');
      }

      const response = await api.put(`/tkb/${id}`, tkbData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi cập nhật thời khóa biểu');
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

  // Helper function để kiểm tra tính hợp lệ của trường sắp xếp
  isValidSortField: (field) => {
    const validFields = ['id', 'ngayHoc', 'phongHoc', 'stBd', 'stKt'];
    return validFields.includes(field);
  }
};