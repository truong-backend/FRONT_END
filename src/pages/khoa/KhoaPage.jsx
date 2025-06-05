import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import {ListKhoa} from '../../components/khoa/ListKhoa';

export const KhoaPage = () => {
  return (
    <DashboardLayout>
      <ListKhoa />
    </DashboardLayout>
  );
};
