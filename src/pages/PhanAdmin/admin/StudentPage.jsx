import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/PhanAdmin/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';

export const StudentPage = () => {
  return (
    <DashboardLayout>
      <DanhSachSinhVienComponents />
    </DashboardLayout>
  );
};