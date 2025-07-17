import React from 'react';
import {DsachDdanhComponents} from '../../../components/QuanTriVien/QuanLyDiemDanh/DsachDdanhComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const DsachDdanhPage = () => {
  return (
    <BocCucChinh>
        <DsachDdanhComponents />
    </BocCucChinh>
  );
};