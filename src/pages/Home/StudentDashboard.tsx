import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, CheckCircle, Bell, LogOut } from 'lucide-react';
import type { UserLoginResponse } from '../../types/auth';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const studentUser = user as UserLoginResponse;

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Trang Sinh Viên</h1>
            {/* <p className="text-sm text-gray-500 mt-1">Xin chào, {studentUser?.fullName || 'Sinh viên'}</p> */}
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
        {/* Student Info - Simple Card */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h2>
          <div className="bg-gray-50 rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Mã sinh viên:</span>
                {/* <p className="font-medium mt-1">{studentUser?.studentId || 'SV2024001'}</p> */}
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium mt-1">{studentUser?.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Họ và tên:</span>
                {/* <p className="font-medium mt-1">{studentUser?.fullName || 'Chưa cập nhật'}</p> */}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">4</div>
              <div className="text-sm text-gray-500 mt-1">Lớp hôm nay</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">92%</div>
              <div className="text-sm text-gray-500 mt-1">Tỷ lệ điểm danh</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">6</div>
              <div className="text-sm text-gray-500 mt-1">Môn học</div>
            </div>
            <div className="text-center py-4 border border-gray-200 rounded">
              <div className="text-2xl font-medium text-gray-900">3</div>
              <div className="text-sm text-gray-500 mt-1">Thông báo mới</div>
            </div>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Chức năng chính</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="text-left p-4 border border-gray-200 rounded hover:border-gray-300">
              <Calendar className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-medium text-gray-900">Lịch học</h3>
              <p className="text-sm text-gray-500 mt-1">Xem lịch học và thời khóa biểu</p>
            </button>
            
            <button className="text-left p-4 border border-gray-200 rounded hover:border-gray-300">
              <CheckCircle className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-medium text-gray-900">Điểm danh</h3>
              <p className="text-sm text-gray-500 mt-1">Thực hiện điểm danh lớp học</p>
            </button>
            
            <button className="text-left p-4 border border-gray-200 rounded hover:border-gray-300">
              <Bell className="h-5 w-5 text-gray-600 mb-2" />
              <h3 className="font-medium text-gray-900">Thông báo</h3>
              <p className="text-sm text-gray-500 mt-1">Xem thông báo từ giảng viên</p>
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-gray-50 rounded">
              <CheckCircle className="h-4 w-4 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Đã điểm danh lớp Toán Cao Cấp A1</p>
                <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-gray-50 rounded">
              <Bell className="h-4 w-4 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Thông báo: Lịch thi cuối kỳ đã được cập nhật</p>
                <p className="text-xs text-gray-500 mt-1">1 ngày trước</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-gray-50 rounded">
              <BookOpen className="h-4 w-4 text-purple-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Điểm bài tập Lập Trình Web: 9.5/10</p>
                <p className="text-xs text-gray-500 mt-1">3 ngày trước</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 