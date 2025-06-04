import React, { useState } from 'react';
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
} from 'lucide-react';

const createAccountManageMenu = () => ({
  title: 'Quản Lý Tài Khoản',
  shortTitle: 'TK',
  icon: <UserCog2 size={20} />,
  subItems: [
    { title: 'Tài Khoản Quản Trị', icon: <UserCog size={18} /> },
    { title: 'Tài Khoản Giảng Viên', icon: <Presentation size={18} /> },
    { title: 'Tài Khoản Sinh Viên', icon: <GraduationCap size={18} /> }
  ]
});

const createScheduleMenu = () => ({
  title: 'Quản Lý TKB',
  shortTitle: 'TKB',
  icon: <CalendarDays size={20} />,
  subItems: [
    { title: 'Quản lý thời khóa biểu', icon: <CalendarRange size={18} /> },
    { title: 'Quản lý Lịch Học', icon: <Calendar size={18} /> },
  ]
});

const menuItemsByRole = {
  admin: [
    { title: 'Trang Chủ', shortTitle: 'TC', icon: <LayoutDashboard size={20} /> },
    createAccountManageMenu(),
    createScheduleMenu(),
    { title: 'Quản Lý Điểm Danh', shortTitle: 'DD', icon: <ClipboardCheck size={20} /> },
    { title: 'Quản Lý Giáo Viên', shortTitle: 'DD', icon: <ClipboardCheck size={20} /> },
    { title: 'Quản Lý Sinh Viên', shortTitle: 'DD', icon: <ClipboardCheck size={20} /> },
    { title: 'Quản Lý Lớp Học', shortTitle: 'LH', icon: <Users size={20} /> },
    { title: 'Quản Lý Khoa', shortTitle: 'KH', icon: <Building  size={20} /> },
    { title: 'Quản Lý Môn Học', shortTitle: 'MH', icon: <Book size={20} /> },
    { title: 'Xuất Báo Cáo', shortTitle: 'BC', icon: <FileText size={20} /> },
    { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: <Settings size={20} /> }
  ],
  teacher: [
    { title: 'Trang Chủ', shortTitle: 'TC', icon: <FileText size={20} /> },
    { title: 'Tạo Mã QR', shortTitle: 'QR', icon: <Calendar size={20} /> },
    { title: 'Danh Sách Điểm Danh', shortTitle: 'DSDD', icon: <Users size={20} /> },
    { title: 'Xuất Báo Cáo', shortTitle: 'BC', icon: <FileText size={20} /> },
    { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: <MessageSquare size={20} /> },
  ],
  student: [
    { title: 'Trang Chủ', shortTitle: 'TC', icon: <BookOpen size={20} /> },
    { title: 'Thời Khóa Biểu', shortTitle: 'TKB', icon: <ClipboardList size={20} /> },
    { title: 'Lịch Học', shortTitle: 'LH', icon: <Calendar size={20} /> },
    { title: 'Lịch Sử Điểm Danh', shortTitle: 'LSDD', icon: <MessageSquare size={20} /> },
    { title: 'QR Thông Tin Cá Nhân', shortTitle: 'QR', icon: <Settings size={20} /> },
    { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: <MessageSquare size={20} /> },
  ]
};

const MenuItem = ({ item, isExpanded, isOpen, toggleOpen }) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <div>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          if (hasSubItems) toggleOpen();
        }}
        className={`flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
          isOpen ? 'bg-gray-50' : ''
        }`}
      >
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
      </a>

      {/* Submenu */}
      {hasSubItems && isExpanded && isOpen && (
        <div className="ml-4 pl-4 border-l border-gray-200">
          {item.subItems.map((subItem, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors rounded-lg"
            >
              <span className="text-gray-500">{subItem.icon}</span>
              <span className="ml-2">{subItem.title}</span>
            </a>
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