import React from 'react';
import {StudentList} from '../../../components/PhanAdmin/danhsachsinhvien/StudentList.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import DanhSachLich from '../../../components/PhanAdmin/Danhsachlich/DanhSachLich.jsx';

export const CalendarPage = () => {
  return (
    <DashboardLayout>
      < DanhSachLich/>
    </DashboardLayout>
  );
};
 