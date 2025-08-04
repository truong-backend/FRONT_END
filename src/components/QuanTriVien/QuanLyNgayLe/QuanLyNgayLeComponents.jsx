import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, 
  message, Popconfirm, Typography, Alert, Spin, Card
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined 
} from '@ant-design/icons';

import { monHocService } from '../../../services/Admin/monHocService.js';

const { Title } = Typography;
const { Search } = Input;

// Configuration
const PAGE_SIZE = 10;
const FORM_RULES = {
  maMh: [
    { required: true, message: 'Vui lòng nhập mả môn học' },
    { max: 20, message: 'Mã môn học không được vượt quá 20 ký tự' }
  ],
  tenMh: [
    { required: true, message: 'Vui lòng nhập tên môn học' },
    { max: 50, message: 'Tên môn học không được vượt quá 50 ký tự' }
  ],
  soTiet: [
    { required: true, message: 'Vui lòng nhập số tiết' },
    { type: 'number', min: 1, message: 'Số tiết phải lớn hơn 0' }
  ]
};

// Utility functions
const filterData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter(item => 
    item.tenMh.toLowerCase().includes(lowerSearch) ||
    item.maMh.toLowerCase().includes(lowerSearch)
  );
};

const createTableColumns = (onEdit, onDelete) => [
  {
    title: 'Mã môn học',
    dataIndex: 'maMh',
    width: '20%',
    sorter: (a, b) => a.maMh.localeCompare(b.maMh),
  },
  {
    title: 'Tên môn học',
    dataIndex: 'tenMh',
    width: '40%',
    sorter: (a, b) => a.tenMh.localeCompare(b.tenMh),
  },
  {
    title: 'Số tiết',
    dataIndex: 'soTiet',
    width: '15%',
    sorter: (a, b) => a.soTiet - b.soTiet,
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
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.maMh)}
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
    className="mb-3 shadow-sm"
    bodyStyle={{ padding: '12px' }}
  >
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Mã MH:</span>
        <span className="font-semibold">{record.maMh}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Tên MH:</span>
        <span className="font-medium text-right flex-1 ml-2">{record.tenMh}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Số tiết:</span>
        <span className="font-semibold">{record.soTiet}</span>
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
          onConfirm={() => onDelete(record.maMh)}
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

const SearchBar = ({ onChange }) => (
  <div className="mb-4">
    <Search
      placeholder="Tìm theo mã hoặc tên môn học"
      onSearch={onChange}
      onChange={(e) => onChange(e.target.value)}
      allowClear
      enterButton={<SearchOutlined />}
      className="w-full max-w-md"
    />
  </div>
);

const Header = ({ onCreateClick }) => (
  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
    <Title level={2} className="!mb-0 text-lg sm:text-xl md:text-2xl">
      Quản lý Môn học
    </Title>
    <Button 
      type="primary" 
      icon={<PlusOutlined />} 
      onClick={onCreateClick}
      className="w-full sm:w-auto"
    >
      <span className="sm:inline">Thêm Môn học Mới</span>
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

const MonHocForm = ({ form, editingMaMh }) => (
  <Form form={form} layout="vertical">
    {!editingMaMh && (
      <Form.Item name="maMh" label="Mã môn học" rules={FORM_RULES.maMh}>
        <Input />
      </Form.Item>
    )}
    <Form.Item name="tenMh" label="Tên môn học" rules={FORM_RULES.tenMh}>
      <Input />
    </Form.Item>
    <Form.Item name="soTiet" label="Số tiết" rules={FORM_RULES.soTiet}>
      <InputNumber className="w-full" />
    </Form.Item>
  </Form>
);

const MonHocModal = ({ visible, title, onOk, onCancel, form, editingMaMh }) => (
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
    <MonHocForm form={form} editingMaMh={editingMaMh} />
  </Modal>
);

// Main Component
export const QuanLyNgayLeComponents = () => {
  // State management
  const [monHocs, setMonHocs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaMh, setEditingMaMh] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Data fetching
  const fetchMonHocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await monHocService.getAllMonHocs();
      setMonHocs(data);
      setFilteredData(data);
    } catch (error) {
      setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonHocs();
  }, []);

  // Event handlers
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = filterData(monHocs, value);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaMh(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingMaMh(record.maMh);
    setModalVisible(true);
  };

  const handleDelete = async (maMh) => {
    try {
      await monHocService.deleteMonHoc(maMh);
      message.success('Xóa môn học thành công');
      fetchMonHocs();
    } catch (error) {
      message.error(error.response?.data || 'Không thể xóa môn học');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMaMh) {
        await monHocService.updateMonHoc(editingMaMh, values);
        message.success('Cập nhật môn học thành công');
      } else {
        await monHocService.createMonHoc(values);
        message.success('Thêm môn học mới thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchMonHocs();
    } catch (error) {
      message.error(error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // Table configuration
  const columns = createTableColumns(handleEdit, handleDelete);
  const modalTitle = editingMaMh ? 'Cập nhật Môn học' : 'Thêm Môn học Mới';

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-hidden">
      <Header onCreateClick={handleCreate} />
      <SearchBar value={searchText} onChange={handleSearch} />
      <ErrorAlert error={error} />
      
      <Spin spinning={loading}>
        {isMobile ? (
          // Mobile view with cards
          <div className="space-y-3">
            {filteredData
              .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              .map(record => (
                <MobileCard 
                  key={record.maMh}
                  record={record}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            }
            {filteredData.length > PAGE_SIZE && (
              <div className="flex justify-center pt-4">
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(filteredData.length / PAGE_SIZE) }, (_, i) => (
                    <Button
                      key={i + 1}
                      type={currentPage === i + 1 ? "primary" : "default"}
                      size="small"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Desktop view with table
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="maMh"
              pagination={{
                pageSize: PAGE_SIZE,
                current: currentPage,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} mục`,
              }}
              scroll={{ x: 800 }}
            />
          </div>
        )}
      </Spin>

      <MonHocModal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        editingMaMh={editingMaMh}
      />
    </div>
  );
};