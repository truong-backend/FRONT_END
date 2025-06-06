import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachLop} from '../../../components/PhanAdmin/lop/DanhSachLop.jsx';

export const DanhSachLopPage = () => {
  return (
    <DashboardLayout>
      <DanhSachLop />
    </DashboardLayout>
  );
};
