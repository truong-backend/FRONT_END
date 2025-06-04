import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

export const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        role={role}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};