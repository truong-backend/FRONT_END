import React from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import AccListStudent from '../../../components/PhanAdmin/AccTea_Stu/AccListStudent.jsx';

export const StudentPage = () => {
  return (
    <DashboardLayout>
      <AccListStudent role="STUDENT" title="Sinh viên" />
    </DashboardLayout>
  );
};