import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachKhoa} from '../../../components/PhanAdmin/khoa/DanhSachKhoa.jsx';

export const DanhSachKhoaPage = () => {
  return (
    <DashboardLayout>
      <DanhSachKhoa />
    </DashboardLayout>
  );
};
