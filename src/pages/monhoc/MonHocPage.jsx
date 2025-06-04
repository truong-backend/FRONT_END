import React from 'react';
import { DashboardLayout } from '../../components/layout_dashboard/DashboardLayout';
import ListMonHoc from '../../components/monhoc/ListMonHoc';

const MonHocPage = () => {
  return (
    <DashboardLayout>
      <ListMonHoc />
    </DashboardLayout>
  );
};

export default MonHocPage; 