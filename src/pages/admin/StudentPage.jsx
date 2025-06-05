import React from 'react';
import {StudentList} from '../../components/student/StudentList';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const StudentPage = () => {
  return (
    <DashboardLayout>
      <StudentList />
    </DashboardLayout>
  );
};