import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import DanhSachTaiKhoanSinhVienComponents from '../../../components/PhanAdmin/taikhoangiangvien_sinhvien/DanhSachTaiKhoanSinhVienComponents.jsx';

export const DanhSachTaiKhoanSinhVienPage = () => {
  return (
    <DashboardLayout>
      <DanhSachTaiKhoanSinhVienComponents role="STUDENT" title="Sinh viên" />
    </DashboardLayout>
  );
};