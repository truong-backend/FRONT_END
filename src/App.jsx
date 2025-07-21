import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BieuMauDangNhap } from './components/DanhNhap/GiaoDien/BieuMauDangNhap.jsx';
import { TrangChuSinhVienPage } from './pages/TrangChu/TrangChuSinhVienPage.jsx';
import { TrangChuGVPage } from './pages/TrangChu/TrangChuGVPage.jsx';
import { TrangChuQTVPage } from './pages/TrangChu/TrangChuQTVPage.jsx';
import { BaoVeDuongDan } from './components/DanhNhap/BaoMat/BaoVeDuongDan';
import { QuenMatKhauComponents } from './components/quenmatkhau/QuenMatKhauComponents.jsx';
import { XacThucOtpComponents } from './components/quenmatkhau/XacThucOtpComponents.jsx';
import { DatLaiMatKhauComponents } from './components/quenmatkhau/DatLaiMatKhauComponents.jsx';
import { useAuth } from './contexts/AuthContext';
import { DanhSachLopPage } from './pages/Admin/danhsachlop/DanhSachLopPage.jsx';
import { DanhSachKhoaPage } from './pages/Admin/danhsachkhoa/DanhSachKhoaPage.jsx';
import { DanhSachMonHocPage } from './pages/Admin/danhsachmonhoc/DanhSachMonHocPage.jsx';
import { DanhSachTaiKhoanQuanTriPage } from './pages/Admin/danhsachtaikhoanadmin/DanhSachTaiKhoanQuanTriPage.jsx';
import { DanhSachGiangVienPage } from './pages/Admin/danhsachgiangvien/DanhSachGiangVienPage';
import { DanhSachSinhVienPage } from './pages/Admin/danhsachsinhvien/DanhSachSinhVienPage';
import { DanhsachlichhocPage } from './pages/Admin/Danhsachlichhoc/DanhsachlichhocPage.jsx';
// import {TkbPage} from './pages/PhanAdmin/danhsachthoikhoabieu/TkbPage';
//đổi tên ProfileSinhVienPage && ProfileGiaoVien 
import SinhVienProfilePage from './pages/SinhVien/Profile/SinhVienProfilePage.jsx';
import GiaoVienProfilePage from './pages/GiaoVien/Profile/GiaoVienProfilePage.jsx';
import { QuetQRPage } from './pages/SinhVien/QuetQR/QuetQRPage.jsx';
import { QrcodePage } from './pages/GiaoVien/TaoQR/QrcodePage.jsx';
import { DanhSachDiemDanhPage } from './pages/SinhVien/DanhSachDiemDiemSV/DanhSachDiemDanhPage.jsx';
import { LichHocSVPage } from './pages/SinhVien/LICHHOC/LichHocSVPage.jsx';
import { TKBSinhVienPage } from './pages/SinhVien/TKB/TKBSinhVienPage.jsx'; // Import the TKBComponents
import ThongTinQRPage from './pages/SinhVien/ThongTinQR/ThongTinQRPage.jsx';
import { DsachDdanhPage } from './pages/Admin/danhsachdiemdanh/DsachDdanhPage.jsx';
import { ThemSinhVienPage } from './pages/GiaoVien/ThemSinhVien/ThemSinhVienPage.jsx';

// import {LichHocPage} from './pages/PhanAdmin/LichHoc/LichHocPage.jsx'
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
                  <BieuMauDangNhap
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
                  <BieuMauDangNhap
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
                  <BieuMauDangNhap
                    userType="ADMIN"
                    title="Đăng nhập Quản trị"
                    description="Trang quản trị hệ thống"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/admin/login"
              element={
                <PublicRoute>
                  <BieuMauDangNhap
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
                  <QuenMatKhauComponents
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
                  <XacThucOtpComponents
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
                  <DatLaiMatKhauComponents
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
                  <QuenMatKhauComponents
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
                  <XacThucOtpComponents
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
                  <DatLaiMatKhauComponents
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
                  <QuenMatKhauComponents
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
                  <XacThucOtpComponents
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
                  <DatLaiMatKhauComponents
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
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <TrangChuSinhVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/student/profile"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <SinhVienProfilePage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/student/qr"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <ThongTinQRPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/teacher/dashboard"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <TrangChuGVPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <GiaoVienProfilePage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <TrangChuQTVPage />
                </BaoVeDuongDan>
              }
            />

            {/* Admin Management Routes */}
            <Route
              path="/admin/lop"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachLopPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DsachDdanhPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/admin/khoa"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachKhoaPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/admin/monhoc"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachMonHocPage />
                </BaoVeDuongDan>
              }
            />
            {/* <Route
              path="/admin/lichhoc"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <LichHocPage />
                </BaoVeDuongDan>
              }
            /> */}
            <Route
              path="/admin/account-account"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachTaiKhoanQuanTriPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/admin/teachers-list"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachGiangVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/admin/students-list"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachSinhVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhsachlichhocPage />
                </BaoVeDuongDan>
              }
            />
            {/* <Route
              path="/admin/schedule"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  < TkbPage/>
                </BaoVeDuongDan>
              }
            /> */}
            <Route
              path="/teacher/diemdanh"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <QrcodePage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/teacher/diemdanh"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <QrcodePage />
                </BaoVeDuongDan>
              }
            /><Route
              path="/teacher/add-student"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <ThemSinhVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/student/scan-qr"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <QuetQRPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/student/attendance-history"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <DanhSachDiemDanhPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/student/calendar"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <LichHocSVPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/student/schedule"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <TKBSinhVienPage />
                </BaoVeDuongDan>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
