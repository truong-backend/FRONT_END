import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, LogOut, User, Mail } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">Trang Sinh Viên</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Tên đăng nhập</p>
                  {/* <p className="font-medium">{(user as any)?.username}</p> */}
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Lịch học</h3>
              <p className="text-gray-600">Xem lịch học hôm nay và tuần này</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Điểm danh</h3>
              <p className="text-gray-600">Thực hiện điểm danh cho các lớp học</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Thông báo</h3>
              <p className="text-gray-600">Xem các thông báo mới nhất</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};