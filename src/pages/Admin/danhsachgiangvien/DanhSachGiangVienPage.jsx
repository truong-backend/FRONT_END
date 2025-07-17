import React from 'react';
import {DanhSachGiangVienComponents} from '../../../components/QuanTriVien/QuanLyGiangVien/DanhSachGiangVienComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const DanhSachGiangVienPage = () => {
  return (
    <BocCucChinh>
        <DanhSachGiangVienComponents />
    </BocCucChinh>
  );
};