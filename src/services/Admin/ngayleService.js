import apiClient from '../api.js';

// Utility function để format ngày thành YYYY-MM-DD
const formatDateForAPI = (date) => {
  if (!date) return null;
  
  // Nếu đã là string và có format đúng YYYY-MM-DD
  if (typeof date === 'string') {
    // Kiểm tra nếu đã đúng format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Nếu là format DD/MM/YYYY hoặc DD-MM-YYYY, convert sang YYYY-MM-DD
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(date)) {
      const parts = date.split(/[\/\-]/);
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    // Thử parse nếu là string khác
    try {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Cannot parse date string:', date);
    }
  }
  
  // Nếu là dayjs object
  if (date && typeof date.format === 'function') {
    return date.format('YYYY-MM-DD');
  }
  
  // Nếu là Date object
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  // Nếu là moment object
  if (date && typeof date.toISOString === 'function') {
    return date.toISOString().split('T')[0];
  }
  
  console.warn('Unknown date format:', date);
  return date;
};

export const ngayleService = {
  // Lấy danh sách tất cả ngày lễ
  getAllNgayLe: () => {
    console.log('Getting all holidays...');
    return apiClient.get('/ngay-le')
      .then(res => {
        console.log('getAllNgayLe response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error getting all holidays:', error);
        throw error;
      });
  },

  // Lấy ngày lễ theo ngày cụ thể
  getNgayLeByNgay: (ngay) => {
    const formattedDate = formatDateForAPI(ngay);
    console.log('Getting holiday by date:', formattedDate);
    return apiClient.get(`/ngay-le/${formattedDate}`)
      .then(res => {
        console.log('getNgayLeByNgay response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error getting holiday by date:', error);
        throw error;
      });
  },

  // Kiểm tra ngày có phải ngày lễ không
  checkHoliday: (ngay) => {
    const formattedDate = formatDateForAPI(ngay);
    console.log('Checking if holiday:', formattedDate);
    return apiClient.get(`/ngay-le/check/${formattedDate}`)
      .then(res => {
        console.log('checkHoliday response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error checking holiday:', error);
        throw error;
      });
  },

  // Thêm ngày lễ mới
  createNgayLe: (data) => {
    // Đảm bảo format ngày đúng
    const formattedData = {
      ...data,
      ngay: formatDateForAPI(data.ngay)
    };
    
    console.log('Creating holiday with data:', formattedData);
    return apiClient.post('/ngay-le', formattedData)
      .then(res => {
        console.log('createNgayLe response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error creating holiday:', error);
        throw error;
      });
  },

  // Cập nhật ngày lễ
  updateNgayLe: (ngay, data) => {
    const formattedDate = formatDateForAPI(ngay);
    console.log('Updating holiday:', formattedDate, 'with data:', data);
    
    return apiClient.put(`/ngay-le/${formattedDate}`, data)
      .then(res => {
        console.log('updateNgayLe response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error updating holiday:', error);
        throw error;
      });
  },

  // Xóa ngày lễ
  deleteNgayLe: (ngay) => {
    if (!ngay) {
      throw new Error('Ngày không được để trống');
    }
    
    const formattedDate = formatDateForAPI(ngay);
    console.log('Deleting holiday:', formattedDate);
    
    return apiClient.delete(`/ngay-le/${formattedDate}`)
      .then(res => {
        console.log('deleteNgayLe response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error deleting holiday:', error);
        throw error;
      });
  },

  // Lấy danh sách ngày lễ theo năm
  getNgayLeByYear: (year) => {
    console.log('Getting holidays by year:', year);
    return apiClient.get(`/ngay-le/year/${year}`)
      .then(res => {
        console.log('getNgayLeByYear response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error getting holidays by year:', error);
        throw error;
      });
  },

  // Lấy danh sách ngày lễ theo tháng và năm
  getNgayLeByYearAndMonth: (year, month) => {
    console.log('Getting holidays by year and month:', year, month);
    return apiClient.get(`/ngay-le/year/${year}/month/${month}`)
      .then(res => {
        console.log('getNgayLeByYearAndMonth response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error getting holidays by year and month:', error);
        throw error;
      });
  },

  // Lấy danh sách ngày lễ trong khoảng thời gian
  getNgayLeBetween: (startDate, endDate) => {
    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);
    
    console.log('Getting holidays between:', formattedStartDate, 'and', formattedEndDate);
    return apiClient.get('/ngay-le/between', {
      params: { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate 
      }
    }).then(res => {
      console.log('getNgayLeBetween response:', res);
      return res.data;
    }).catch(error => {
      console.error('Error getting holidays between dates:', error);
      throw error;
    });
  },

  // Tìm ngày lễ tiếp theo
  getNextHoliday: () => {
    console.log('Getting next holiday...');
    return apiClient.get('/ngay-le/next')
      .then(res => {
        console.log('getNextHoliday response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error getting next holiday:', error);
        throw error;
      });
  },

  // Đếm số ngày lễ trong năm
  countHolidaysByYear: (year) => {
    console.log('Counting holidays by year:', year);
    return apiClient.get(`/ngay-le/count/year/${year}`)
      .then(res => {
        console.log('countHolidaysByYear response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error counting holidays by year:', error);
        throw error;
      });
  },

  // Tạo hoặc cập nhật ngày lễ
  saveOrUpdateNgayLe: (data) => {
    const formattedData = {
      ...data,
      ngay: formatDateForAPI(data.ngay)
    };
    
    console.log('Saving or updating holiday with data:', formattedData);
    return apiClient.post('/ngay-le/save-or-update', formattedData)
      .then(res => {
        console.log('saveOrUpdateNgayLe response:', res);
        return res.data;
      })
      .catch(error => {
        console.error('Error saving or updating holiday:', error);
        throw error;
      });
  },

  // Xóa nhiều ngày lễ trong khoảng thời gian
  deleteNgayLeBetween: (startDate, endDate) => {
    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);
    
    console.log('Deleting holidays between:', formattedStartDate, 'and', formattedEndDate);
    return apiClient.delete('/ngay-le/between', {
      params: { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate 
      }
    }).then(res => {
      console.log('deleteNgayLeBetween response:', res);
      return res.data;
    }).catch(error => {
      console.error('Error deleting holidays between dates:', error);
      throw error;
    });
  }
};