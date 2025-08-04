import api from "../api";

export const SinhVienService = {
    getSinhVienProfile : async () => {
        try {
            const res = await api.get('/sinh-vien/profile');
            return res.data;
        } catch (error) {
            console.log('Lỗi lấy thông tin sinh viên',error);
            return null;
        }
    },

    updateSinhVienProfile : async (data) =>{
        try {
            const res = await api.put('/sinh-vien/update-profile',data);
            return res.data;
        } catch (error) {
            console.log('Lỗi khi cập nhật thông tin sinh viên',error);
            return null;
        }
    },

    getQRInfoSinhVien: async() =>{
        try {
            const res = await api.get('/sinh-vien/qr-sinhvien');
            console.log('Kết quả trả về:', res);
            return res.data;
        } catch (error) {
            console.log('Lỗi lấy mã QR');
            return null;
        }
    },
    
}