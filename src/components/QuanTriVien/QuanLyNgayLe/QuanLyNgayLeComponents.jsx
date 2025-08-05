import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, DatePicker,
  message, Popconfirm, Typography, Alert, Spin, Card
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ngayleService } from '../../../services/Admin/ngayleService'; // Import the actual service

const { Title } = Typography;
const { Search } = Input;

// Configuration
const FORM_RULES = {
  ngay: [
    { required: true, message: 'Vui lòng chọn ngày lễ' }
  ],
  soNgayNghi: [
    { required: true, message: 'Vui lòng nhập số ngày nghỉ' },
    { type: 'number', min: 1, message: 'Số ngày nghỉ phải lớn hơn 0' }
  ]
};

// Utility functions
const filterData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter(item => 
    item.tenNgayLe?.toLowerCase().includes(lowerSearch) ||
    dayjs(item.ngay).format('DD/MM/YYYY').includes(searchText)
  );
};

const formatDate = (dateString) => {
  return dayjs(dateString).format('DD/MM/YYYY');
};

const getHolidayName = (dateString) => {
  // Auto-generate holiday names based on common Vietnamese holidays
  const month = dayjs(dateString).month() + 1;
  const day = dayjs(dateString).date();
  
  if (month === 1 && day === 1) return 'Tết Dương lịch';
  if (month === 4 && day === 30) return 'Ngày Giải phóng miền Nam';
  if (month === 5 && day === 1) return 'Ngày Quốc tế Lao động';
  if (month === 9 && day === 2) return 'Quốc khánh';
  return 'Ngày lễ';
};

const createTableColumns = (onEdit, onDelete) => [
  {
    title: 'Ngày lễ',
    dataIndex: 'ngay',
    width: '25%',
    sorter: (a, b) => dayjs(a.ngay).unix() - dayjs(b.ngay).unix(),
    render: (text) => (
      <span className="flex items-center gap-2">
        <CalendarOutlined className="text-blue-500" />
        {formatDate(text)}
      </span>
    ),
  },
  {
    title: 'Tên ngày lễ',
    dataIndex: 'tenNgayLe',
    width: '35%',
    sorter: (a, b) => (a.tenNgayLe || '').localeCompare(b.tenNgayLe || ''),
    render: (text, record) => text || getHolidayName(record.ngay),
  },
  {
    title: 'Số ngày nghỉ',
    dataIndex: 'soNgayNghi',
    width: '15%',
    sorter: (a, b) => a.soNgayNghi - b.soNgayNghi,
    render: (text) => (
      <span className="font-semibold text-green-600">
        {text} ngày
      </span>
    ),
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: '25%',
    render: (_, record) => (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => onEdit(record)}
          className="w-full sm:w-auto"
          size="small"
        >
          <span className="hidden sm:inline">Sửa</span>
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa ngày lễ này?"
          description="Hành động này không thể hoàn tác."
          onConfirm={() => onDelete(record.ngay)}
        >
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            className="w-full sm:w-auto"
            size="small"
          >
            <span className="hidden sm:inline">Xóa</span>
          </Button>
        </Popconfirm>
      </div>
    ),
  },
];

// Mobile Card Component for responsive
const MobileCard = ({ record, onEdit, onDelete }) => (
  <Card 
    size="small" 
    className="mb-3 shadow-sm border-l-4 border-l-blue-500"
    bodyStyle={{ padding: '12px' }}
  >
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Ngày:</span>
        <span className="font-semibold flex items-center gap-1">
          <CalendarOutlined className="text-blue-500" />
          {formatDate(record.ngay)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Tên ngày lễ:</span>
        <span className="font-medium text-right flex-1 ml-2">
          {record.tenNgayLe || getHolidayName(record.ngay)}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Số ngày nghỉ:</span>
        <span className="font-semibold text-green-600">{record.soNgayNghi} ngày</span>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={() => onEdit(record)}
          size="small"
          className="flex-1"
        >
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.ngay)}
        >
          <Button 
            type="primary" 
            danger
            icon={<DeleteOutlined />}
            size="small"
            className="flex-1"
          >
            Xóa
          </Button>
        </Popconfirm>
      </div>
    </div>
  </Card>
);

const SearchBar = ({ value, onChange }) => (
  <div className="mb-4">
    <Search
      placeholder="Tìm theo tên ngày lễ hoặc ngày (dd/mm/yyyy)"
      value={value}
      onSearch={onChange}
      onChange={(e) => onChange(e.target.value)}
      allowClear
      enterButton={<SearchOutlined />}
      className="w-full max-w-md"
    />
  </div>
);

