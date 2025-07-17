import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/QuanTriVien/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';

export const StudentPage = () => {
  return (
    <BocCucChinh>
      <DanhSachSinhVienComponents />
    </BocCucChinh>
  );
};