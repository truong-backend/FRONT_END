import api from "../../api.js";

export async function getMonHocBySinhVien(maSv) {
  try {
    const response = await api.get(`monhoc/danh-sach-mon-hoc-cua-sinh-vien?maSv=${maSv}`);
    console.log('res mon hoc: ', response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách môn học:", error);
    throw error;
  }
}

export async function getDiemDanhByMonHoc(maMh, nhm) {
  try {
    const response = await api.get(`/diemdanh/ketqua_diemdanh_sinhvien`, {
      params: {
        maMh: maMh,
        nmh: nhm
      }
    });
    console.log('res kqdd: ',response.data);
    console.log('res : ',response);

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy điểm danh theo môn học:", error);
    throw error;
  }
}