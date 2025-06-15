import api from "../../api.js";

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
    }
}