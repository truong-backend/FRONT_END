import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import {ListMonHoc} from '../../components/monhoc/ListMonHoc';

export const MonHocPage = () => {
  return (
    <DashboardLayout>
      <ListMonHoc />
    </DashboardLayout>
  );
};
