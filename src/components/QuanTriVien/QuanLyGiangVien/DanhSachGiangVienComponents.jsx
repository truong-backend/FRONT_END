import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, DatePicker, Radio, Upload,
  message, Popconfirm, Typography, Alert, Spin, Avatar, Descriptions
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  UserOutlined, UploadOutlined, EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { teacherService } from '../../../services/Admin/teacherService.js';

const { Title } = Typography;
const { Search } = Input;

// ==================== CONFIGURATION ====================
const PAGE_SIZE = 10;
const FORM_RULES = {
  maGv: [
    { required: true, message: 'Vui lòng nhập mã giáo viên' },
    { max: 20, message: 'Mã giáo viên không vượt quá 20 ký tự' }
  ],
  tenGv: [
    { required: true, message: 'Vui lòng nhập họ tên giáo viên' },
    { max: 100, message: 'Tên giáo viên không vượt quá 100 ký tự' }
  ],
  ngaySinh: [
    { required: true, message: 'Vui lòng chọn ngày sinh' }
  ],
  phai: [
    { required: true, message: 'Vui lòng chọn giới tính' }
  ],
  diaChi: [
    { required: true, message: 'Vui lòng nhập địa chỉ' }
  ],
  sdt: [
    { required: true, message: 'Vui lòng nhập số điện thoại' },
    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email' },
    { type: 'email', message: 'Email không hợp lệ' }
  ]
};

// ==================== UTILITY FUNCTIONS ====================
const filterData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter(item =>
    item.tenGv.toLowerCase().includes(lowerSearch) ||
    item.maGv.toLowerCase().includes(lowerSearch) ||
    item.email.toLowerCase().includes(lowerSearch)
  );
};

const createTableColumns = (onView, onEdit, onDelete) => [
  {
    title: 'Mã GV',
    dataIndex: 'maGv',
    width: '10%',
    sorter: (a, b) => a.maGv.localeCompare(b.maGv),
  },
  
  {
    title: 'Họ và tên',
    dataIndex: 'tenGv',
    width: '20%',
    sorter: (a, b) => a.tenGv.localeCompare(b.tenGv),
  },
  {
    title: 'Ngày sinh',
    dataIndex: 'ngaySinh',
    width: '12%',
    render: (date) => moment(date).format('DD/MM/YYYY'),
  },
  {
    title: 'Giới tính',
    dataIndex: 'phai',
    width: '8%',
    render: (phai) => phai === 1 ? 'Nam' : 'Nữ',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: '18%',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'sdt',
    width: '12%',
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: '22%',
    render: (_, record) => (
      <Space size="middle">
        <Button icon={<EyeOutlined />} onClick={() => onView(record)}>
          Xem
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.maGv)}
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

// ==================== UI COMPONENTS ====================
const SearchBar = ({ onChange }) => (
  <Search
    placeholder="Tìm theo mã GV, họ tên, email"
    onSearch={onChange}
    onChange={(e) => onChange(e.target.value)}
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
    <Title level={2}>Quản lý Giáo viên</Title>
    <Space>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
        Thêm Giáo viên
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

const TeacherForm = ({ form, editingMaGv }) => (
  <Form form={form} layout="vertical">
    {!editingMaGv && (
      <Form.Item name="maGv" label="Mã giáo viên" rules={FORM_RULES.maGv}>
        <Input />
      </Form.Item>
    )}
    <Form.Item name="tenGv" label="Họ và tên" rules={FORM_RULES.tenGv}>
      <Input />
    </Form.Item>
    <Form.Item name="ngaySinh" label="Ngày sinh" rules={FORM_RULES.ngaySinh}>
      <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
    </Form.Item>
    <Form.Item name="phai" label="Giới tính" rules={FORM_RULES.phai}>
      <Radio.Group>
        <Radio value={1}>Nam</Radio>
        <Radio value={0}>Nữ</Radio>
      </Radio.Group>
    </Form.Item>
    <Form.Item name="diaChi" label="Địa chỉ" rules={FORM_RULES.diaChi}>
      <Input.TextArea rows={2} />
    </Form.Item>
    <Form.Item name="sdt" label="Số điện thoại" rules={FORM_RULES.sdt}>
      <Input />
    </Form.Item>
    <Form.Item name="email" label="Email" rules={FORM_RULES.email}>
      <Input />
    </Form.Item>
   
  </Form>
);

const TeacherModal = ({ visible, title, onOk, onCancel, form, editingMaGv }) => (
  <Modal
    title={title}
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    width={600}
  >
    <TeacherForm form={form} editingMaGv={editingMaGv} />
  </Modal>
);

// ==================== DETAILS MODAL ====================
const TeacherDetailsModal = ({ visible, onClose, teacher }) => (
  <Modal
    title={`Chi tiết Giáo viên - ${teacher?.maGv}`}
    open={visible}
    onCancel={onClose}
    footer={null}
    width={600}
  >
    {teacher && (
      <Descriptions bordered column={1}>
        
        <Descriptions.Item label="Họ và tên">{teacher.tenGv}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{moment(teacher.ngaySinh).format('DD/MM/YYYY')}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">{teacher.phai === 1 ? 'Nam' : 'Nữ'}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{teacher.diaChi}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{teacher.sdt}</Descriptions.Item>
        <Descriptions.Item label="Email">{teacher.email}</Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

// ==================== MAIN COMPONENT ====================
export const DanhSachGiangVienComponents = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaGv, setEditingMaGv] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form] = Form.useForm();

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.getListGiaoVien();
      setTeachers(data);
      setFilteredData(data);
    } catch (error) {
      setError('Không thể tải danh sách giáo viên. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = filterData(teachers, value);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaGv(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      ngaySinh: moment(record.ngaySinh)
    });
    setEditingMaGv(record.maGv);
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedTeacher(record);
    setDetailsVisible(true);
  };

  const handleDelete = async (maGv) => {
    try {
      await teacherService.deleteTeacher(maGv);
      message.success('Xóa giáo viên thành công');
      fetchTeachers();
    } catch (error) {
      message.error(error.response?.data || 'Không thể xóa giáo viên');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedData = {
        ...values,
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD')
      };
      if (editingMaGv) {
        await teacherService.updateTeacher(editingMaGv, formattedData);
        message.success('Cập nhật giáo viên thành công');
      } else {
        await teacherService.createTeacher(formattedData);
        message.success('Thêm giáo viên mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      fetchTeachers();
    } catch (error) {
      message.error(error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const columns = createTableColumns(handleView, handleEdit, handleDelete);
  const modalTitle = editingMaGv ? 'Cập nhật Giáo viên' : 'Thêm Giáo viên Mới';

  return (
    <div style={{ padding: '24px' }}>
      <Header onCreateClick={handleCreate} />
      <SearchBar value={searchText} onChange={handleSearch} />
      <ErrorAlert error={error} />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="maGv"
          pagination={{
            pageSize: PAGE_SIZE,
            current: currentPage,
            onChange: setCurrentPage,
          }}
        />
      </Spin>

      <TeacherModal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        editingMaGv={editingMaGv}
      />

      <TeacherDetailsModal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        teacher={selectedTeacher}
      />
    </div>
  );
};
