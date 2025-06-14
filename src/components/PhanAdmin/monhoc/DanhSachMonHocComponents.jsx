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
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { monHocService } from '../../../services/PhanAdmin/monHocService.js';

const { Title } = Typography;

export const DanhSachMonHocComponents = () => {
  const [monHocs, setMonHocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMaMh, setEditingMaMh] = useState(null);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sorter: {
      field: 'maMh',
      order: 'ascend',
    },
  });

  // Fetch danh sách môn học
  const fetchMonHocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { pagination, sorter } = tableParams;
      const data = await monHocService.getMonHocs(
        pagination.current - 1,
        pagination.pageSize,
        sorter.field,
        sorter.order === 'ascend' ? 'asc' : 'desc'
      );
      
      setMonHocs(data.content);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: data.totalElements,
        },
      });
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
  }, [JSON.stringify(tableParams)]); // Re-fetch when params change

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      sorter: {
        field: sorter.field || 'maMh',
        order: sorter.order || 'ascend',
      },
    });
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
      fetchMonHocs(); // Refresh the list after deletion
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
      
      // Reset to first page when adding new item
      if (!editingMaMh) {
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            current: 1,
          },
        });
      } else {
        fetchMonHocs(); // Just refresh current page when editing
      }
    } catch (error) {
      message.error(error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Mã môn học',
      dataIndex: 'maMh',
      sorter: true,
      width: '25%',
    },
    {
      title: 'Tên môn học',
      dataIndex: 'tenMh',
      sorter: true,
      width: '45%',
    },
    {
      title: 'Số tiết',
      dataIndex: 'soTiet',
      sorter: true,
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Thêm Môn học Mới
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
          dataSource={monHocs}
          rowKey="maMh"
          pagination={tableParams.pagination}
          onChange={handleTableChange}
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