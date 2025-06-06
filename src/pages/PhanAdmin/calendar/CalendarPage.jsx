import React from 'react';
import {StudentList} from '../../../components/PhanAdmin/student/StudentList.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import ListCalendar from '../../../components/PhanAdmin/Calendar/ListCalendar.jsx';

export const CalendarPage = () => {
  return (
    <DashboardLayout>
      < ListCalendar/>
    </DashboardLayout>
  );
};
 