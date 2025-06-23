import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Popconfirm, message, Modal, Form, Switch, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { userService } from '../../../services/PhanAdmin/userService.js';
import moment from 'moment';

export const DanhSachTaiKhoanSinhVienComponents = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    sorter: { field: 'id', order: 'ascend' },
    search: ''
  });

  // Data fetching
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { pagination, sorter, search } = tableParams;
      const data = await userService.getUsersByRole(
        'STUDENT',
        pagination.current - 1,
        pagination.pageSize,
        sorter.field,
        sorter.order === 'ascend' ? 'asc' : 'desc',
        search
      );
      
      setStudents(data.content);
      setTableParams(prev => ({
        ...prev,
        pagination: { ...prev.pagination, total: data.totalElements }
      }));
    } catch (error) {
      message.error('Lỗi khi tải danh sách sinh viên');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [JSON.stringify(tableParams)]);

  // Table handlers
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
    setTableParams(prev => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      search: value
    }));
  };

  // Modal handlers
  const openModal = (student = null) => {
    setEditingStudent(student);
    if (student) {
      form.setFieldsValue({
        username: student.username,
        email: student.email,
        fullName: student.fullName,
        isActive: student.isActive,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingStudent(null);
    form.resetFields();
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, role: 'STUDENT' };

      if (editingStudent) {
        await userService.updateUser(editingStudent.id, payload);
        message.success('Cập nhật sinh viên thành công');
      } else {
        await userService.createUser(payload);
        message.success('Thêm sinh viên mới thành công');
      }

      closeModal();
      fetchStudents();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      message.success('Xóa sinh viên thành công');
      fetchStudents();
    } catch (error) {
      message.error('Lỗi khi xóa sinh viên');
      console.error('Error deleting student:', error);
    }
  };

  // Status change handler
  const handleStatusChange = async (id, isActive) => {
    try {
      await userService.updateUser(id, { isActive });
      message.success(`${isActive ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`);
      fetchStudents();
    } catch (error) {
      message.error('Lỗi khi thay đổi trạng thái tài khoản');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      sorter: true,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      sorter: true,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      width: 120,
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 120,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record.id, checked)}
          size="small"
        />
      )
    },
    {
      title: 'Email xác thực',
      dataIndex: 'emailVerifiedAt',
      width: 120,
      render: (date) => (
        <Tag color={date ? 'success' : 'error'}>
          {date ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 140,
      sorter: true,
      render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    {
      title: 'Thao tác',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sinh viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              type="primary" 
              danger 
              size="small"
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tài Khoản Sinh Viên</h2>
        <div className="flex gap-3">
          <Input.Search
            placeholder="Tìm kiếm sinh viên..."
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Thêm Sinh viên
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        pagination={{
          ...tableParams.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} sinh viên`
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      {/* Modal */}
      <Modal
        title={editingStudent ? "Cập nhật Sinh viên" : "Thêm Sinh viên mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        width={600}
        okText={editingStudent ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Vui lòng nhập username' },
              { min: 3, message: 'Username phải có ít nhất 3 ký tự' }
            ]}
          >
            <Input placeholder="Nhập username" />
          </Form.Item>

          {!editingStudent && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Trạng thái tài khoản"
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
