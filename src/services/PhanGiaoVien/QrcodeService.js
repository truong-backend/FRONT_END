import api from "../api";

const API_BASE_URL = '/api/qrcode';

export const QrcodeService = {
  /**
   * Gửi yêu cầu tạo QR Code cho buổi học
   * @param {Object} data - QrcodeDto: { maTkb, thoiGianHieuLuc }
   * @returns {Promise} response: QrcodeDto + ảnh QR dạng base64
   */
  generateQRCode: async (data) => {
    try {
      const response = await api.post(`${API_BASE_URL}/generate`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Gửi yêu cầu xác thực QR code (điểm danh)
   * @param {string} qrData - chuỗi mã QR đã giải mã
   * @param {string} maSv - mã sinh viên
   * @returns {Promise} response: DiemDanhDto nếu thành công
   */
  verifyQRCode: async (qrData, maSv) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/verify`,
        null,
        {
          params: {
            qrData,
            maSv,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