const Header = ({ onCreateClick, totalCount }) => (
  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
    <div>
      <Title level={2} className="!mb-0 text-lg sm:text-xl md:text-2xl">
        Quản lý Ngày lễ
      </Title>
      <p className="text-gray-600 text-sm mt-1">
        Tổng cộng: {totalCount} ngày lễ
      </p>
    </div>
    <Button 
      type="primary" 
      icon={<PlusOutlined />} 
      onClick={onCreateClick}
      className="w-full sm:w-auto"
      size="large"
    >
      <span className="sm:inline">Thêm Ngày lễ Mới</span>
    </Button>
  </div>
);

const ErrorAlert = ({ error }) => {
  if (!error) return null;
  return (
    <Alert
      message="Lỗi"
      description={error}
      type="error"
      showIcon
      className="mb-4"
    />
  );
};

const NgayLeForm = ({ form, editingNgay }) => (
  <Form form={form} layout="vertical">
    <Form.Item name="ngay" label="Ngày lễ" rules={FORM_RULES.ngay}>
      <DatePicker 
        className="w-full"
        format="DD/MM/YYYY"
        placeholder="Chọn ngày lễ"
        disabled={!!editingNgay}
      />
    </Form.Item>
    <Form.Item name="soNgayNghi" label="Số ngày nghỉ" rules={FORM_RULES.soNgayNghi}>
      <InputNumber 
        className="w-full" 
        min={1}
        max={30}
        placeholder="Nhập số ngày nghỉ"
      />
    </Form.Item>
  </Form>
);

const NgayLeModal = ({ visible, title, onOk, onCancel, form, editingNgay }) => (
  <Modal
    title={title}
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    width="90%"
    style={{ maxWidth: '600px' }}
    className="!top-4 sm:!top-20"
  >
    <NgayLeForm form={form} editingNgay={editingNgay} />
  </Modal>
);

// Main Component
export const QuanLyNgayLeComponents = () => {
  // State management
  const [ngayLes, setNgayLes] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNgay, setEditingNgay] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [form] = Form.useForm();

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data fetching using actual ngayleService
  const fetchNgayLes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ngayleService.getAllNgayLe();
      const data = response.data || response; // Handle different response structures
      
      // Sort by date
      const sortedData = data.sort((a, b) => dayjs(a.ngay).unix() - dayjs(b.ngay).unix());
      setNgayLes(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
    //   console.error('Error fetching ngay le:', error);
      setError('Không thể tải danh sách ngày lễ. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách ngày lễ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgayLes();
  }, []);

  // Event handlers
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = filterData(ngayLes, value);
    setFilteredData(filtered);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingNgay(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ngay: dayjs(record.ngay),
      soNgayNghi: record.soNgayNghi
    });
    setEditingNgay(record.ngay);
    setModalVisible(true);
  };

  const handleDelete = async (ngay) => {
    try {
      await ngayleService.deleteNgayLe(ngay);
      message.success('Xóa ngày lễ thành công');
      fetchNgayLes();
    } catch (error) {
      console.error('Error deleting ngay le:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Không thể xóa ngày lễ';
      message.error(errorMessage);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        ngay: values.ngay.format('YYYY-MM-DD')
      };
      
      if (editingNgay) {
        // For update, only send soNgayNghi as per controller expectation
        await ngayleService.updateNgayLe(editingNgay, { 
          soNgayNghi: formattedValues.soNgayNghi 
        });
        message.success('Cập nhật ngày lễ thành công');
      } else {
        await ngayleService.createNgayLe(formattedValues);
        message.success('Thêm ngày lễ mới thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchNgayLes();
    } catch (error) {
      console.error('Error saving ngay le:', error);
      
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin nhập vào');
      } else {
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Có lỗi xảy ra';
        message.error(errorMessage);
      }
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // Table configuration
  const columns = createTableColumns(handleEdit, handleDelete);
  const modalTitle = editingNgay ? 'Cập nhật Ngày lễ' : 'Thêm Ngày lễ Mới';

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-hidden bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <Header onCreateClick={handleCreate} totalCount={filteredData.length} />
        <SearchBar value={searchText} onChange={handleSearch} />
        <ErrorAlert error={error} />
        
        <Spin spinning={loading}>
          {isMobile ? (
            // Mobile view with cards
            <div className="space-y-3">
              {filteredData.length === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarOutlined className="text-4xl mb-2" />
                  <p>Không có ngày lễ nào</p>
                </div>
              ) : (
                filteredData.map(record => (
                  <MobileCard 
                    key={record.ngay}
                    record={record}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          ) : (
            // Desktop view with table
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="ngay"
                pagination={false}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarOutlined className="text-4xl mb-2" />
                      <p>Không có ngày lễ nào</p>
                    </div>
                  )
                }}
              />
            </div>
          )}
        </Spin>

        <NgayLeModal
          visible={modalVisible}
          title={modalTitle}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          form={form}
          editingNgay={editingNgay}
        />
      </div>
    </div>
  );
};