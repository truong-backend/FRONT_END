import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button, Popconfirm, message, Modal, Form, Switch, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { userService } from '../../../services/PhanAdmin/userService.js';
import moment from 'moment';

export const DanhSachTaiKhoanGiangVienComponents = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
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

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { pagination, sorter, search } = tableParams;
      const data = await userService.getUsersByRole(
        'TEACHER',
        pagination.current - 1,
        pagination.pageSize,
        sorter.field,
        sorter.order === 'ascend' ? 'asc' : 'desc',
        search
      );
      setTeachers(data.content);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: data.totalElements
        }
      });
    } catch (error) {
      message.error('Lỗi khi tải danh sách giảng viên');
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [JSON.stringify(tableParams)]); // Re-fetch when params change

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
        current: 1 // Reset to first page
      },
      search: value
    });
  };

  const showModal = (record = null) => {
    setEditingTeacher(record);
    if (record) {
      form.setFieldsValue({
        username: record.username,
        email: record.email,
        fullName: record.fullName,
        isActive: record.isActive,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingTeacher) {
        await userService.updateUser(editingTeacher.id, {
          ...values,
          role: 'TEACHER'
        });
        message.success('Cập nhật giảng viên thành công');
      } else {
        await userService.createUser({
          ...values,
          role: 'TEACHER'
        });
        message.success('Thêm giảng viên mới thành công');
      }
      setModalVisible(false);
      fetchTeachers();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      message.success('Xóa giảng viên thành công');
      fetchTeachers();
    } catch (error) {
      message.error('Lỗi khi xóa giảng viên');
      console.error('Error deleting teacher:', error);
    }
  };

  const handleStatusChange = async (id, isActive) => {
    try {
      await userService.updateUser(id, { isActive });
      message.success(`${isActive ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`);
      fetchTeachers();
    } catch (error) {
      message.error('Lỗi khi thay đổi trạng thái tài khoản');
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
      title: 'Họ và tên',
      dataIndex: 'fullName',
      sorter: true,
      width: '15%'
    },
    {
      title: 'Username',
      dataIndex: 'username',
      sorter: true,
      width: '10%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
      width: '15%'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: '8%',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      )
    },
    {
      title: 'Email xác thực',
      dataIndex: 'emailVerifiedAt',
      width: '12%',
      render: (date) => (
        date ? (
          <Tag color="success">Đã xác thực</Tag>
        ) : (
          <Tag color="error">Chưa xác thực</Tag>
        )
      )
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
      width: '10%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa giảng viên này?"
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

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tài Khoản Giảng Viên</h2>
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
            Thêm Giảng viên
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={teachers}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={editingTeacher ? "Cập nhật Giảng viên" : "Thêm Giảng viên mới"}
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

          {!editingTeacher && (
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
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Khóa"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

