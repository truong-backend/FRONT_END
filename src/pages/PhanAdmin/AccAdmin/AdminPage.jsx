import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import ListAdmin from '../../../components/PhanAdmin/AccAdmin/AccListAdmin.jsx';

export const AdminPage = () => {
  return (
    <DashboardLayout>
      <ListAdmin role="ADMIN" title="Quản trị viên" />
    </DashboardLayout>
  );
};