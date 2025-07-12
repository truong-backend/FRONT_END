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
  QrCodeIcon,
  UserCheckIcon,
  UserIcon,
} from 'lucide-react';

const createAccountManageMenu = () => ({
  title: 'Quản Lý Tài Khoản',
  shortTitle: 'TaKh',
  icon: <UserCog2 size={20} />,
  subItems: [
    { title: 'Tài Khoản Quản Trị', icon: <UserCog size={18} />, path: '/admin/account-account' },
    { title: 'Tài Khoản Giảng Viên', icon: <Presentation size={18} />, path: '/admin/teacher-account' },
    { title: 'Tài Khoản Sinh Viên', icon: <GraduationCap size={18} />, path: '/admin/student-account' }
  ]
});

// const createScheduleMenu = () => ({
//   title: 'Quản Lý TKB',
//   shortTitle: 'TKB',
//   icon: <CalendarDays size={20} />,
//   subItems: [
//     // { title: 'Quản lý thời khóa biểu', icon: <CalendarRange size={18} />, path: '/admin/schedule' },

//     { title: 'Quản lý Lich GD', icon: <Calendar size={18} />, path: '/admin/calendar' },
//   ]
// });

const menuItemsByRole = {
  admin: [
    { title: 'Trang Chủ', shortTitle: 'TrCh', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    createAccountManageMenu(),
    // createScheduleMenu(),
    { title: 'Quản Lý Điểm Danh', shortTitle: 'DD', icon: <ClipboardCheck size={20} />, path: '/admin/attendance' },
    { title: 'Quản Lý Lịch GD', shortTitle: 'LGd', icon: <Presentation size={20} />, path: '/admin/calendar' },
    // { title: 'Quản Lý Lịch Học', shortTitle: 'LH', icon: <Calendar size={20} />, path: '/admin/lichhoc' },
    { title: 'Quản Lý Giáo Viên', shortTitle: 'GiVi', icon: <Presentation size={20} />, path: '/admin/teachers-list' },
    { title: 'Quản Lý Sinh Viên', shortTitle: 'SV', icon: <GraduationCap size={20} />, path: '/admin/students-list' },
    { title: 'Quản Lý Lớp Học', shortTitle: 'LoHo', icon: <Users size={20} />, path: '/admin/lop' },
    { title: 'Quản Lý Khoa', shortTitle: 'Kh', icon: <Building size={20} />, path: '/admin/khoa' },
    { title: 'Quản Lý Môn Học', shortTitle: 'MoHo', icon: <Book size={20} />, path: '/admin/monhoc' },
    // { title: 'Xuất Báo Cáo', shortTitle: 'BC', icon: <FileText size={20} />, path: '/admin/reports' },
    // { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: <Settings size={20} />, path: '/admin/profile' }
  ],
  teacher: [
    { title: 'Trang Chủ', shortTitle: 'TC', icon: <FileText size={20} />, path: '/teacher/dashboard' },
    { title: 'Điểm Danh', shortTitle: 'DD', icon: <QrCodeIcon size={20} />, path: '/teacher/diemdanh' },
    { title: 'Kết Quả Điểm Danh', shortTitle: 'KQDD', icon: <UserCheckIcon size={20} />, path: '/teacher/kqdiemdanh' },
    { title: 'Lịch Giảng Dạy', shortTitle: 'LGD', icon: <Calendar size={20} />, path: '/teacher/lichgd' },
    { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: <UserIcon size={20} />, path: '/teacher/profile' },
  ],
  student: [
    { title: 'Trang Chủ', shortTitle: 'TC', icon: <BookOpen size={20} />, path: '/student/dashboard' },
    { title: 'Điểm Danh QR', shortTitle: 'ĐD', icon: <Calendar size={20} />, path: '/student/scan-qr' },
    { title: 'Thời Khóa Biểu', shortTitle: 'TKB', icon: <ClipboardList size={20} />, path: '/student/schedule' },
    { title: 'Lịch Học Hôm Nay', shortTitle: 'LH', icon: <Calendar size={20} />, path: '/student/calendar' },
    { title: 'Lịch Sử Điểm Danh', shortTitle: 'LSDD', icon: <MessageSquare size={20} />, path: '/student/attendance-history' },
    { title: 'QR Code', shortTitle: 'QR', icon: <QrCodeIcon size={20} />, path: '/student/qr' },
    { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: <MessageSquare size={20} />, path: '/student/profile' },
  ]
};

const MenuItem = ({ item, isExpanded, isOpen, toggleOpen }) => {
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = location.pathname === item.path || 
    (hasSubItems && item.subItems.some(subItem => location.pathname === subItem.path));

  const renderLink = (content, path) => {
    if (path) {
      return (
        <Link
          to={path}
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
      {isExpanded ? (
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
      {hasSubItems && isExpanded && isOpen && (
        <div className="ml-4 pl-4 border-l border-gray-200">
          {item.subItems.map((subItem, index) => (
            <Link
              key={index}
              to={subItem.path}
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

  return (
    <div
      className={`relative bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <h2 className={`font-bold text-gray-800 ${!isExpanded && 'hidden'}`}>
          Menu
        </h2>
      </div>

      {/* Menu Items */}
      <nav className="mt-4">
        {menuItemsByRole[role]?.map((item, index) => (
          <MenuItem
            key={index}
            item={item}
            isExpanded={isExpanded}
            isOpen={openMenus.has(item.title)}
            toggleOpen={() => toggleMenu(item.title)}
          />
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-300"
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
  );
};

export default Sidebar; 