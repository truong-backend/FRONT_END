import React from 'react';
import {DanhSachGiangVien} from '../../../components/PhanAdmin/danhsachgiangvien/DanhSachGiangVien';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import { Card } from 'antd';

export const DanhSachGiangVienPage = () => {
  return (
    <DashboardLayout>
        <DanhSachGiangVien />
    </DashboardLayout>
  );
};