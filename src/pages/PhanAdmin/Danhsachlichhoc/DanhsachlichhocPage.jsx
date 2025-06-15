import React from 'react';
import {DanhSachSinhVienComponents} from '../../../components/PhanAdmin/danhsachsinhvien/DanhSachSinhVienComponents.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import {DanhsachlichhocComponents} from '../../../components/PhanAdmin/Danhsachlichhoc/DanhsachlichhocComponents.jsx';

export const DanhsachlichhocPage = () => {
  return (
    <DashboardLayout>
      < DanhsachlichhocComponents/>
    </DashboardLayout>
  );
};
 