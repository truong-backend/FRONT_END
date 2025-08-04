import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, CheckCircle, Bell, LogOut, GraduationCap, TrendingUp, Clock } from 'lucide-react';
import { BocCucChinh } from '../../components/BoCuc/BocCucChinh.jsx';

export const TrangChuSinhVienPage = () => {
  const { logout } = useAuth();
  useEffect(() => {
    document.title = 'Trang Sinh Viên - Trang Chủ';
  }, []);
  return (
    <BocCucChinh>
      <div >
        {/* Enhanced Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 py-4 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trang Sinh Viên</h1>
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


      </div>
    </BocCucChinh>
  );
};