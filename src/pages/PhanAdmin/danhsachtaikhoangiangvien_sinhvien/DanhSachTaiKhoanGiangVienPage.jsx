import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachTaiKhoanGiangVienComponents} from '../../../components/PhanAdmin/taikhoangiangvien_sinhvien/DanhSachTaiKhoanGiangVienComponents.jsx';

export const DanhSachTaiKhoanGiangVienPage = () => {
  return (
    <DashboardLayout>
      <DanhSachTaiKhoanGiangVienComponents role="TEACHER" title="Giảng viên" />
    </DashboardLayout>
  );
};