import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import AccListAdmin from '../../../components/PhanAdmin/taikhoanadmin/DanhSachTaiKhoanAdmin.jsx';

export const AdminPage = () => {
  return (
    <DashboardLayout>
      <AccListAdmin role="ADMIN" title="Quản trị viên" />
    </DashboardLayout>
  );
};