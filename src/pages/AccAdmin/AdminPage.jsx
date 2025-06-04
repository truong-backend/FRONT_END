import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ListAdmin from '../../components/AccAdmin/AccListAdmin.jsx';

const AdminPage = () => {
  return (
    <DashboardLayout>
      <ListAdmin role="ADMIN" title="Quản trị viên" />
    </DashboardLayout>
  );
};

export default AdminPage; 