import React from 'react';
import StudentList from '../../components/student/StudentList';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

const StudentPage = () => {
  return (
    <DashboardLayout>
      <StudentList />
    </DashboardLayout>
  );
};

export default StudentPage; 