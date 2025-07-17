import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/QuanTriVien/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import {DanhsachlichGDComponents} from '../../../components/QuanTriVien/DanhsachLichGD/DanhsachlichGDComponents.jsx';

export const DanhsachlichhocPage = () => {
  return (
    <BocCucChinh>
      < DanhsachlichGDComponents/>
    </BocCucChinh>
  );
};
 