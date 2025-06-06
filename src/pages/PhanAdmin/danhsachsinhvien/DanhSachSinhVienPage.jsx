import React from 'react';
import {DanhSachSinhVien} from '../../../components/PhanAdmin/danhsachsinhvien/DanhSachSinhVien.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import { Card } from 'antd';

export const DanhSachSinhVienPage = () => {
  return (
    <DashboardLayout>
        <DanhSachSinhVien />
    </DashboardLayout>
  );
};