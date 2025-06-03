import React from 'react';


export const DashboardLayout = ({ children }) => {
  return (
    <div >
      {/* Main content wrapper */}
      <div>

        <div >
          {children}
        </div>

      </div>
    </div>
  );
};