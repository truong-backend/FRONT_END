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

    updateSinhVienProfile : async (data,avatarFile) =>{
        try {
            const formData = new FormData();
            formData.append(
                'profile',
                new Blob([JSON.stringify(data)], { type: 'application/json' })
            );

            if(avatarFile) {
                formData.append('avatarFile', avatarFile);
            }
            const res = await api.put('/sinh-vien/update-profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return res.data;
        } catch (error) {
            console.log('Lỗi khi cập nhật thông tin sinh viên',error);
            return null;
        }
    }
}