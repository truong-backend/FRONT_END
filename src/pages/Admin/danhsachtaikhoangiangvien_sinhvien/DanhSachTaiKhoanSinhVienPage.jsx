import React from 'react';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import {DanhSachTaiKhoanSinhVienComponents} from '../../../components/QuanTriVien/QuanLyTaiKhoanGiaoVien_SinhVien/DanhSachTaiKhoanSinhVienComponents.jsx';

export const DanhSachTaiKhoanSinhVienPage = () => {
  return (
    <BocCucChinh>
      <DanhSachTaiKhoanSinhVienComponents role="STUDENT" title="Sinh viên" />
    </BocCucChinh>
  );
};