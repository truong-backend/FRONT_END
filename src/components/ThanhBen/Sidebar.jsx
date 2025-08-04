import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  FileText,
  ClipboardList,
  MessageSquare,
  ChevronDown,
  UserCog,
  Presentation,
  UserCog2,
  ClipboardCheck,
  CalendarDays,
  CalendarRange,
  Building,
  Book,
  QrCode,
  UserCheck,
  User,
  Menu,
  X,
} from 'lucide-react';

const menuItemsByRole = {
  admin: [
    { title: 'Trang Chủ',  icon: <LayoutDashboard size={20} />, path: '/quan-tri/trang-chu' },
    { title: 'Tài Khoản Quản Trị', icon: <UserCog size={18} />, path: '/quan-tri/tai-khoan-quan-tri' },
    { title: 'Báo Cáo Điểm Danh',  icon: <ClipboardCheck size={20} />, path: '/quan-tri/quan-ly-diem-danh' },
    { title: 'Quản Lý Lịch GD', icon: <Presentation size={20} />, path: '/quan-tri/quan-ly-lich-giang-day' },
    { title: 'Quản Lý Giáo Viên', icon: <Presentation size={20} />, path: '/quan-tri/danh-sach-giao-vien' },
    { title: 'Quản Lý Sinh Viên', icon: <GraduationCap size={20} />, path: '/quan-tri/danh-sach-sinh-vien' },
    { title: 'Quản Lý Lớp SV',  icon: <Users size={20} />, path: '/quan-tri/quan-ly-lop' },
    { title: 'Quản Lý Khoa', icon: <Building size={20} />, path: '/quan-tri/quan-ly-khoa' },
    { title: 'Quản Lý Môn Học',  icon: <Book size={20} />, path: '/quan-tri/quan-ly-mon-hoc' },
  ],
  teacher: [
    { title: 'Trang Chủ', icon: <FileText size={20} />, path: '/giao-vien/trang-chu' },
    { title: 'Điểm Danh', icon: <QrCode size={20} />, path: '/giao-vien/diem-danh' },
    { title: 'Kết Quả Điểm Danh',  icon: <UserCheck size={20} />, path: '/giao-vien/ket-qua-diem-danh' },
    { title: 'Lịch học & Sinh viên',  icon: <Calendar size={20} />, path: '/giao-vien/them-sinh-vien' },
    // { title: 'Quản lý thời khóa biểu', shortTitle: 'QLTKB', icon: <Calendar size={20} />, path: '/giao-vien/thoi-khoa-bieu' },
    { title: 'Thông Tin Cá Nhân', icon: <User size={20} />, path: '/giao-vien/thong-tin-ca-nhan' },
  ],
  student: [
    { title: 'Trang Chủ',  icon: <BookOpen size={20} />, path: '/sinh-vien/trang-chu' },
    { title: 'Điểm Danh QR', icon: <Calendar size={20} />, path: '/sinh-vien/quet-ma-qr' },
    // { title: 'Thời Khóa Biểu', icon: <ClipboardList size={20} />, path: '/sinh-vien/thoi-khoa-bieu' },
    // { title: 'Lịch Học Hôm Nay',  icon: <Calendar size={20} />, path: '/sinh-vien/lich-hoc' },
    { title: 'Lịch Sử Điểm Danh',  icon: <MessageSquare size={20} />, path: '/sinh-vien/lich-su-diem-danh' },
    { title: 'QR Code',  icon: <QrCode size={20} />, path: '/sinh-vien/ma-qr' },
    { title: 'Thông Tin Cá Nhân',  icon: <MessageSquare size={20} />, path: '/sinh-vien/thong-tin-ca-nhan' },
  ]
};

const MenuItem = ({ item, isExpanded, isOpen, toggleOpen, isMobile, onMobileClose }) => {
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = location.pathname === item.path || 
    (hasSubItems && item.subItems.some(subItem => location.pathname === subItem.path));

  const renderLink = (content, path) => {
    if (path) {
      return (
        <Link
          to={path}
          onClick={() => isMobile && onMobileClose && onMobileClose()}
          className={`flex items-center px-4 py-3 transition-colors ${
            isActive 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {content}
        </Link>
      );
    }
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          if (hasSubItems) toggleOpen();
        }}
        className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
          isOpen ? 'bg-gray-50' : ''
        } ${isActive ? 'text-blue-600' : 'text-gray-700'} hover:bg-gray-100`}
      >
        {content}
      </div>
    );
  };

  const content = (
    <>
      <span className="text-lg">{item.icon}</span>
      {isExpanded || isMobile ? (
        <>
          <span className="ml-3 flex-1">{item.title}</span>
          {hasSubItems && (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          )}
        </>
      ) : (
        <span className="text-sm font-medium ml-1">{item.shortTitle}</span>
      )}
    </>
  );

  return (
    <div>
      {renderLink(content, !hasSubItems ? item.path : null)}

      {/* Submenu */}
      {hasSubItems && (isExpanded || isMobile) && isOpen && (
        <div>
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              to={subItem.path}
              onClick={() => isMobile && onMobileClose && onMobileClose()}
              className={`flex items-center px-4 py-2 text-sm transition-colors rounded-lg ${
                location.pathname === subItem.path
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={location.pathname === subItem.path ? 'text-blue-500' : 'text-gray-500'}>
                {subItem.icon}
              </span>
              <span className="ml-2">{subItem.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ role, isExpanded, onToggle }) => {
  const [openMenus, setOpenMenus] = useState(new Set(['Dashboard']));
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = (title) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobile}
        />
      )}

      <div
        className={`
          relative bg-white shadow-lg transition-all duration-300 ease-in-out z-40
          
          /* Mobile: Fixed overlay sidebar */
          lg:relative fixed top-0 left-0 h-screen
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-auto
          
          /* Desktop: Collapsible sidebar */
          ${isExpanded ? 'lg:w-64' : 'lg:w-16'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <h2 className={`font-bold text-gray-800 ${!isExpanded && 'lg:hidden'}`}>
            Menu
          </h2>
        </div>

        {/* Menu Items */}
        <nav className="mt-4 pb-4 overflow-y-auto max-h-screen">
          {menuItemsByRole[role]?.map((item, index) => (
            <MenuItem
              key={index}
              item={item}
              isExpanded={isExpanded}
              isOpen={openMenus.has(item.title)}
              toggleOpen={() => toggleMenu(item.title)}
              isMobile={true}
              onMobileClose={closeMobile}
            />
          ))}
        </nav>

        {/* Desktop Toggle Button - chỉ hiện trên desktop */}
        <button
          onClick={onToggle}
          className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <div
            className={`transform transition-transform duration-300 ${
              isExpanded ? 'rotate-0' : 'rotate-180'
            }`}
          >
            {'❯'}
          </div>
        </button> 
      </div>
    </>
  );
};

// Demo component để test
const SidebarDemo = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentRole, setCurrentRole] = useState('admin');

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        role={currentRole} 
        isExpanded={isExpanded} 
        onToggle={() => setIsExpanded(!isExpanded)} 
      />
      
      <div className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Sidebar Responsive</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Chọn Role:</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(menuItemsByRole).map((role) => (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentRole === role
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tính năng:</h2>
            <ul className="space-y-2 text-gray-700">
              <li>📱 Mobile: Sidebar overlay với nút hamburger</li>
              <li>💻 Desktop: Sidebar thu gọn/mở rộng như cũ</li>
              <li>🎯 Giữ nguyên toàn bộ logic và nội dung gốc</li>
              <li>✨ Chỉ thêm CSS responsive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDemo;