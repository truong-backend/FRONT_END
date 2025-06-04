import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ListAdmin from '../../components/user/ListAdmin';

const AdminPage = () => {
  return (
    <DashboardLayout>
      <ListAdmin />
    </DashboardLayout>
  );
};

export default AdminPage; 