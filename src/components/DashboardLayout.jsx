import React from 'react';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 w-full lg:w-[calc(100%-20rem)] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};