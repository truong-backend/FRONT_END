import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import DanhSachTaiKhoanSinhVien from '../../../components/PhanAdmin/taikhoangiangvien_sinhvien/DanhSachTaiKhoanSinhVien.jsx';

export const DanhSachTaiKhoanSinhVienPage = () => {
  return (
    <DashboardLayout>
      <DanhSachTaiKhoanSinhVien role="STUDENT" title="Sinh viên" />
    </DashboardLayout>
  );
};