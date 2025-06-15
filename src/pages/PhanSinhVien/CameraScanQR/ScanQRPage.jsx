import React from 'react';
import {ScanQRComponents} from '../../../components/PhanSinhVien/CameraScanQR/ScanQRComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';

export const ScanQRPage = () => {
  return (
    <DashboardLayout>
      < ScanQRComponents/>
    </DashboardLayout>
  );
};