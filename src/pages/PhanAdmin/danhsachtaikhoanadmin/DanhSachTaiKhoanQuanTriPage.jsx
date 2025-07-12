import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhSachTaiKhoanAdminComponents} from '../../../components/PhanAdmin/taikhoanadmin/DanhSachTaiKhoanAdminComponents.jsx';

export const DanhSachTaiKhoanQuanTriPage = () => {
  return (
    <DashboardLayout>
      <DanhSachTaiKhoanAdminComponents role="ADMIN" title="Quản trị viên" />
    </DashboardLayout>
  );
};