import React from 'react';
import {DanhSachGiangVien} from '../../../components/PhanAdmin/danhsachgiangvien/DanhSachGiangVien.jsx';
import { Card } from 'antd';

export const TeacherPage = () => {
  return (
    <DashboardLayout>
        <DanhSachGiangVien />
    </DashboardLayout>
  );
};