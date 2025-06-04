import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ListStudent from '../../components/user/ListStudent';

const StudentPage = () => {
  return (
    <DashboardLayout>
      <ListStudent role="STUDENT" title="Sinh viên" />
    </DashboardLayout>
  );
};

export default StudentPage; 