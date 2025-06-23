import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, Settings,
  FileText, ClipboardList, MessageSquare, ChevronDown, UserCog, Presentation,
  UserCog2, ClipboardCheck, CalendarDays, CalendarRange, Building, Book,
  QrCodeIcon, UserCheckIcon, UserIcon
} from 'lucide-react';

// Menu configuration
const MENU_CONFIG = {
  admin: [
    { 
      title: 'Trang Chủ', 
      shortTitle: 'TrCh', 
      icon: LayoutDashboard, 
      path: '/admin/dashboard' 
    },
    {
      title: 'Quản Lý Tài Khoản',
      shortTitle: 'TaKh',
      icon: UserCog2,
      subItems: [
        { title: 'Tài Khoản Quản Trị', icon: UserCog, path: '/admin/account-account' },
        { title: 'Tài Khoản Giảng Viên', icon: Presentation, path: '/admin/teacher-account' },
        { title: 'Tài Khoản Sinh Viên', icon: GraduationCap, path: '/admin/student-account' }
      ]
    },
    {
      title: 'Quản Lý TKB',
      shortTitle: 'TKB',
      icon: CalendarDays,
      subItems: [
        { title: 'Quản lý thời khóa biểu', icon: CalendarRange, path: '/admin/schedule' },
        { title: 'Quản lý Lich GD', icon: Calendar, path: '/admin/calendar' }
      ]
    },
    { title: 'Quản Lý Giáo Viên', shortTitle: 'GiVi', icon: Presentation, path: '/admin/teachers-list' },
    { title: 'Quản Lý Sinh Viên', shortTitle: 'SV', icon: GraduationCap, path: '/admin/students-list' },
    { title: 'Quản Lý Lớp Học', shortTitle: 'LoHo', icon: Users, path: '/admin/lop' },
    { title: 'Quản Lý Khoa', shortTitle: 'Kh', icon: Building, path: '/admin/khoa' },
    { title: 'Quản Lý Môn Học', shortTitle: 'MoHo', icon: Book, path: '/admin/monhoc' }
  ],
  teacher: [
    { title: 'Trang Chủ', shortTitle: 'TC', icon: FileText, path: '/teacher/dashboard' },
    { title: 'Điểm Danh', shortTitle: 'DD', icon: QrCodeIcon, path: '/teacher/diemdanh' },
    { title: 'Kết Quả Điểm Danh', shortTitle: 'KQDD', icon: UserCheckIcon, path: '/teacher/kqdiemdanh' },
    { title: 'Lịch Giảng Dạy', shortTitle: 'LGD', icon: Calendar, path: '/teacher/lichgd' },
    { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: UserIcon, path: '/teacher/profile' }
  ],
  student: [
    { title: 'Trang Chủ', shortTitle: 'TC', icon: BookOpen, path: '/student/dashboard' },
    { title: 'Điểm Danh QR', shortTitle: 'ĐD', icon: Calendar, path: '/student/scan-qr' },
    { title: 'Thời Khóa Biểu', shortTitle: 'TKB', icon: ClipboardList, path: '/student/schedule' },
    { title: 'Lịch Học Hôm Nay', shortTitle: 'LH', icon: Calendar, path: '/student/calendar' },
    { title: 'Lịch Sử Điểm Danh', shortTitle: 'LSDD', icon: MessageSquare, path: '/student/attendance-history' },
    { title: 'QR Thông Tin Cá Nhân', shortTitle: 'QR', icon: Settings, path: '/student/qr' },
    { title: 'Thông Tin Cá Nhân', shortTitle: 'TTCN', icon: MessageSquare, path: '/student/profile' }
  ]
};

// Utility functions
const isMenuItemActive = (item, currentPath) => {
  if (item.path === currentPath) return true;
  if (item.subItems) {
    return item.subItems.some(subItem => subItem.path === currentPath);
  }
  return false;
};

