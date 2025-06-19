import api from "../../api.js";

export async function getMonHocBySinhVien(maSv) {
  try {
    const response = await api.get(`monhoc/danh-sach-mon-hoc-cua-sinh-vien?maSv=${maSv}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách môn học:", error);
    throw error;
  }
}

export async function getDiemDanhByMonHoc(maSv, maMh) {
  try {
    const response = await api.get(`diemdanh/diemdanh_sinhvien?maSv=${maSv}&maMh=${maMh}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy điểm danh theo môn học:", error);
    throw error;
  }
}