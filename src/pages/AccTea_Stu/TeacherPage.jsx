import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {AccListTeacher} from '../../components/AccTea_Stu/AccListTeacher.jsx';

export const TeacherPage = () => {
  return (
    <DashboardLayout>
      <AccListTeacher role="TEACHER" title="Giảng viên" />
    </DashboardLayout>
  );
};