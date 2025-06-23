import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Typography,
  Alert,
  Spin,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { monHocService } from '../../../services/PhanAdmin/monHocService.js';

const { Title } = Typography;
const { Search } = Input;

export const DanhSachMonHocComponents = () => {
  const [monHocs, setMonHocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMaMh, setEditingMaMh] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = monHocs.filter(
      (item) =>
        item.tenMh.toLowerCase().includes(value.toLowerCase()) ||
        item.maMh.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaMh(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      maMh: record.maMh,
      tenMh: record.tenMh,
      soTiet: record.soTiet,
    });
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

  const columns = [
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
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.maMh)}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Quản lý Môn học</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm Môn học Mới
        </Button>
      </div>

      <Search
        placeholder="Tìm theo mã hoặc tên môn học"
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        value={searchText}
        allowClear
        enterButton={<SearchOutlined />}
        style={{ marginBottom: '16px', width: 400 }}
      />

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="maMh"
          pagination={{
            pageSize: 10,
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Spin>

      <Modal
        title={editingMaMh ? 'Cập nhật Môn học' : 'Thêm Môn học Mới'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {!editingMaMh && (
            <Form.Item
              name="maMh"
              label="Mã môn học"
              rules={[
                { required: true, message: 'Vui lòng nhập mã môn học' },
                { max: 20, message: 'Mã môn học không được vượt quá 20 ký tự' }
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            name="tenMh"
            label="Tên môn học"
            rules={[
              { required: true, message: 'Vui lòng nhập tên môn học' },
              { max: 50, message: 'Tên môn học không được vượt quá 50 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="soTiet"
            label="Số tiết"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiết' },
              { type: 'number', min: 1, message: 'Số tiết phải lớn hơn 0' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
