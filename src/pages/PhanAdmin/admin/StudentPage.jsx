import React from 'react';
import {StudentList} from '../../../components/PhanAdmin/student/StudentList.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';

export const StudentPage = () => {
  return (
    <DashboardLayout>
      <StudentList />
    </DashboardLayout>
  );
};