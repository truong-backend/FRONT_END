import React from 'react';
import {GenerateQRCodeComponents} from '../../../components/PhanGiaoVien/TaoQR/GenerateQRCodeComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import { Card } from 'antd';

export const QrcodePage = () => {
  return (
    <DashboardLayout>
        <GenerateQRCodeComponents />
    </DashboardLayout>
  );
};