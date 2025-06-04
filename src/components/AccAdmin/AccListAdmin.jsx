import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button, Popconfirm, message, Modal, Form, Avatar, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import moment from 'moment';

const ListAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form] = Form.useForm();
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sorter: {
      field: 'id',
      order: 'ascend'
    },
    search: ''
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { pagination, sorter, search } = tableParams;
      const data = await adminService.getAdmins(
        pagination.current - 1,
        pagination.pageSize,
        sorter.field,
        sorter.order === 'ascend' ? 'asc' : 'desc',
        search
      );
      setAdmins(data.content);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: data.totalElements
        }
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách quản trị viên');
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [JSON.stringify(tableParams)]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      ...tableParams,
      pagination,
      sorter: {
        field: sorter.field || 'id',
        order: sorter.order || 'ascend'
      }
    });
  };

  const handleSearch = (value) => {
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1
      },
      search: value
    });
  };

  const showModal = (record = null) => {
    setEditingAdmin(record);
    if (record) {
      form.setFieldsValue({
        username: record.username,
        email: record.email,
        fullName: record.fullName,
        role: record.role,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      
      // Append text fields
      Object.keys(values).forEach(key => {
        if (key !== 'avatar') {
          formData.append(key, values[key]);
        }
      });

      // Append avatar if exists
      if (values.avatar && values.avatar[0]) {
        formData.append('avatar', values.avatar[0].originFileObj);
      }

      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.id, formData);
        message.success('Cập nhật quản trị viên thành công');
      } else {
        await adminService.createAdmin(formData);
        message.success('Thêm quản trị viên mới thành công');
      }
      setModalVisible(false);
      fetchAdmins();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteAdmin(id);
      message.success('Xóa quản trị viên thành công');
      fetchAdmins();
    } catch (error) {
      message.error('Lỗi khi xóa quản trị viên');
      console.error('Error deleting admin:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: true,
      width: '5%'
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      width: '8%',
      render: (avatar, record) => (
        <Avatar 
          src={avatar} 
          icon={<UserOutlined />}
          alt={`Avatar của ${record.fullName}`}
        />
      )
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      sorter: true,
      width: '15%'
    },
    {
      title: 'Username',
      dataIndex: 'username',
      sorter: true,
      width: '15%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
      width: '20%'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: '10%'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      sorter: true,
      width: '12%',
      render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      sorter: true,
      width: '12%',
      render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    {
      title: 'Thao tác',
      width: '8%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa quản trị viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tài Khoản Quản Trị Viên</h2>
        <Space>
          <Input.Search
            placeholder="Tìm kiếm..."
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm Quản trị viên
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={admins}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={editingAdmin ? "Cập nhật Quản trị viên" : "Thêm Quản trị viên mới"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Vui lòng nhập username' },
              { min: 3, message: 'Username phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          {!editingAdmin && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[
              { required: true, message: 'Vui lòng chọn vai trò' }
            ]}
            initialValue="ADMIN"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="Avatar"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="avatar"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListAdmin; 