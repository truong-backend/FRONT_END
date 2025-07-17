import React from 'react';
import {ScanQRComponents} from '../../../components/SinhVien/CameraScanQR/ScanQRComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';

export const QuetQRPage = () => {
  return (
    <BocCucChinh>
      < ScanQRComponents/>
    </BocCucChinh>
  );
};