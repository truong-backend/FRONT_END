import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, LogOut, User, Mail, Crown, Users, Wrench, BarChart3, Cog } from 'lucide-react';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const adminUser = user;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-gray-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Trang Quản Trị</h1>
                <p className="text-sm text-gray-500">Hệ thống quản lý điểm danh</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Admin Info Card */}
          <div className="bg-white shadow rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Crown className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Thông tin quản trị viên</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Tên đăng nhập</p>
                  <p className="font-medium text-gray-900">{adminUser?.username}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{adminUser?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Crown className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Họ và tên</p>
                  <p className="font-medium text-gray-900">{adminUser?.fullName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg border p-4 cursor-pointer hover:shadow-md">
              <div className="text-center">
                <Users className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">Người dùng</h3>
                <p className="text-sm text-gray-500">Quản lý sinh viên và giảng viên</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg border p-4 cursor-pointer hover:shadow-md">
              <div className="text-center">
                <Wrench className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">Hệ thống</h3>
                <p className="text-sm text-gray-500">Cấu hình hệ thống điểm danh</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg border p-4 cursor-pointer hover:shadow-md">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">Báo cáo</h3>
                <p className="text-sm text-gray-500">Thống kê và báo cáo tổng quan</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg border p-4 cursor-pointer hover:shadow-md">
              <div className="text-center">
                <Cog className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-2">Cài đặt</h3>
                <p className="text-sm text-gray-500">Cấu hình hệ thống và quyền hạn</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
