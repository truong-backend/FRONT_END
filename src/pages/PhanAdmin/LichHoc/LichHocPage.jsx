import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {LichHocComponents} from '../../../components/PhanAdmin/LichHoc/LichHocComponents.jsx'

export const LichHocPage = () => {
  return (
    <DashboardLayout>
      <LichHocComponents/>
    </DashboardLayout>
  );
};