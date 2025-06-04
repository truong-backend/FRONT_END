import React from 'react';
import TeacherList from '../../components/teacher/TeacherList.jsx';
import { Card } from 'antd';

const TeacherPage = () => {
  return (
    <DashboardLayout>
        <TeacherList />
    </DashboardLayout>
  );
};

export default TeacherPage;