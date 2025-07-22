import React from 'react';
import {ThoiKhoaBieuComponent} from '../../../components/GiaoVien/ThoiKhoaBieu/ThoiKhoaBieuComponent.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const ThoiKhoaBieuPage = () => {
  return (
    <BocCucChinh>
        <ThoiKhoaBieuComponent />
    </BocCucChinh>
  );
};