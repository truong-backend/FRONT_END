import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { StudentDashboard } from './components/StudentDashboard.';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Login Routes */}
            <Route
              path="/login"
              element={
                <LoginForm
                  userType="STUDENT"
                  title="Đăng nhập Sinh viên"
                  description="Sử dụng email sinh viên (@student.stu.edu.vn)"
                />
              }
            />
            <Route
              path="/teacher/login"
              element={
                <LoginForm
                  userType="TEACHER"
                  title="Đăng nhập Giảng viên"
                  description="Dành cho giảng viên và cán bộ"
                />
              }
            />
            <Route
              path="/admin/login"
              element={
                <LoginForm
                  userType="ADMIN"
                  title="Đăng nhập Quản trị"
                  description="Trang quản trị hệ thống"
                />
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;