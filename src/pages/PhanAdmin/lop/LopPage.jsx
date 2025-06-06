import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {ListLop} from '../../../components/PhanAdmin/lop/ListLop.jsx';

export const LopPage = () => {
  return (
    <DashboardLayout>
      <ListLop />
    </DashboardLayout>
  );
};
