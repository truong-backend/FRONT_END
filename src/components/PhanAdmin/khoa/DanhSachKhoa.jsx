import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
  Alert,
  Spin,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { khoaService } from '../../../services/PhanAdmin/khoaService.js';

const { Title } = Typography;

export const DanhSachKhoa = () => {
  const [khoas, setKhoas] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMaKhoa, setEditingMaKhoa] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    sortField: 'maKhoa',
    sortOrder: 'ascend',
  });

  // Fetch danh sách khoa
  const fetchKhoas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await khoaService.getKhoas();
      setKhoas(data);
      setTotalElements(data.length);
    } catch (error) {
      console.error('Error fetching khoas:', error);
      setError('Không thể tải danh sách khoa. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách khoa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhoas();
  }, []);

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...newPagination,
      sortField: sorter.field || 'maKhoa',
      sortOrder: sorter.order || 'ascend',
    });
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaKhoa(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      maKhoa: record.maKhoa,
      tenKhoa: record.tenKhoa,
    });
    setEditingMaKhoa(record.maKhoa);
    setModalVisible(true);
  };

  const handleDelete = async (maKhoa) => {
    try {
      await khoaService.deleteKhoa(maKhoa);
      message.success('Xóa khoa thành công');
      fetchKhoas();
    } catch (error) {
      message.error(error.response?.data || 'Không thể xóa khoa');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMaKhoa) {
        await khoaService.updateKhoa(editingMaKhoa, values);
        message.success('Cập nhật khoa thành công');
      } else {
        await khoaService.createKhoa(values);
        message.success('Thêm khoa mới thành công');
      }
      setModalVisible(false);
      fetchKhoas();
    } catch (error) {
      message.error(error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Mã khoa',
      dataIndex: 'maKhoa',
      sorter: true,
      width: '30%',
    },
    {
      title: 'Tên khoa',
      dataIndex: 'tenKhoa',
      sorter: true,
      width: '50%',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '20%',
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
            onConfirm={() => handleDelete(record.maKhoa)}
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
        <Title level={2}>Quản lý Khoa</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Thêm Khoa Mới
        </Button>
      </div>

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
          dataSource={khoas}
          rowKey="maKhoa"
          pagination={{
            ...pagination,
            total: totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
        />
      </Spin>

      <Modal
        title={editingMaKhoa ? 'Cập nhật Khoa' : 'Thêm Khoa Mới'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {!editingMaKhoa && (
            <Form.Item
              name="maKhoa"
              label="Mã khoa"
              rules={[
                { required: true, message: 'Vui lòng nhập mã khoa' },
                { max: 50, message: 'Mã khoa không được vượt quá 50 ký tự' }
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            name="tenKhoa"
            label="Tên khoa"
            rules={[
              { required: true, message: 'Vui lòng nhập tên khoa' },
              { max: 255, message: 'Tên khoa không được vượt quá 255 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};