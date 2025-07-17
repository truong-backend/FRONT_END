import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

export const BaoVeDuongDan = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath = allowedRoles.includes('ADMIN')
      ? '/admin/login'
      : allowedRoles.includes('TEACHER')
      ? '/teacher/login'
      : '/student/login';

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    switch (userRole) {
      case 'STUDENT':
        return <Navigate to="/student/dashboard" replace />;
      case 'TEACHER':
        return <Navigate to="/teacher/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
