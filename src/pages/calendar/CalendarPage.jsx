import React from 'react';
import {StudentList} from '../../components/student/StudentList';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ListCalendar from '../../components/Calendar/ListCalendar';

export const CalendarPage = () => {
  return (
    <DashboardLayout>
      < ListCalendar/>
    </DashboardLayout>
  );
};
 