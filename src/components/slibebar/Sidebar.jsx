import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, Settings,
  FileText, ClipboardList, MessageSquare, ChevronDown, UserCog, Presentation,
  UserCog2, ClipboardCheck, CalendarDays, CalendarRange, Building, Book,
  QrCodeIcon, UserCheckIcon, UserIcon
} from 'lucide-react';

// ===========================
// 🔧 Menu Configuration
// ===========================
const MENU_CONFIG = {
  admin: [
    {
      items: [
        { title: 'Trang Chủ', shortTitle: 'TrCh', icon: LayoutDashboard, path: '/admin/dashboard' }
      ]
    },
    {
      groupTitle: '👥 Quản lý người dùng',
      items: [
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
        { title: 'Quản Lý Sinh Viên', shortTitle: 'SV', icon: GraduationCap, path: '/admin/students-list' },
        { title: 'Quản Lý Giáo Viên', shortTitle: 'GiVi', icon: Presentation, path: '/admin/teachers-list' }
      ]
    },
    {
      groupTitle: '🎓 Quản lý đào tạo',
      items: [
        {
          title: 'Quản Lý TKB',
          shortTitle: 'TKB',
          icon: CalendarDays,
          subItems: [
            { title: 'Quản lý thời khóa biểu', icon: CalendarRange, path: '/admin/schedule' },
            { title: 'Quản lý Lich GD', icon: Calendar, path: '/admin/calendar' }
          ]
        },
        { title: 'Quản Lý Khoa', shortTitle: 'Kh', icon: Building, path: '/admin/khoa' },
        { title: 'Quản Lý Lớp Học', shortTitle: 'LoHo', icon: Users, path: '/admin/lop' },
        { title: 'Quản Lý Môn Học', shortTitle: 'MoHo', icon: Book, path: '/admin/monhoc' }
      ]
    }
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

// ===========================
// 🔧 Utility Functions
// ===========================
const isMenuItemActive = (item, currentPath) => {
  if (item.path === currentPath) return true;
  if (item.subItems) return item.subItems.some(sub => sub.path === currentPath);
  return false;
};

const getMenuItemStyles = (isActive, isHover = true) => {
  const base = 'flex items-center px-4 py-3 transition-colors';
  const active = 'text-blue-600 bg-blue-50 hover:bg-blue-100';
  const inactive = 'text-gray-700 hover:bg-gray-100';
  return `${base} ${isActive ? active : isHover ? inactive : 'text-gray-700'}`;
};

// ===========================
// 🧩 Reusable Components
// ===========================
const MenuIcon = ({ IconComponent, size = 20 }) => <IconComponent size={size} />;

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

const SubMenu = ({ subItems, currentPath, isExpanded }) =>
  isExpanded ? (
    <div className="ml-4 pl-4 border-l border-gray-200">
      {subItems.map((sub, idx) => {
        const isActive = currentPath === sub.path;
        return (
          <Link
            key={idx}
            to={sub.path}
            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
              isActive
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MenuIcon IconComponent={sub.icon} size={18} />
            <span className="ml-2">{sub.title}</span>
          </Link>
        );
      })}
    </div>
  ) : null;

const MenuItem = ({ item, isExpanded, isOpen, onToggle }) => {
  const location = useLocation();
  const hasSub = Boolean(item.subItems?.length);
  const isActive = isMenuItemActive(item, location.pathname);

  const handleClick = (e) => {
    if (hasSub) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div>
      {item.path && !hasSub ? (
        <Link to={item.path} className={getMenuItemStyles(isActive)}>
          <MenuContent item={item} isExpanded={isExpanded} hasSubItems={hasSub} isOpen={isOpen} />
        </Link>
      ) : (
        <div
          onClick={handleClick}
          className={`${getMenuItemStyles(isActive, false)} cursor-pointer hover:bg-gray-100 ${
            isOpen ? 'bg-gray-50' : ''
          }`}
        >
          <MenuContent item={item} isExpanded={isExpanded} hasSubItems={hasSub} isOpen={isOpen} />
        </div>
      )}
      {hasSub && isOpen && (
        <SubMenu subItems={item.subItems} currentPath={location.pathname} isExpanded={isExpanded} />
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
    <div className={`transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>❯</div>
  </button>
);

// ===========================
// 📦 Main Sidebar Component
// ===========================
const Sidebar = ({ role, isExpanded, onToggle }) => {
  const [openMenus, setOpenMenus] = useState(new Set());
  const menuItems = MENU_CONFIG[role] || [];

  const toggleMenu = (title) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      newSet.has(title) ? newSet.delete(title) : newSet.add(title);
      return newSet;
    });
  };

  return (
    <div className={`relative bg-white shadow-lg transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'}`}>
      {/* Header */}
      <div className="p-4 border-b">{isExpanded && <h2 className="font-bold text-gray-800">Menu</h2>}</div>

      {/* Navigation */}
      <nav className="mt-4">
        {menuItems.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`}>
            {isExpanded && group.groupTitle && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.groupTitle}
              </div>
            )}
            {group.items.map((item, itemIndex) => (
              <MenuItem
                key={`item-${groupIndex}-${itemIndex}`}
                item={item}
                isExpanded={isExpanded}
                isOpen={openMenus.has(item.title)}
                onToggle={() => toggleMenu(item.title)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <ToggleButton isExpanded={isExpanded} onToggle={onToggle} />
    </div>
  );
};

export default Sidebar;
