import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachTaiKhoanGiangVien} from '../../../components/PhanAdmin/taikhoangiangvien_sinhvien/DanhSachTaiKhoanGiangVien.jsx';

export const TeacherPage = () => {
  return (
    <DashboardLayout>
      <DanhSachTaiKhoanGiangVien role="TEACHER" title="Giảng viên" />
    </DashboardLayout>
  );
};