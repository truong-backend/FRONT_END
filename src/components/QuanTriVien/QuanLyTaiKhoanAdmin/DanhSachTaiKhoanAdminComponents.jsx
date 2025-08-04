import React, { useState, useEffect } from 'react';
import {
  Table, Input, Space, Button, Popconfirm, message, Modal, Form, Alert, Spin, Typography
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined
} from '@ant-design/icons';
import { adminService } from '../../../services/Admin/adminService.js';
import moment from 'moment';

const { Title } = Typography;
const { Search } = Input;

// Config
const PAGE_SIZE = 10;
const FORM_RULES = {
  username: [
    { required: true, message: 'Vui lòng nhập username' },
    { max: 50, message: 'Username không được vượt quá 50 ký tự' },
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu' },
    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
  ],
  fullName: [
    { required: true, message: 'Vui lòng nhập họ và tên' },
    { max: 100, message: 'Họ và tên không được vượt quá 100 ký tự' },
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email' },
    { type: 'email', message: 'Email không hợp lệ' },
  ],
};

// Utility
const filterData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter(item =>
    item.username?.toLowerCase().includes(lowerSearch) ||
    item.fullName?.toLowerCase().includes(lowerSearch) ||
    item.email?.toLowerCase().includes(lowerSearch)
  );
};

const createTableColumns = (onEdit, onDelete) => [
  {
    title: 'ID',
    dataIndex: 'id',
    width: '5%',
    sorter: (a, b) => a.id - b.id,
  },
  {
    title: 'Họ và tên',
    dataIndex: 'fullName',
    width: '20%',
    sorter: (a, b) => a.fullName?.localeCompare(b.fullName),
  },
  {
    title: 'Username',
    dataIndex: 'username',
    width: '15%',
    sorter: (a, b) => a.username?.localeCompare(b.username),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: '25%',
    sorter: (a, b) => a.email?.localeCompare(b.email),
  },
  {
    title: 'Vai trò',
    dataIndex: 'role',
    width: '10%',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    width: '12%',
    sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    render: date => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A',
  },
  {
    title: 'Cập nhật',
    dataIndex: 'updatedAt',
    width: '12%',
    sorter: (a, b) => moment(a.updatedAt).unix() - moment(b.updatedAt).unix(),
    render: date => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A',
  },
  {
    title: 'Thao tác',
    width: '10%',
    render: (_, record) => (
      <Space>
        <Button
          type="primary"
          icon={<EditOutlined />}
          size="small"
          onClick={() => onEdit(record)}
        >
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="primary" danger icon={<DeleteOutlined />} size="small">
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

// Components
const Header = ({ onCreateClick }) => (
  <div style={{
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <Title level={2}>Quản lý Tài khoản Admin</Title>
    <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
      Thêm Admin Mới
    </Button>
  </div>
);

const SearchBar = ({ value, onChange }) => (
  <Search
    placeholder="Tìm theo username, họ tên, email"
    value={value}
    onChange={e => onChange(e.target.value)}
    allowClear
    enterButton={<SearchOutlined />}
    style={{ marginBottom: 16, width: 400 }}
  />
);

const ErrorAlert = ({ error }) => {
  if (!error) return null;
  return (
    <Alert
      message="Lỗi"
      description={error}
      type="error"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
};

const AdminForm = ({ form, editingAdmin }) => (
  <Form form={form} layout="vertical">
    <Form.Item name="username" label="Username" rules={FORM_RULES.username}>
      <Input disabled={!!editingAdmin} />
    </Form.Item>
    {!editingAdmin && (
      <Form.Item name="password" label="Mật khẩu" rules={FORM_RULES.password}>
        <Input.Password />
      </Form.Item>
    )}
    <Form.Item name="fullName" label="Họ và tên" rules={FORM_RULES.fullName}>
      <Input />
    </Form.Item>
    <Form.Item name="email" label="Email" rules={FORM_RULES.email}>
      <Input />
    </Form.Item>
  </Form>
);

const AdminModal = ({ visible, title, onOk, onCancel, form, editingAdmin }) => (
  <Modal
    title={title}
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    width={600}
  >
    <AdminForm form={form} editingAdmin={editingAdmin} />
  </Modal>
);

// Main Component
export const DanhSachTaiKhoanAdminComponents = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm();

  // Fetch data
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAdminsKphanTrang();
      const list = data.content || data;
      setAdmins(list);
      setFilteredData(filterData(list, searchText));
    } catch (err) {
      setError('Không thể tải danh sách quản trị viên. Vui lòng thử lại.');
      message.error('Lỗi khi tải danh sách quản trị viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Search handler
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = filterData(admins, value);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Show modal (create or edit)
  const handleaddOrEdit = (record = null) => {
    if (record) {
      setEditingAdmin(record);
      form.setFieldsValue({
        username: record.username,
        fullName: record.fullName,
        email: record.email,
      });
    } else {
      setEditingAdmin(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Modal OK handler
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      values.role = 'admin'; // mặc định role admin

      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.id, values);
        message.success('Cập nhật quản trị viên thành công');
      } else {
        await adminService.createAdmin(values);
        message.success('Thêm quản trị viên mới thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchAdmins();
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingAdmin(null);
    form.resetFields();
  };

  // Delete handler
  const handleDelete = async (id) => {
    try {
      await adminService.deleteAdmin(id);
      message.success('Xóa quản trị viên thành công');
      fetchAdmins();
    } catch (err) {
      message.error('Lỗi khi xóa quản trị viên');
    }
  };

  // Columns
  const columns = createTableColumns(handleaddOrEdit, handleDelete);
  const modalTitle = editingAdmin ? 'Cập nhật Quản trị viên' : 'Thêm Quản trị viên mới';

  return (
    <div style={{ padding: 24 }}>
      <Header onCreateClick={() => handleaddOrEdit()} />
      <SearchBar value={searchText} onChange={handleSearch} />
      <ErrorAlert error={error} />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: PAGE_SIZE,
            current: currentPage,
            onChange: setCurrentPage,
          }}
        />
      </Spin>

      <AdminModal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        editingAdmin={editingAdmin}
      />
    </div>
  );
};
