import React from 'react';
import {TeacherList} from '../../components/teacher/TeacherList.jsx';
import { Card } from 'antd';

export const TeacherPage = () => {
  return (
    <DashboardLayout>
        <TeacherList />
    </DashboardLayout>
  );
};