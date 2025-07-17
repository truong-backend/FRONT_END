import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/QuanTriVien/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import { Card } from 'antd';

export const DanhSachSinhVienPage = () => {
  return (
    <BocCucChinh>
        <DanhSachSinhVienComponents />
    </BocCucChinh>
  );
};