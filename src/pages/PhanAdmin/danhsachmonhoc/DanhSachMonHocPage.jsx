import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachMonHocComponents} from '../../../components/PhanAdmin/monhoc/DanhSachMonHocComponents.jsx';

export const DanhSachMonHocPage = () => {
  return (
    <DashboardLayout>
      <DanhSachMonHocComponents />
    </DashboardLayout>
  );
};
