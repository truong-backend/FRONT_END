import React from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Input,
  Drawer,
  Card,
  IconButton,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  CubeTransparentIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

export function Sidebar() {
  const [open, setOpen] = React.useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(null);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const sidebarContent = (
    <Card
      color="transparent"
      shadow={false}
      className="h-[calc(100vh-2rem)] w-full overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-6 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border">
              <span className="text-sm font-bold">LOGO</span>
            </div>
            <Typography variant="h6" className="font-normal">
              Hệ thống điểm danh
            </Typography>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Input
            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            label="Tìm kiếm chức năng..."
            size="md"
            placeholder="Nhập từ khóa..."
            className="border"
            labelProps={{
              className: "text-sm",
            }}
            containerProps={{
              className: "min-w-0",
            }}
          />
        </div>
      </div>

      <div className="px-3">
        <List className="space-y-2">
          {/* Lịch học Accordion */}
          <Accordion
            open={open === 1}
            icon={
              <div className="flex items-center justify-center w-6 h-6 border">
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`h-3.5 w-3.5 ${
                    open === 1 ? "rotate-180" : ""
                  }`}
                />
              </div>
            }
          >
            <ListItem 
              className={`p-0 border ${
                open === 1 ? 'border-l-4' : ''
              }`}
              selected={open === 1}
            >
              <AccordionHeader
                onClick={() => handleOpen(1)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix className="mr-3">
                  <div className="p-2 border">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                </ListItemPrefix>
                <Typography className="mr-auto font-normal">
                  Lịch học
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0 space-y-1 ml-4">
                <ListItem 
                  onClick={() => handleItemClick('schedule')}
                  className={`pl-8 py-3 border-l cursor-pointer ${
                    activeItem === 'schedule' 
                      ? 'border-l-2' 
                      : ''
                  }`}
                >
                  <ListItemPrefix className="mr-3">
                    <div className="p-1.5 border">
                      <ClockIcon className="h-4 w-4" />
                    </div>
                  </ListItemPrefix>
                  <span className="text-sm">
                    Thời khóa biểu
                  </span>
                </ListItem>
                <ListItem 
                  onClick={() => handleItemClick('exam')}
                  className={`pl-8 py-3 border-l cursor-pointer ${
                    activeItem === 'exam' 
                      ? 'border-l-2' 
                      : ''
                  }`}
                >
                  <ListItemPrefix className="mr-3">
                    <div className="p-1.5 border">
                      <AcademicCapIcon className="h-4 w-4" />
                    </div>
                  </ListItemPrefix>
                  <span className="text-sm">
                    Lịch thi
                  </span>
                </ListItem>
                <ListItem 
                  onClick={() => handleItemClick('makeup')}
                  className={`pl-8 py-3 border-l cursor-pointer ${
                    activeItem === 'makeup' 
                      ? 'border-l-2' 
                      : ''
                  }`}
                >
                  <ListItemPrefix className="mr-3">
                    <div className="p-1.5 border">
                      <ClipboardDocumentCheckIcon className="h-4 w-4" />
                    </div>
                  </ListItemPrefix>
                  <span className="text-sm">
                    Lịch học bù
                  </span>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* Điểm danh Accordion */}
          <Accordion
            open={open === 2}
            icon={
              <div className="flex items-center justify-center w-6 h-6 border">
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`h-3.5 w-3.5 ${
                    open === 2 ? "rotate-180" : ""
                  }`}
                />
              </div>
            }
          >
            <ListItem 
              className={`p-0 border ${
                open === 2 ? 'border-l-4' : ''
              }`}
              selected={open === 2}
            >
              <AccordionHeader
                onClick={() => handleOpen(2)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix className="mr-3">
                  <div className="p-2 border">
                    <ShoppingBagIcon className="h-5 w-5" />
                  </div>
                </ListItemPrefix>
                <Typography className="mr-auto font-normal">
                  Điểm danh
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0 space-y-1 ml-4">
                <ListItem 
                  onClick={() => handleItemClick('attendance-today')}
                  className={`pl-8 py-3 border-l cursor-pointer ${
                    activeItem === 'attendance-today' 
                      ? 'border-l-2' 
                      : ''
                  }`}
                >
                  <ListItemPrefix className="mr-3">
                    <div className="p-1.5 border">
                      <ChartBarIcon className="h-4 w-4" />
                    </div>
                  </ListItemPrefix>
                  <span className="text-sm">
                    Điểm danh hôm nay
                  </span>
                </ListItem>
                <ListItem 
                  onClick={() => handleItemClick('attendance-history')}
                  className={`pl-8 py-3 border-l cursor-pointer ${
                    activeItem === 'attendance-history' 
                      ? 'border-l-2' 
                      : ''
                  }`}
                >
                  <ListItemPrefix className="mr-3">
                    <div className="p-1.5 border">
                      <ClipboardDocumentCheckIcon className="h-4 w-4" />
                    </div>
                  </ListItemPrefix>
                  <span className="text-sm">
                    Lịch sử điểm danh
                  </span>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* Divider */}
          <div className="my-4">
            <hr className="border-t" />
          </div>

          {/* Menu items */}
          <ListItem 
            onClick={() => handleItemClick('notifications')}
            className={`p-3 cursor-pointer border ${
              activeItem === 'notifications'
                ? 'border-l-4'
                : ''
            }`}
          >
            <ListItemPrefix className="mr-3">
              <div className="p-2 border">
                <BellIcon className="h-5 w-5" />
              </div>
            </ListItemPrefix>
            <span className="font-normal">
              Thông báo
            </span>
            <ListItemSuffix>
              <Chip
                value="14"
                size="sm"
                variant="outlined"
                className="text-xs min-w-[28px] h-6 flex items-center justify-center"
              />
            </ListItemSuffix>
          </ListItem>

          <ListItem 
            onClick={() => handleItemClick('profile')}
            className={`p-3 cursor-pointer border ${
              activeItem === 'profile'
                ? 'border-l-4'
                : ''
            }`}
          >
            <ListItemPrefix className="mr-3">
              <div className="p-2 border">
                <UserCircleIcon className="h-5 w-5" />
              </div>
            </ListItemPrefix>
            <span className="font-normal">
              Thông tin cá nhân
            </span>
          </ListItem>

          <ListItem 
            onClick={() => handleItemClick('settings')}
            className={`p-3 cursor-pointer border ${
              activeItem === 'settings'
                ? 'border-l-4'
                : ''
            }`}
          >
            <ListItemPrefix className="mr-3">
              <div className="p-2 border">
                <Cog6ToothIcon className="h-5 w-5" />
              </div>
            </ListItemPrefix>
            <span className="font-normal">
              Cài đặt
            </span>
          </ListItem>

          {/* Logout */}
          <div className="mt-6 pt-2">
            <ListItem 
              onClick={() => handleItemClick('logout')}
              className="p-3 cursor-pointer border-2"
            >
              <ListItemPrefix className="mr-3">
                <div className="p-2 border">
                  <PowerIcon className="h-5 w-5" />
                </div>
              </ListItemPrefix>
              <span className="font-normal">
                Đăng xuất
              </span>
            </ListItem>
          </div>
        </List>
      </div>
    </Card>
  );

  return (
    <>
      {/* Mobile burger menu button */}
      <div className="fixed top-4 left-4 z-50 block lg:hidden">
        <IconButton 
          variant="outlined" 
          size="lg" 
          onClick={openDrawer} 
          className="border"
        >
          <Bars3Icon className="h-6 w-6 stroke-2" />
        </IconButton>
      </div>

      {/* Mobile drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        className="lg:hidden p-0"
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-80 min-h-screen border-r fixed left-0 top-0 overflow-y-auto">
        {sidebarContent}
      </div>
    </>
  );
}