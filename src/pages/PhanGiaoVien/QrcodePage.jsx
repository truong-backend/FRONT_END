import React from 'react';
import {GenerateQRCode} from '../../components/PhanGiaoVien/GenerateQRCode.jsx';
import { DashboardLayout } from '../../components/layout/DashboardLayout.jsx';
import { Card } from 'antd';

export const QrcodePage = () => {
  return (
    <DashboardLayout>
        <GenerateQRCode />
    </DashboardLayout>
  );
};