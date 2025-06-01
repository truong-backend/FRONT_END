import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, CheckCircle, Bell, LogOut, GraduationCap, TrendingUp, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';

export const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const teacherUser = user;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 lg:pl-80">
        {/* Enhanced Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 py-4 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trang Giáo Viên</h1>
                <p className="text-sm text-gray-600">Chào mừng trở lại!</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Student Info */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
              Thông tin cá nhân
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Mã sinh viên:</span>
                  <p className="font-bold text-gray-900 text-lg mt-1">-</p>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email:</span>
                  <p className="font-bold text-gray-900 text-lg mt-1">{teacherUser?.email}</p>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Họ và tên:</span>
                  <p className="font-bold text-gray-900 text-lg mt-1">-</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
              Tổng quan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow duration-200">
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">4</div>
                <div className="text-sm font-medium text-gray-600">Lớp hôm nay</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow duration-200">
                <div className="inline-flex p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">92%</div>
                <div className="text-sm font-medium text-gray-600">Tỷ lệ điểm danh</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow duration-200">
                <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">6</div>
                <div className="text-sm font-medium text-gray-600">Môn học</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow duration-200">
                <div className="inline-flex p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mb-4">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">3</div>
                <div className="text-sm font-medium text-gray-600">Thông báo mới</div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Features */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
              Chức năng chính
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mr-4 group-hover:shadow-xl transition-shadow duration-300">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Lịch học</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Xem lịch học và thời khóa biểu</p>
                  </div>
                </div>
              </button>
              
              <button className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg mr-4 group-hover:shadow-xl transition-shadow duration-300">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Điểm danh</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Thực hiện điểm danh lớp học</p>
                  </div>
                </div>
              </button>
              
              <button className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg mr-4 group-hover:shadow-xl transition-shadow duration-300">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Thông báo</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Xem thông báo từ giảng viên</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Recent Activities */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></div>
              Hoạt động gần đây
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-4 flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Đã điểm danh lớp Toán Cao Cấp A1</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">2 giờ trước</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4 flex-shrink-0">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Thông báo: Lịch thi cuối kỳ đã được cập nhật</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">1 ngày trước</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4 flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Điểm bài tập Lập Trình Web: 9.5/10</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">3 ngày trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};
