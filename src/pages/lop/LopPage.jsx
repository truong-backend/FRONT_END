import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import {ListLop} from '../../components/lop/ListLop';

export const LopPage = () => {
  return (
    <DashboardLayout>
      <ListLop />
    </DashboardLayout>
  );
};
