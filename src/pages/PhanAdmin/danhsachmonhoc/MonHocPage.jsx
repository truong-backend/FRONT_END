import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachMonHoc} from '../../../components/PhanAdmin/monhoc/DanhSachMonHoc.jsx';

export const MonHocPage = () => {
  return (
    <DashboardLayout>
      <DanhSachMonHoc />
    </DashboardLayout>
  );
};
