import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, LogOut, User, Mail, Crown } from 'lucide-react';
import type { AdminLoginResponse } from '../types/auth'; // Adjust the import path as necessary

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const adminUser = user as AdminLoginResponse; // AdminLoginResponse

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">Trang Quản Trị</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors"
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
            <h2 className="text-xl font-semibold mb-4">Thông tin quản trị viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Tên đăng nhập</p>
                  <p className="font-medium">{adminUser?.username}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{adminUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Crown className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium">{adminUser?.fullName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Người dùng</h3>
              <p className="text-gray-600">Quản lý sinh viên và giảng viên</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Hệ thống</h3>
              <p className="text-gray-600">Cấu hình hệ thống điểm danh</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Báo cáo</h3>
              <p className="text-gray-600">Thống kê và báo cáo tổng quan</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Cài đặt</h3>
              <p className="text-gray-600">Cấu hình hệ thống và quyền hạn</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};