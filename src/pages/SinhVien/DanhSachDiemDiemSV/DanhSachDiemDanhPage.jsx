import React from 'react';
import {DanhSachDiemDiemSVComponents} from '../../../components/SinhVien/DanhSachDiemDanh/DanhSachDiemDiemSVComponents.jsx';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';

export const DanhSachDiemDanhPage = () => {
  return (
    <BocCucChinh>
      < DanhSachDiemDiemSVComponents/>
    </BocCucChinh>
  );
};