import React from 'react';
// import { ThemSinhVienComponents } from '../../../components/GiaoVien/ThemSinhVien/themSinhVienComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const ThemSinhVienPage = () => {
  return (
    <BocCucChinh>
        <ThemSinhVienComponents />
    </BocCucChinh>
  );
};