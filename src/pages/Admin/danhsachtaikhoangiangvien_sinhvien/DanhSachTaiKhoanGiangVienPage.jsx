import React from 'react';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import {DanhSachTaiKhoanGiangVienComponents} from '../../../components/QuanTriVien/QuanLyTaiKhoanGiaoVien_SinhVien/DanhSachTaiKhoanGiangVienComponents.jsx';

export const DanhSachTaiKhoanGiangVienPage = () => {
  return (
    <BocCucChinh>
      <DanhSachTaiKhoanGiangVienComponents role="TEACHER" title="Giảng viên" />
    </BocCucChinh>
  );
};