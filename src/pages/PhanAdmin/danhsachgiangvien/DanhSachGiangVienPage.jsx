import React from 'react';
import {DanhSachGiangVienComponents} from '../../../components/PhanAdmin/danhsachgiangvien/DanhSachGiangVienComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import { Card } from 'antd';

export const DanhSachGiangVienPage = () => {
  return (
    <DashboardLayout>
        <DanhSachGiangVienComponents />
    </DashboardLayout>
  );
};