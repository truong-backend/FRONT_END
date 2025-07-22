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
import SinhVienProfilePage from './pages/SinhVien/Profile/SinhVienProfilePage.jsx';
import GiaoVienProfilePage from './pages/GiaoVien/Profile/GiaoVienProfilePage.jsx';
import { QuetQRPage } from './pages/SinhVien/QuetQR/QuetQRPage.jsx';
import { QrcodePage } from './pages/GiaoVien/TaoQR/QrcodePage.jsx';
import { DanhSachDiemDanhPage } from './pages/SinhVien/DanhSachDiemDiemSV/DanhSachDiemDanhPage.jsx';
import { LichHocSVPage } from './pages/SinhVien/LICHHOC/LichHocSVPage.jsx';
import { TKBSinhVienPage } from './pages/SinhVien/TKB/TKBSinhVienPage.jsx';
import ThongTinQRPage from './pages/SinhVien/ThongTinQR/ThongTinQRPage.jsx';
import { DsachDdanhPage } from './pages/Admin/danhsachdiemdanh/DsachDdanhPage.jsx';
import { ThemSinhVienPage } from './pages/GiaoVien/ThemSinhVien/ThemSinhVienPage.jsx';
import { ThoiKhoaBieuPage } from './pages/GiaoVien/ThoiKhoaBieu/ThoiKhoaBieuPage.jsx';

// Component để bảo vệ các route đăng nhập
const PublicRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated && userRole) {
    switch (userRole) {
      case 'STUDENT':
        return <Navigate to="/sinh-vien/trang-chu" replace />;
      case 'TEACHER':
        return <Navigate to="/giao-vien/trang-chu" replace />;
      case 'ADMIN':
        return <Navigate to="/quan-tri/trang-chu" replace />;
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
            <Route path="/" element={<Navigate to="/sinh-vien/dang-nhap" replace />} />
            <Route
              path="/sinh-vien/dang-nhap"
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
              path="/giao-vien/dang-nhap"
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
              path="/quan-tri/dang-nhap"
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
              path="/sinh-vien/quen-mat-khau"
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
              path="/sinh-vien/xac-thuc-otp"
              element={
                <PublicRoute>
                  <XacThucOtpComponents
                    userType="STUDENT"
                    title="Xác thức OTP"
                    description="Nhập mã OTP đã được gửi đến email của bạn"
                  />
                </PublicRoute>
              }
            />
            <Route
              path="/sinh-vien/dat-lai-mat-khau"
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
              path="/giao-vien/quen-mat-khau"
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
              path="/giao-vien/xac-thuc-otp"
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
              path="/giao-vien/dat-lai-mat-khau"
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
              path="/quan-tri/quen-mat-khau"
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
              path="/quan-tri/xac-thuc-otp"
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
              path="/quan-tri/dat-lai-mat-khau"
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
              path="/sinh-vien/trang-chu"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <TrangChuSinhVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/sinh-vien/thong-tin-ca-nhan"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <SinhVienProfilePage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/sinh-vien/ma-qr"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <ThongTinQRPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/giao-vien/trang-chu"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <TrangChuGVPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/giao-vien/thong-tin-ca-nhan"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <GiaoVienProfilePage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/trang-chu"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <TrangChuQTVPage />
                </BaoVeDuongDan>
              }
            />

            {/* Admin Management Routes */}
            <Route
              path="/quan-tri/quan-ly-lop"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachLopPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/quan-ly-diem-danh"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DsachDdanhPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/quan-ly-khoa"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachKhoaPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/quan-ly-mon-hoc"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachMonHocPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/tai-khoan-quan-tri"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachTaiKhoanQuanTriPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/danh-sach-giao-vien"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachGiangVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/danh-sach-sinh-vien"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhSachSinhVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/quan-tri/quan-ly-lich-giang-day"
              element={
                <BaoVeDuongDan allowedRoles={['ADMIN']}>
                  <DanhsachlichhocPage />
                </BaoVeDuongDan>
              }
            />

            <Route
              path="/giao-vien/diem-danh"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <QrcodePage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/giao-vien/them-sinh-vien"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <ThemSinhVienPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/giao-vien/thoi-khoa-bieu"
              element={
                <BaoVeDuongDan allowedRoles={['TEACHER']}>
                  <ThoiKhoaBieuPage/>
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/sinh-vien/quet-ma-qr"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <QuetQRPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/sinh-vien/lich-su-diem-danh"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <DanhSachDiemDanhPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/sinh-vien/lich-hoc"
              element={
                <BaoVeDuongDan allowedRoles={['STUDENT']}>
                  <LichHocSVPage />
                </BaoVeDuongDan>
              }
            />
            <Route
              path="/sinh-vien/thoi-khoa-bieu"
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