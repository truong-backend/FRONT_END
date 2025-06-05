import React from 'react';
import StudentList from '../../components/student/StudentList';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ListCalendar from '../../components/Calendar/ListCalendar';

const CalendarPage = () => {
  return (
    <DashboardLayout>
      < ListCalendar/>
    </DashboardLayout>
  );
};

export default CalendarPage; 