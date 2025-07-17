import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/QuanTriVien/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import DanhSachLichComponents from '../../../components/QuanTriVien/Danhsachlich/DanhSachLichComponents.jsx';

export const DanhSachLichPage = () => {
  return (
    <BocCucChinh>
      < DanhSachLichComponents/>
    </BocCucChinh>
  );
};
 