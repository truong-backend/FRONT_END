import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ListAdmin from '../../components/admin/ListAdmin';

const AdminPage = () => {
  return (
    <DashboardLayout>
      <ListAdmin role="ADMIN" title="Quản trị viên" />
    </DashboardLayout>
  );
};

export default AdminPage; 