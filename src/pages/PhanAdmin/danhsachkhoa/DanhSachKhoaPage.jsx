import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachKhoaComponents} from '../../../components/PhanAdmin/khoa/DanhSachKhoaComponents.jsx';

export const DanhSachKhoaPage = () => {
  return (
    <DashboardLayout>
      <DanhSachKhoaComponents />
    </DashboardLayout>
  );
};
