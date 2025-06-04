import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ListTeacher from '../../components/user/ListTeacher';

const TeacherPage = () => {
  return (
    <DashboardLayout>
      <ListTeacher role="TEACHER" title="Giảng viên" />
    </DashboardLayout>
  );
};

export default TeacherPage; 