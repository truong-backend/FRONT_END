import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/login/ui/LoginForm';
import { StudentDashboard } from './pages/Home/StudentDashboard';
import { TeacherDashboard } from './pages/Home/TeacherDashboard';
import { AdminDashboard } from './pages/Home/AdminDashboard';
import { ProtectedRoute } from './components/login/Sercurity_login/ProtectedRoute';
import { ForgotPasswordForm } from './components/forget_pass/ForgotPasswordForm';
import { OTPVerificationForm } from './components/forget_pass/OTPVerificationForm';
import { ResetPasswordForm } from './components/forget_pass/ResetPasswordForm';
import { useAuth } from './contexts/AuthContext';
import LopPage from './pages/lop/LopPage';
import KhoaPage from './pages/khoa/KhoaPage';
import MonHocPage from './pages/monhoc/MonHocPage';
import AdminPage from './pages/AccAdmin/AdminPage';
import TeacherPage from './pages/AccTea_Stu/TeacherPage';
import StudentPage from './pages/AccTea_Stu/StudentPage';
import CalendarPage from './pages/calendar/CalendarPage';
// import TeacherPage from './pages/teacher/TeacherPage.jsx';


// Component để bảo vệ các route đăng nhập
const PublicRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated && userRole) {
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/student/login" replace />} />

            {/* Account Management Routes */}


            {/* Login Routes */}
            <Route
              path="/student/login"
              element={
                <PublicRoute>
                  <LoginForm
                    userType="STUDENT"
                    title="Đăng nhập Sinh viên"
                    description="Sử dụng email sinh viên (@student.stu.edu.vn)"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/teacher/login"
              element={
                <PublicRoute>
                  <LoginForm
                    userType="TEACHER"
                    title="Đăng nhập Giảng viên"
                    description="Dành cho giảng viên và cán bộ"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/login"
              element={
                <PublicRoute>
                  <LoginForm
                    userType="ADMIN"
                    title="Đăng nhập Quản trị"
                    description="Trang quản trị hệ thống"
                  />
                </PublicRoute>
              }
            />

            {/* Password Reset Routes - Student */}
            <Route
              path="/student/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordForm
                    userType="STUDENT"
                    title="Quên mật khẩu"
                    description="Khôi phục mật khẩu tài khoản sinh viên"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/student/verify-otp"
              element={
                <PublicRoute>
                  <OTPVerificationForm
                    userType="STUDENT"
                    title="Xác thực OTP"
                    description="Nhập mã OTP đã được gửi đến email của bạn"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/student/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordForm
                    userType="STUDENT"
                    title="Đặt lại mật khẩu"
                    description="Tạo mật khẩu mới cho tài khoản sinh viên"
                  />
                </PublicRoute>
              }
            />

            {/* Password Reset Routes - Teacher */}
            <Route
              path="/teacher/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordForm
                    userType="TEACHER"
                    title="Quên mật khẩu"
                    description="Khôi phục mật khẩu tài khoản giảng viên"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/teacher/verify-otp"
              element={
                <PublicRoute>
                  <OTPVerificationForm
                    userType="TEACHER"
                    title="Xác thực OTP"
                    description="Nhập mã OTP đã được gửi đến email của bạn"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/teacher/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordForm
                    userType="TEACHER"
                    title="Đặt lại mật khẩu"
                    description="Tạo mật khẩu mới cho tài khoản giảng viên"
                  />
                </PublicRoute>
              }
            />

            {/* Password Reset Routes - Admin */}
            <Route
              path="/admin/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordForm
                    userType="ADMIN"
                    title="Quên mật khẩu"
                    description="Khôi phục mật khẩu tài khoản quản trị"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/verify-otp"
              element={
                <PublicRoute>
                  <OTPVerificationForm
                    userType="ADMIN"
                    title="Xác thực OTP"
                    description="Nhập mã OTP đã được gửi đến email của bạn"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordForm
                    userType="ADMIN"
                    title="Đặt lại mật khẩu"
                    description="Tạo mật khẩu mới cho tài khoản quản trị"
                  />
                </PublicRoute>
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

            {/* Admin Management Routes */}
            <Route
              path="/admin/lop"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <LopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/khoa"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <KhoaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/monhoc"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MonHocPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/admin/account-management"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teacher-management"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/student-management"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
