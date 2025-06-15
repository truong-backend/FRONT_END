import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/PhanAdmin/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import { Card } from 'antd';

export const DanhSachSinhVienPage = () => {
  return (
    <DashboardLayout>
        <DanhSachSinhVienComponents />
    </DashboardLayout>
  );
};