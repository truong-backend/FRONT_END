import React from 'react';
import {DsachDdanhComponents} from '../../../components/PhanAdmin/danhsachdiemdanh/DsachDdanhComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import { Card } from 'antd';

export const DsachDdanhPage = () => {
  return (
    <DashboardLayout>
        <DsachDdanhComponents />
    </DashboardLayout>
  );
};