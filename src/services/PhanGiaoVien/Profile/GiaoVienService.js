import api from "../../api.js";

export const GiaoVienService = {
    getGiaoVienProfile : async () =>{
        try {
            const response = await api.get('/giao-vien/profile');
            return response.data;
        } catch (error) {
            console.error('Lỗi lấy thông tin giáo viên',error)
            return null;
        }
    },

    updateGiaoVienProfile :async (data) => {
        try {
            const respone = await api.put('/giao-vien/update-profile',data);
            return respone.data;
        } catch (error) {
            console.log('Lỗi update thông tin giáo viên')
            return null;
        }
    },

     diemdanhQRSinhVien : async(studentInfo) =>{
        try {
            const res = await api.post('/giao-vien/diemdanhnguoc',studentInfo);
            console.log('res data',res.data);
            return res.data;
        } catch (error) {
            console.log('Lỗi điểm danh sinh viên' , error);
            throw error;
        }
    }
}