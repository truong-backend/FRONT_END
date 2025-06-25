import api from "../../api.js";


// 1. Lấy danh sách học kỳ
export const fetchHocKyList = async (maGv) => {
  try {
    const response = await api.get(`/lichgd/hoc-ky/${maGv}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách học kỳ:', error);
    throw error;
  }
};


// 2. Lấy danh sách môn học theo giảng viên
export const fetchMonHocByGiaoVien = async (maGv, hocKy, namHoc) => {
  try {
    const response = await api.get(`/monhoc/danh-sach-mon-hoc-theo-giao-vien`, {
      params: {
        maGv,
        hocKy,
        namHoc
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách môn học:', error);
    throw error;
  }
};

// 3. Lấy danh sách nhóm môn học
export const fetchNhomMonHoc = async (teacherId, subjectId, semester, year) => {
  try {
    const response = await api.get(`/monhoc/danh-sach-nhom-mon-hoc`, {
      params: {
        teacherId,
        subjectId,
        semester,
        year
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm môn học:', error);
    throw error;
  }
};

// 4. Lấy danh sách ngày giảng dạy
export const fetchNgayGiangDay = async (maGd) => {
  try {
    const response = await api.get(`/tkb/danh-sach-ngay-giang-day`, {
      params: { maGd }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ngày giảng dạy:', error);
    throw error;
  }
};
/// Điểm danh ngược

export const fetchDiemDanhNguoc = async (maTkb, mssv) => {
  try {
    const response = await api.get(`/sinh-vien/diemdanhnguoc/${maTkb, mssv}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error);
    throw error;
  }
};
///
// 5. Lấy danh sách sinh viên cho điểm danh
export const fetchSinhVienDiemDanh = async (maTkb) => {
  try {
    const response = await api.get(`/sinh-vien/students/${maTkb}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error);
    throw error;
  }
};

// 6. Điểm danh thủ công
export const markAttendanceManual = async (diemDanhData) => {
  try {
    const response = await api.post(`/diemdanh/diem-danh-thu-cong`, diemDanhData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi điểm danh thủ công:', error);
    throw error;
  }
};

export const xoaDiemDanhThuCong = async (maSv, maTkb, ngayHoc) => {
  try {
    const response = await api.delete(`/diemdanh/huy`, {
      params: {
        maSv,
        maTkb,
        ngayHoc, // dạng '2025-06-25'
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa điểm danh thủ công:', error);
    throw error;
  }
};

// 7. Tạo QR Code mới
export const createQRCode = async (maTkb, soPhut) => {
  if (soPhut == null || isNaN(soPhut)) {
    throw new Error('Số phút hết hạn (soPhut) là bắt buộc');
  }

  try {
    const response = await api.post(`/qrcode/qr/TaoQRCode`, {
      maTkb,
      soPhut
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo QR Code:', error);
    throw error;
  }
};