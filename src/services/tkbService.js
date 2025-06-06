import api from "./api";

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
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw error;
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
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw error;
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

  // Lấy thời khóa biểu theo năm học
  getTkbByAcademicYear: async (academicYear) => {
    try {
      // Parse năm học (ví dụ: "2024-2025")
      const [startYear, endYear] = academicYear.split('-').map(year => parseInt(year));
      
      // Tạo ngày bắt đầu (01/09 của năm bắt đầu)
      const startDate = `${startYear}-09-01`;
      
      // Tạo ngày kết thúc (31/08 của năm kết thúc)
      const endDate = `${endYear}-08-31`;

      // Gọi API với khoảng thời gian của năm học
      const response = await api.get(`/tkb`, {
        params: {
          startDate,
          endDate,
          size: 1000, // Lấy tất cả bản ghi trong năm học
          sortBy: 'ngayHoc',
          sortDir: 'asc'
        }
      });

      // Nhóm dữ liệu theo mã giảng dạy
      const groupedByMaGd = response.data.content.reduce((acc, tkb) => {
        if (!acc[tkb.maGd]) {
          acc[tkb.maGd] = [];
        }
        acc[tkb.maGd].push(tkb);
        return acc;
      }, {});

      return {
        academicYear,
        data: groupedByMaGd,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy thời khóa biểu theo năm học');
    }
  },

  // Lấy thời khóa biểu theo năm học và học kỳ
  getTkbByAcademicYearAndSemester: async ({
    academicYear,
    semester,
    page = 0,
    size = 10,
    sortBy = 'ngayHoc',
    sortDir = 'asc'
  }) => {
    try {
      // Parse năm học (ví dụ: "2024-2025")
      const [startYear, endYear] = academicYear.split('-').map(year => parseInt(year));
      
      // Xác định ngày bắt đầu và kết thúc của học kỳ
      let startDate, endDate;
      
      switch(semester) {
        case 1: // Học kỳ 1: Tháng 9 - Tháng 12
          startDate = `${startYear}-09-01`;
          endDate = `${startYear}-12-31`;
          break;
        case 2: // Học kỳ 2: Tháng 1 - Tháng 5
          startDate = `${endYear}-01-01`;
          endDate = `${endYear}-05-31`;
          break;
        case 3: // Học kỳ 3: Tháng 6 - Tháng 8
          startDate = `${endYear}-06-01`;
          endDate = `${endYear}-08-31`;
          break;
        default:
          // Nếu không chọn học kỳ, lấy cả năm học
          startDate = `${startYear}-09-01`;
          endDate = `${endYear}-08-31`;
      }

      const response = await api.get(`/tkb`, {
        params: {
          page,
          size,
          sortBy,
          sortDir,
          startDate,
          endDate
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy thời khóa biểu theo năm học và học kỳ');
    }
  },

  // Lấy thời khóa biểu theo tuần
  getTkbByWeek: async ({
    startDate,
    endDate,
    page = 0,
    size = 100,
    sortBy = 'ngayHoc',
    sortDir = 'asc'
  }) => {
    try {
      const response = await api.get(`/tkb`, {
        params: {
          page,
          size,
          sortBy,
          sortDir,
          startDate,
          endDate
        }
      });

      // Nhóm dữ liệu theo ngày học
      const groupedByDate = response.data.content.reduce((acc, tkb) => {
        const date = tkb.ngayHoc;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(tkb);
        return acc;
      }, {});

      return {
        weekData: groupedByDate,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy thời khóa biểu theo tuần');
    }
  },

  // Helper function để tính toán tuần trong học kỳ
  getWeeksInSemester: (academicYear, semester) => {
    const [startYear, endYear] = academicYear.split('-').map(year => parseInt(year));
    let weeks = [];
    
    let semesterStart, semesterEnd;
    switch(semester) {
      case 1:
        semesterStart = new Date(startYear, 8, 1); // Tháng 9
        semesterEnd = new Date(startYear, 11, 31); // Tháng 12
        break;
      case 2:
        semesterStart = new Date(endYear, 0, 1); // Tháng 1
        semesterEnd = new Date(endYear, 4, 31); // Tháng 5
        break;
      case 3:
        semesterStart = new Date(endYear, 5, 1); // Tháng 6
        semesterEnd = new Date(endYear, 7, 31); // Tháng 8
        break;
      default:
        return weeks;
    }

    let currentDate = new Date(semesterStart);
    let weekNum = 1;

    while (currentDate <= semesterEnd) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        weekNum,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        label: `Tuần ${weekNum} (${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1})`
      });

      currentDate.setDate(currentDate.getDate() + 7);
      weekNum++;
    }

    return weeks;
  },

  // Lấy tất cả thời khóa biểu theo năm học và học kỳ không phân trang
  getAllTkbByAcademicYearAndSemesterNoPage: async ({
    academicYear,
    semester,
    sortBy = 'ngayHoc',
    sortDir = 'asc'
  }) => {
    try {
      // Parse năm học (ví dụ: "2024-2025")
      const [startYear, endYear] = academicYear.split('-').map(year => parseInt(year));
      
      // Xác định ngày bắt đầu và kết thúc của học kỳ
      let startDate, endDate;
      
      switch(semester) {
        case 1: // Học kỳ 1: Tháng 9 - Tháng 12
          startDate = `${startYear}-09-01`;
          endDate = `${startYear}-12-31`;
          break;
        case 2: // Học kỳ 2: Tháng 1 - Tháng 5
          startDate = `${endYear}-01-01`;
          endDate = `${endYear}-05-31`;
          break;
        case 3: // Học kỳ 3: Tháng 6 - Tháng 8
          startDate = `${endYear}-06-01`;
          endDate = `${endYear}-08-31`;
          break;
        default:
          // Nếu không chọn học kỳ, lấy cả năm học
          startDate = `${startYear}-09-01`;
          endDate = `${endYear}-08-31`;
      }

      const response = await api.get(`/tkb`, {
        params: {
          size: 1000, // Lấy tối đa 1000 bản ghi
          sortBy,
          sortDir,
          startDate,
          endDate
        }
      });

      return response.data.content; // Trả về trực tiếp mảng dữ liệu
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy thời khóa biểu theo năm học và học kỳ');
    }
  },

  // Lấy tất cả thời khóa biểu theo tuần không phân trang
  getAllTkbByWeekNoPage: async ({
    startDate,
    endDate,
    sortBy = 'ngayHoc',
    sortDir = 'asc'
  }) => {
    try {
      const response = await api.get(`/tkb`, {
        params: {
          size: 1000, // Lấy tối đa 1000 bản ghi
          sortBy,
          sortDir,
          startDate,
          endDate
        }
      });

      // Nhóm dữ liệu theo ngày học
      const groupedByDate = response.data.content.reduce((acc, tkb) => {
        const date = tkb.ngayHoc;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(tkb);
        return acc;
      }, {});

      return groupedByDate; // Trả về dữ liệu đã được nhóm theo ngày
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi lấy thời khóa biểu theo tuần');
    }
  }
};