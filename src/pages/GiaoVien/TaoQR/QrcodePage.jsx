import React from 'react';
import {DiemDanhComponents} from '../../../components/GiaoVien/TaoQR/DiemDanhComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const QrcodePage = () => {
  return (
    <BocCucChinh>
        <DiemDanhComponents />
    </BocCucChinh>
  );
};