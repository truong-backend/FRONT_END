import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import AccListStudent from '../../components/AccTea_Stu/AccListStudent.jsx';

const StudentPage = () => {
  return (
    <DashboardLayout>
      <AccListStudent role="STUDENT" title="Sinh viên" />
    </DashboardLayout>
  );
};

export default StudentPage; 