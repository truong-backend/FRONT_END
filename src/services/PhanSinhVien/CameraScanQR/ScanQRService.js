import api from "../../api.js";

const API_BASE_URL = 'http://localhost:8080/api/qrcode';

export const ScanQRService = {
  // Điểm danh bằng QR Code
  markAttendanceByQR: async (qrData) => {
    try {
      const response = await api.post('/qrcode/qr', qrData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Lỗi khi điểm danh bằng QR Code');
    }
  },

  // Kiểm tra thông tin QR Code (nếu cần)
  validateQRCode: async (qrCode) => {
    try {
      const response = await api.get(`/qr/validate/${qrCode}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'QR Code không hợp lệ');
    }
  }
};