import React from 'react';
import { ThemSinhVienComponent } from '../../../components/GiaoVien/ThemSinhVien/ThemSinhVienComponent.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const ThemSinhVienPage = () => {
  return (
    <BocCucChinh>
      <ThemSinhVienComponent />
    </BocCucChinh>
  );
};