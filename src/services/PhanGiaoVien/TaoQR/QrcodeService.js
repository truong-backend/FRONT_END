import api from "../../api.js";

const API_BASE_URL = 'https://he-thong-diem-danh-stu.onrender.com/api';

// 1. Lấy danh sách học kỳ
export const fetchHocKyList = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/lichgd/hoc-ky`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách học kỳ:', error);
    throw error;
  }
};

// 2. Lấy danh sách môn học theo giảng viên
export const fetchMonHocByGiaoVien = async (maGv, hocKy, namHoc) => {
  try {
    const response = await api.get(`${API_BASE_URL}/monhoc/danh-sach-mon-hoc-theo-giao-vien`, {
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
    const response = await api.get(`${API_BASE_URL}/monhoc/danh-sach-nhom-mon-hoc`, {
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
    const response = await api.get(`${API_BASE_URL}/tkb/danh-sach-ngay-giang-day`, {
      params: { maGd }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ngày giảng dạy:', error);
    throw error;
  }
};

// 5. Lấy danh sách sinh viên cho điểm danh
export const fetchSinhVienDiemDanh = async (maTkb) => {
  try {
    const response = await api.get(`${API_BASE_URL}/sinh-vien/students/${maTkb}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error);
    throw error;
  }
};

// 6. Điểm danh thủ công
export const markAttendanceManual = async (diemDanhData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/diemdanh/diem-danh-thu-cong`, diemDanhData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi điểm danh thủ công:', error);
    throw error;
  }
};

// 7. Tạo QR Code mới
export const createQRCode = async (maTkb, soPhut) => {
  if (soPhut == null || isNaN(soPhut)) {
    throw new Error('Số phút hết hạn (soPhut) là bắt buộc');
  }

  try {
    const response = await api.post(`${API_BASE_URL}/qrcode/qr/TaoQRCode`, {
      maTkb,
      soPhut
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo QR Code:', error);
    throw error;
  }
};