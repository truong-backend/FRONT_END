import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachMonHoc} from '../../../components/PhanAdmin/monhoc/DanhSachMonHoc.jsx';

export const DanhSachMonHocPage = () => {
  return (
    <DashboardLayout>
      <DanhSachMonHoc />
    </DashboardLayout>
  );
};
