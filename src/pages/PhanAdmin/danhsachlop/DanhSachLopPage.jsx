import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachLopComponents} from '../../../components/PhanAdmin/lop/DanhSachLopComponents.jsx';

export const DanhSachLopPage = () => {
  return (
    <DashboardLayout>
      <DanhSachLopComponents />
    </DashboardLayout>
  );
};