const getMenuItemStyles = (isActive, isHover = true) => {
  const baseStyles = 'flex items-center px-4 py-3 transition-colors';
  const activeStyles = 'text-blue-600 bg-blue-50 hover:bg-blue-100';
  const inactiveStyles = 'text-gray-700 hover:bg-gray-100';
  
  return `${baseStyles} ${isActive ? activeStyles : (isHover ? inactiveStyles : 'text-gray-700')}`;
};

// Components
const MenuIcon = ({ IconComponent, size = 20 }) => (
  <IconComponent size={size} />
);

const MenuContent = ({ item, isExpanded, hasSubItems, isOpen }) => (
  <>
    <MenuIcon IconComponent={item.icon} />
    {isExpanded ? (
      <>
        <span className="ml-3 flex-1">{item.title}</span>
        {hasSubItems && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </>
    ) : (
      <span className="text-sm font-medium ml-1">{item.shortTitle}</span>
    )}
  </>
);

const SubMenu = ({ subItems, currentPath, isExpanded }) => {
  if (!isExpanded) return null;
  
  return (
    <div className="ml-4 pl-4 border-l border-gray-200">
      {subItems.map((subItem, index) => {
        const isActive = currentPath === subItem.path;
        return (
          <Link
            key={index}
            to={subItem.path}
            className={`flex items-center px-4 py-2 text-sm transition-colors rounded-lg ${
              isActive 
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MenuIcon 
              IconComponent={subItem.icon} 
              size={18}
            />
            <span className="ml-2">{subItem.title}</span>
          </Link>
        );
      })}
    </div>
  );
};

const MenuItem = ({ item, isExpanded, isOpen, onToggle }) => {
  const location = useLocation();
  const hasSubItems = Boolean(item.subItems?.length);
  const isActive = isMenuItemActive(item, location.pathname);

  const handleClick = (e) => {
    if (hasSubItems) {
      e.preventDefault();
      onToggle();
    }
  };

  const content = (
    <MenuContent 
      item={item} 
      isExpanded={isExpanded} 
      hasSubItems={hasSubItems} 
      isOpen={isOpen} 
    />
  );

  return (
    <div>
      {item.path && !hasSubItems ? (
        <Link to={item.path} className={getMenuItemStyles(isActive)}>
          {content}
        </Link>
      ) : (
        <div
          onClick={handleClick}
          className={`${getMenuItemStyles(isActive, false)} cursor-pointer hover:bg-gray-100 ${
            isOpen ? 'bg-gray-50' : ''
          }`}
        >
          {content}
        </div>
      )}
      
      {hasSubItems && isOpen && (
        <SubMenu 
          subItems={item.subItems} 
          currentPath={location.pathname} 
          isExpanded={isExpanded} 
        />
      )}
    </div>
  );
};

const ToggleButton = ({ isExpanded, onToggle }) => (
  <button
    onClick={onToggle}
    className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-300"
    aria-label={isExpanded ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
  >
    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
      ❯
    </div>
  </button>
);

// Main Sidebar Component
const Sidebar = ({ role, isExpanded, onToggle }) => {
  const [openMenus, setOpenMenus] = useState(new Set());

  const toggleMenu = (title) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const menuItems = MENU_CONFIG[role] || [];

  return (
    <div className={`relative bg-white shadow-lg transition-all duration-300 ease-in-out ${
      isExpanded ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="p-4 border-b">
        {isExpanded && (
          <h2 className="font-bold text-gray-800">Menu</h2>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {menuItems.map((item, index) => (
          <MenuItem
            key={`${role}-${index}`}
            item={item}
            isExpanded={isExpanded}
            isOpen={openMenus.has(item.title)}
            onToggle={() => toggleMenu(item.title)}
          />
        ))}
      </nav>

      {/* Toggle Button */}
      <ToggleButton isExpanded={isExpanded} onToggle={onToggle} />
    </div>
  );
};

export default Sidebar;