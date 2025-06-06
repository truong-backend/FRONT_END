import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {ListMonHoc} from '../../../components/PhanAdmin/monhoc/ListMonHoc.jsx';

export const MonHocPage = () => {
  return (
    <DashboardLayout>
      <ListMonHoc />
    </DashboardLayout>
  );
};
