import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Users, FileText, BarChart3 } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Trang Giảng Viên</h1>
            <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý lớp học</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Teacher Info */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin tài khoản</h2>
          <div className="bg-gray-50 rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium mt-1">{user?.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Vai trò:</span>
                <p className="font-medium mt-1">Giảng viên</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">5</div>
              <div className="text-sm text-gray-500 mt-1">Lớp học</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">120</div>
              <div className="text-sm text-gray-500 mt-1">Sinh viên</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">15</div>
              <div className="text-sm text-gray-500 mt-1">Buổi học tuần này</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">88%</div>
              <div className="text-sm text-gray-500 mt-1">Tỷ lệ điểm danh TB</div>
            </div>
          </div>
        </div>

        {/* Main Functions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Chức năng chính</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="text-left p-4 border border-gray-200 rounded hover:border-gray-300">
              <Users className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-medium text-gray-900">Quản lý lớp học</h3>
              <p className="text-sm text-gray-500 mt-1">Xem danh sách lớp và sinh viên</p>
            </button>
            
            <button className="text-left p-4 border border-gray-200 rounded hover:border-gray-300">
              <FileText className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-medium text-gray-900">Điểm danh</h3>
              <p className="text-sm text-gray-500 mt-1">Tạo và quản lý điểm danh</p>
            </button>
            
            <button className="text-left p-4 border border-gray-200 rounded hover:border-gray-300">
              <BarChart3 className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-medium text-gray-900">Báo cáo</h3>
              <p className="text-sm text-gray-500 mt-1">Xem thống kê và báo cáo</p>
            </button>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Lịch dạy hôm nay</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <div>
                <h3 className="font-medium text-gray-900">Toán Cao Cấp A1</h3>
                <p className="text-sm text-gray-500">Phòng 101 - 40 sinh viên</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>07:30 - 09:30</p>
                <p>Tiết 1-2</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <div>
                <h3 className="font-medium text-gray-900">Lập Trình Web</h3>
                <p className="text-sm text-gray-500">Phòng máy 201 - 35 sinh viên</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>13:30 - 15:30</p>
                <p>Tiết 7-8</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <div>
                <h3 className="font-medium text-gray-900">Cơ Sở Dữ Liệu</h3>
                <p className="text-sm text-gray-500">Phòng 302 - 42 sinh viên</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>15:45 - 17:45</p>
                <p>Tiết 9-10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Đã tạo điểm danh cho lớp Toán Cao Cấp A1</p>
                <p className="text-xs text-gray-500 mt-1">30 phút trước</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-gray-50 rounded">
              <BarChart3 className="h-4 w-4 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Đã xem báo cáo điểm danh tuần này</p>
                <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-gray-50 rounded">
              <Users className="h-4 w-4 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Đã cập nhật danh sách lớp Lập Trình Web</p>
                <p className="text-xs text-gray-500 mt-1">1 ngày trước</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};