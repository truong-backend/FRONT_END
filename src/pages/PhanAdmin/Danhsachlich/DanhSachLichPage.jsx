import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/PhanAdmin/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import DanhSachLichComponents from '../../../components/PhanAdmin/Danhsachlich/DanhSachLichComponents.jsx';

export const DanhSachLichPage = () => {
  return (
    <DashboardLayout>
      < DanhSachLichComponents/>
    </DashboardLayout>
  );
};
 