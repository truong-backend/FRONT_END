import React from 'react';
import {DanhSachSinhVien} from '../../../components/PhanAdmin/danhsachsinhvien/DanhSachSinhVien.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';

export const StudentPage = () => {
  return (
    <DashboardLayout>
      <DanhSachSinhVien />
    </DashboardLayout>
  );
};