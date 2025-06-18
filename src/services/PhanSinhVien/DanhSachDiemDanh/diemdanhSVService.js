// services/diemDanhService.js

export async function getMonHocBySinhVien(maSv) {
  return [
    { maMh: "MH001", tenMh: "Toán cao cấp", soTiet: 45, hocKy: 1, phongHoc: "B101", ngayBd: "2025-06-01", ngayKt: "2025-08-15" },
    { maMh: "MH002", tenMh: "Vật lý đại cương", soTiet: 30, hocKy: 1, phongHoc: "C202", ngayBd: "2025-06-01", ngayKt: "2025-08-15" }
  ];
}

export async function getDiemDanhByMonHoc(maSv, maMh) {
  return [
    { maDd: 1, maMh, tenMh: "Toán cao cấp", ngayHoc: "2025-06-05", diemDanh1: "08:00", diemDanh2: "09:30", ghiChu: "Có mặt" },
    { maDd: 2, maMh, tenMh: "Toán cao cấp", ngayHoc: "2025-06-12", diemDanh1: null, diemDanh2: null, ghiChu: "Vắng" }
  ];
}
