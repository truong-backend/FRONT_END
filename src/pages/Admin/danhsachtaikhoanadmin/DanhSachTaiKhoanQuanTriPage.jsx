import React from 'react';
import { BocCucChinh } from '../../../components/BoCuc/BocCucChinh.jsx';
import {DanhSachTaiKhoanAdminComponents} from '../../../components/QuanTriVien/QuanLyTaiKhoanAdmin/DanhSachTaiKhoanAdminComponents.jsx';

export const DanhSachTaiKhoanQuanTriPage = () => {
  return (
    <BocCucChinh>
      <DanhSachTaiKhoanAdminComponents role="ADMIN" title="Quản trị viên" />
    </BocCucChinh>
  );
};