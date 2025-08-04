import api from "../../api.js";

export const GiaoVienService = {
    getGiaoVienProfile: async () => {
        try {
            const response = await api.get('/giao-vien/profile');
            return response.data;
        } catch (error) {
            console.error('Lỗi lấy thông tin giáo viên', error)
            return null;
        }
    },

    updateGiaoVienProfile: async (data) => {
        try {
            const respone = await api.put('/giao-vien/update-profile', data);
            return respone.data;
        } catch (error) {
            console.log('Lỗi update thông tin giáo viên')
            return null;
        }
    },
    diemDanhFace: async (file,requestData) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('maTkb', requestData.maTkb);
        formData.append('ngayHoc', requestData.ngayHoc); // ISO format yyyy-MM-dd
        formData.append('ghiChu', requestData.ghiChu);
        
        try {
            const res = await api.post('/giao-vien/diemdanh-face', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }); console.log('Điểm danh khuôn mặt thành công:', res.data);
            return res.data;
        } catch (error) {
            console.error('Lỗi điểm danh khuôn mặt:', error);
            throw error;
        }
    },

    diemdanhQRSinhVien: async (studentInfo) => {
        try {
            const res = await api.post('/giao-vien/diemdanhnguoc', studentInfo);
            console.log('res data', res.data);
            return res.data;
        } catch (error) {
            console.log('Lỗi điểm danh sinh viên', error);
            throw error;
        }
    },
    getMonHocForDiemDanh: async () => {
        try {
            const res = await api.get('/monhoc/monHocKetQuaDiemDanh');
            console.log('data môn học kết quả điểm danh: ', res.data);
            return res.data;
        } catch (error) {
            console.log('Lỗi lấy môn học cho kết quả điểm danh', error);
            throw error;
        }
    },
    thongKeDiemDanh: async (maMh, nmh, maGd) => {
        try {
            const res = await api.get('/diemdanh/thongke_diemdanh', {
                params: {
                    maMh: maMh,
                    nmh: nmh,
                    maGd: maGd
                }
            });
            console.log('thống kê điểm danh', res.data);
            return res.data;
        } catch (error) {
            console.log('Lỗi thống kê điểm danh');
            throw error;
        }
    },
    GetLanDiemDanh: async (maTkb, maSv, ngayHoc) => {
        try {
            const res = await api.get('/diemdanh/getLanDiemDanh', {
                params: {
                    maTkb: maTkb,
                    maSv: maSv,
                    ngayHoc: ngayHoc
                }
            });
            console.log('lan diem danh', res.data);
            return res.data;
        } catch (error) {
            console.log('Lỗi lần điểm danh');
            throw error;
        }
    },
    ExportThongKe: async (maMh, nmh, maGd) => {
        try {
            const res = await api.get('/diemdanh/export-thong-ke-excel', {
                params: {
                    maMh: maMh,
                    nmh: nmh,
                    maGd: maGd
                },
                responseType: 'blob',
            });
            return res.data;
        } catch (error) {
            console.log('xuất excel thống kê điểm danh thất bại', error);
            throw error;
        }
    }
}