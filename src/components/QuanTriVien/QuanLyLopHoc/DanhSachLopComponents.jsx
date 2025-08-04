import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, message,
  Popconfirm, Select, Typography, Alert, Spin
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined
} from '@ant-design/icons';

import { khoaService } from '../../../services/Admin/khoaService.js';
import { lopService } from '../../../services/Admin/lopService.js';

const { Option } = Select;
const { Title } = Typography;
const { Search } = Input;

const PAGE_SIZE = 10;

const FORM_RULES = {
  maLop: [
    { required: true, message: 'Vui lòng nhập mã lớp' },
    { max: 20, message: 'Mã lớp không được vượt quá 20 ký tự' }
  ],
  tenLop: [
    { required: true, message: 'Vui lòng nhập tên lớp' },
    { max: 50, message: 'Tên lớp không được vượt quá 50 ký tự' }
  ],
  maKhoa: [{ required: true, message: 'Vui lòng chọn khoa' }],
  gvcn: [
    { required: true, message: 'Vui lòng nhập tên GVCN' },
    { max: 50, message: 'Tên GVCN không được vượt quá 50 ký tự' }
  ],
  sdtGvcn: [
    { required: true, message: 'Vui lòng nhập số điện thoại GVCN' },
    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
  ],
};

// Hàm lọc dữ liệu dựa trên searchText và selectedKhoa
const filterData = (data, searchText, selectedKhoa) => {
  let result = data;
  if (selectedKhoa) {
    result = result.filter(item => item.maKhoa === selectedKhoa);
  }
  if (searchText) {
    const lower = searchText.toLowerCase();
    result = result.filter(item =>
      item.maLop.toLowerCase().includes(lower) || item.tenLop.toLowerCase().includes(lower)
    );
  }
  return result;
};

const createTableColumns = (onEdit, onDelete) => [
  {
    title: 'Mã lớp',
    dataIndex: 'maLop',
    sorter: (a, b) => a.maLop.localeCompare(b.maLop),
    width: '20%',
  },
  {
    title: 'Tên lớp',
    dataIndex: 'tenLop',
    sorter: (a, b) => a.tenLop.localeCompare(b.tenLop),
    width: '30%',
  },
  {
    title: 'Khoa',
    dataIndex: 'tenKhoa',
    width: '20%',
  },
  {
    title: 'GVCN',
    dataIndex: 'gvcn',
    width: '15%',
  },
  {
    title: 'SĐT GVCN',
    dataIndex: 'sdtGvcn',
    width: '15%',
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: '15%',
    render: (_, record) => (
      <Space size="middle">
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
        >
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.maLop)}
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

const Header = ({ onCreateClick }) => (
  <div style={{
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <Title level={2}>Quản lý Lớp</Title>
    <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
      Thêm Lớp Mới
    </Button>
  </div>
);

const SearchBar = ({ khoas, selectedKhoa, onKhoaChange, searchText, onSearchChange }) => (
  <Space style={{ marginBottom: 16, width: '100%' }}>
    <Select
      allowClear
      placeholder="Chọn khoa"
      style={{ width: 200 }}
      value={selectedKhoa}
      onChange={onKhoaChange}
    >
      {khoas.map(khoa => (
        <Option key={khoa.maKhoa} value={khoa.maKhoa}>{khoa.tenKhoa}</Option>
      ))}
    </Select>

    <Search
      placeholder="Tìm mã hoặc tên lớp"
      allowClear
      enterButton={<SearchOutlined />}
      style={{ width: 300 }}
      value={searchText}
      onChange={e => onSearchChange(e.target.value)}
      onSearch={onSearchChange}
    />
  </Space>
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

const LopForm = ({ form, khoas, editingMaLop }) => (
  <Form form={form} layout="vertical">
    {!editingMaLop && (
      <Form.Item name="maLop" label="Mã lớp" rules={FORM_RULES.maLop}>
        <Input />
      </Form.Item>
    )}
    <Form.Item name="tenLop" label="Tên lớp" rules={FORM_RULES.tenLop}>
      <Input />
    </Form.Item>
    <Form.Item name="maKhoa" label="Khoa" rules={FORM_RULES.maKhoa}>
      <Select placeholder="Chọn khoa">
        {khoas.map(khoa => (
          <Option key={khoa.maKhoa} value={khoa.maKhoa}>
            {khoa.tenKhoa}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item name="gvcn" label="GVCN" rules={FORM_RULES.gvcn}>
      <Input />
    </Form.Item>
    <Form.Item name="sdtGvcn" label="SĐT GVCN" rules={FORM_RULES.sdtGvcn}>
      <Input />
    </Form.Item>
  </Form>
);

const LopModal = ({ visible, title, onOk, onCancel, form, khoas, editingMaLop }) => (
  <Modal
    title={title}
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    width={600}
  >
    <LopForm form={form} khoas={khoas} editingMaLop={editingMaLop} />
  </Modal>
);

export const DanhSachLopComponents = () => {
  const [allLops, setAllLops] = useState([]);
  const [filteredLops, setFilteredLops] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaLop, setEditingMaLop] = useState(null);

  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [lopData, khoaData] = await Promise.all([
          lopService.getLopsKhongPhanTrang(),
          khoaService.getKhoas(),
        ]);
        setAllLops(lopData);
        setKhoas(khoaData);
        setFilteredLops(lopData);
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = filterData(allLops, searchText, selectedKhoa);
    setFilteredLops(filtered);
    setCurrentPage(1);
  }, [allLops, searchText, selectedKhoa]);

  // Handlers
  const handleSearchChange = (value) => {
    setSearchText(value);
  };

  const handleKhoaChange = (value) => {
    setSelectedKhoa(value);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaLop(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingMaLop(record.maLop);
    setModalVisible(true);
  };

  const handleDelete = async (maLop) => {
    try {
      await lopService.deleteLop(maLop);
      message.success('Xóa lớp thành công');
      // Xóa khỏi allLops luôn để cập nhật giao diện ngay
      setAllLops(prev => prev.filter(item => item.maLop !== maLop));
    } catch (err) {
      message.error(err.response?.data || 'Không thể xóa lớp');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingMaLop) {
        await lopService.updateLop(editingMaLop, values);
        message.success('Cập nhật lớp thành công');
      } else {
        await lopService.createLop(values);
        message.success('Thêm lớp mới thành công');
      }
      setModalVisible(false);
      form.resetFields();

      // Tải lại toàn bộ dữ liệu mới nhất
      const lopData = await lopService.getLopsKhongPhanTrang();
      setAllLops(lopData);
    } catch (err) {
      message.error(err.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const columns = createTableColumns(handleEdit, handleDelete);

  return (
    <div style={{ padding: 24 }}>
      <Header onCreateClick={handleCreate} />

      <SearchBar
        khoas={khoas}
        selectedKhoa={selectedKhoa}
        onKhoaChange={handleKhoaChange}
        searchText={searchText}
        onSearchChange={handleSearchChange}
      />

      <ErrorAlert error={error} />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredLops}
          rowKey="maLop"
          pagination={{
            pageSize: PAGE_SIZE,
            current: currentPage,
            total: filteredLops.length,
            onChange: page => setCurrentPage(page),
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
        />
      </Spin>

      <LopModal
        visible={modalVisible}
        title={editingMaLop ? 'Cập nhật Lớp' : 'Thêm Lớp Mới'}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        khoas={khoas}
        editingMaLop={editingMaLop}
      />
    </div>
  );
};
