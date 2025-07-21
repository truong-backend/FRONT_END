import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, 
  message, Popconfirm, Typography, Alert, Spin
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, DownloadOutlined 
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';
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
      <Space size="middle">
        <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.maMh)}
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];



// Components
const SearchBar = ({ value, onChange }) => (
  <Search
    placeholder="Tìm theo mã hoặc tên môn học"
    onSearch={onChange}
    onChange={(e) => onChange(e.target.value)}
    value={value}
    allowClear
    enterButton={<SearchOutlined />}
    style={{ marginBottom: '16px', width: 400 }}
  />
);

const Header = ({ onCreateClick }) => (
  <div style={{ 
    marginBottom: '16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  }}>
    <Title level={2}>Quản lý Môn học</Title>
    <Space>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
        Thêm Môn học Mới
      </Button>
    </Space>
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
      style={{ marginBottom: '16px' }}
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
      <InputNumber style={{ width: '100%' }} />
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
    width={600}
  >
    <MonHocForm form={form} editingMaMh={editingMaMh} />
  </Modal>
);

// Main Component
export const DanhSachMonHocComponents = () => {
  // State management
  const [monHocs, setMonHocs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaMh, setEditingMaMh] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm();

  // Data fetching
  const fetchMonHocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await monHocService.getAllMonHocs();
      setMonHocs(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching monhocs:', error);
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
    <div style={{ padding: '24px' }}>
      <Header onCreateClick={handleCreate} />
      <SearchBar value={searchText} onChange={handleSearch} />
      <ErrorAlert error={error} />
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="maMh"
          pagination={{
            pageSize: PAGE_SIZE,
            current: currentPage,
            onChange: setCurrentPage,
          }}
        />
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