import api from "../../api.js";

const API_BASE_URL = 'http://localhost:8080/api';

export const ScanQRService = {
  /**
   * Điểm danh bằng QR Code
   * @param {Object} data - { qrId: Long, maSv: String }
   * @returns {Promise} API response
   */
  markAttendanceByQR: async (data) => {
    try {
      const response = await api.post('/qrcode/qr', {
        qrId: data.qrId,
        maSv: data.maSv
      });
      return response.data;
    } catch (error) {
      // Xử lý lỗi từ backend
      if (error.response && error.response.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Không thể kết nối đến máy chủ');
    }
  },

  /**
   * Kiểm tra QR Code có hợp lệ không (optional - để hiển thị thông tin)
   * @param {Long} qrId - ID của QR Code
   * @returns {Promise} QR Code validity info
   */
  checkQRCodeValidity: async (qrId) => {
    try {
      const response = await api.get(`/qrcode/check/${qrId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Không thể kiểm tra QR Code');
    }
  },

  /**
   * Phân tích dữ liệu từ QR Code để lấy qrId
   * @param {String} qrData - Dữ liệu quét được từ QR
   * @returns {Object} { qrId: Long }
   */
  parseQRData: (qrData) => {
    try {
      // Giả định QR code chứa JSON hoặc URL với qrId
      // Ví dụ: "{"qrId": 123}" hoặc "http://localhost:8080/qr/123"
      
      // Trường hợp 1: JSON format
      if (qrData.startsWith('{')) {
        const parsed = JSON.parse(qrData);
        return { qrId: parsed.qrId };
      }
      
      // Trường hợp 2: URL format
      if (qrData.includes('/qr/')) {
        const qrId = qrData.split('/qr/')[1];
        return { qrId: parseInt(qrId) };
      }
      
      // Trường hợp 3: Chỉ là số ID
      if (!isNaN(qrData)) {
        return { qrId: parseInt(qrData) };
      }
      
      throw new Error('Định dạng QR Code không hợp lệ');
    } catch (error) {
      throw new Error('Không thể đọc dữ liệu QR Code: ' + error.message);
    }
  }
};