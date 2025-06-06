import React from 'react';
import {DanhSachSinhVien} from '../../../components/PhanAdmin/danhsachsinhvien/DanhSachSinhVien.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import DanhSachLich from '../../../components/PhanAdmin/Danhsachlich/DanhSachLich.jsx';

export const DanhSachLichPage = () => {
  return (
    <DashboardLayout>
      < DanhSachLich/>
    </DashboardLayout>
  );
};
 