import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/login/giaodien/LoginForm';
import { StudentDashboard } from './pages/Home/StudentDashboard';
import { TeacherDashboard } from './pages/Home/TeacherDashboard';
import { AdminDashboard } from './pages/Home/AdminDashboard';
import { ProtectedRoute } from './components/login/baomatdangnhap/ProtectedRoute';
import { QuenMatKhauFORM } from './components/quenmatkhau/QuenMatKhauFORM.jsx';
import { XacThucOtpFORM } from './components/quenmatkhau/XacThucOtpFORM.jsx';
import { DatLaiMatKhauFORM } from './components/quenmatkhau/DatLaiMatKhauFORM.jsx';
import { useAuth } from './contexts/AuthContext';
import {DanhSachLopPage} from './pages/PhanAdmin/danhsachlop/DanhSachLopPage.jsx';
import {DanhSachKhoaPage} from './pages/PhanAdmin/danhsachkhoa/DanhSachKhoaPage.jsx';
import {DanhSachMonHocPage} from './pages/PhanAdmin/danhsachmonhoc/DanhSachMonHocPage.jsx';
import {DanhSachTaiKhoanQuanTriPage} from './pages/PhanAdmin/danhsachtaikhoanadmin/DanhSachTaiKhoanQuanTriPage.jsx';
import {DanhSachTaiKhoanGiangVienPage} from './pages/PhanAdmin/danhsachtaikhoangiangvien_sinhvien/DanhSachTaiKhoanGiangVienPage.jsx';
import {DanhSachTaiKhoanSinhVienPage} from './pages/PhanAdmin/danhsachtaikhoangiangvien_sinhvien/DanhSachTaiKhoanSinhVienPage.jsx';
import {DanhSachGiangVienPage} from './pages/PhanAdmin/danhsachgiangvien/DanhSachGiangVienPage';
import {DanhSachSinhVienPage} from './pages/PhanAdmin/danhsachsinhvien/DanhSachSinhVienPage';
import {DanhsachlichhocPage} from './pages/PhanAdmin/Danhsachlichhoc/DanhsachlichhocPage.jsx';
import {TkbPage} from './pages/PhanAdmin/danhsachthoikhoabieu/TkbPage'; // Uncomment if you have a SchedulePage component
import ProfileGiaoVienPage from './pages/PhanGiaoVien/ProfileGiaoVienPage';
import { QrcodePage } from './pages/PhanGiaoVien/QrcodePage.jsx';
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
            <Route path="/" element={<Navigate to="/student/login" replace />} />
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

            <Route
              path="/student/forgot-password"
              element={
                <PublicRoute>
                  <QuenMatKhauFORM
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
                  <XacThucOtpFORM
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
                  <DatLaiMatKhauFORM
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
                  <QuenMatKhauFORM
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
                  <XacThucOtpFORM
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
                  <DatLaiMatKhauFORM
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
                  <QuenMatKhauFORM
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
                  <XacThucOtpFORM
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
                  <DatLaiMatKhauFORM
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
              path="/teacher/profile"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <ProfileGiaoVienPage />
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
                  <DanhSachLopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/khoa"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhSachKhoaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/monhoc"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhSachMonHocPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/admin/account-account"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhSachTaiKhoanQuanTriPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teacher-account"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhSachTaiKhoanGiangVienPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/student-account"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhSachTaiKhoanSinhVienPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers-list"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhSachGiangVienPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students-list"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhSachSinhVienPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DanhsachlichhocPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedule"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  < TkbPage/>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/qr"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <QrcodePage />
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
