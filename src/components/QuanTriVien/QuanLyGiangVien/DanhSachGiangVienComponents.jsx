import React, { useState, useEffect } from 'react';
import {
  Table, Input, Space, Button, Popconfirm, message, Modal, Form,
  DatePicker, Radio, Upload, Avatar, Progress, List, Typography
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined,
  UploadOutlined, EyeOutlined, SearchOutlined, DownloadOutlined,
  ImportOutlined, InboxOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { teacherService } from '../../../services/Admin/teacherService.js';
import { ChiTietGiangVienComponents } from './ChiTietGiangVienComponents.jsx';

export const DanhSachGiangVienComponents = () => {
  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getListGiaoVien();
      setTeachers(data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Search functionality
  const filteredData = teachers.filter((teacher) =>
    teacher.maGv?.toLowerCase().includes(searchText) ||
    teacher.tenGv?.toLowerCase().includes(searchText) ||
    teacher.email?.toLowerCase().includes(searchText)
  );

  // Add Modal handlers
  const showAddModal = () => {
    addForm.resetFields();
    setAddModalVisible(true);
  };

  const handleAddModalOk = async () => {
    try {
      const values = await addForm.validateFields();
      const formattedData = {
        ...values,
        tenGv: values.tenGv.trim(),
        diaChi: values.diaChi.trim(),
        sdt: values.sdt.trim(),
        email: values.email.trim(),
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD')
      };

      await teacherService.createTeacher(formattedData);
      message.success('Thêm giáo viên mới thành công');
      setAddModalVisible(false);
      fetchTeachers();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi thêm giáo viên');
    }
  };

  const handleAddModalCancel = () => {
    setAddModalVisible(false);
    addForm.resetFields();
  };

  // Edit Modal handlers
  const showEditModal = (record) => {
    setEditingTeacher(record);
    editForm.setFieldsValue({
      ...record,
      ngaySinh: moment(record.ngaySinh)
    });
    setEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      const formattedData = {
        ...values,
        tenGv: values.tenGv.trim(),
        diaChi: values.diaChi.trim(),
        sdt: values.sdt.trim(),
        email: values.email.trim(),
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD')
      };

      await teacherService.updateTeacher(editingTeacher.maGv, formattedData);
      message.success('Cập nhật giáo viên thành công');
      setEditModalVisible(false);
      fetchTeachers();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi cập nhật giáo viên');
    }
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    setEditingTeacher(null);
    editForm.resetFields();
  };

  // Delete handler
  const handleDelete = async (maGv) => {
    try {
      await teacherService.deleteTeacher(maGv);
      message.success('Xóa giáo viên thành công');
      fetchTeachers();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi xóa giáo viên');
    }
  };

  // Details handler
  const showDetails = (record) => {
    setSelectedTeacher(record);
    setDetailsVisible(true);
  };

  // Table configuration
  const columns = [
    {
      title: 'Mã GV',
      dataIndex: 'maGv',
      width: '10%'
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      width: '8%',
      render: (avatar) => <Avatar src={avatar} icon={<UserOutlined />} />
    },
    {
      title: 'Họ và tên',
      dataIndex: 'tenGv',
      width: '18%'
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'ngaySinh',
      width: '12%',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Giới tính',
      dataIndex: 'phai',
      width: '8%',
      render: (phai) => phai === 1 ? 'Nam' : 'Nữ'
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'diaChi',
      width: '15%'
    },
    {
      title: 'SĐT',
      dataIndex: 'sdt',
      width: '12%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '18%'
    },
    {
      title: 'Thao tác',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showDetails(record)}
            title="Xem chi tiết"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xác nhận xóa giáo viên?"
            onConfirm={() => handleDelete(record.maGv)}
          >
            <Button danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Common form fields (for both add and edit)
  const getFormFields = (isEdit = false) => [
    // Mã giáo viên chỉ hiển thị khi thêm mới
    !isEdit && {
      name: 'maGv',
      label: 'Mã giáo viên',
      rules: [
        { required: true, message: 'Vui lòng nhập mã giáo viên' },
        { pattern: /^[A-Za-z0-9]+$/, message: 'Mã giáo viên chỉ chứa chữ và số' }
      ],
      component: <Input placeholder="Nhập mã giáo viên" maxLength={20} />
    },
    {
      name: 'tenGv',
      label: 'Họ và tên',
      rules: [
        { required: true, message: 'Vui lòng nhập họ tên' },
        { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
      ],
      component: <Input placeholder="Nhập họ và tên" maxLength={100} />
    },
    {
      name: 'ngaySinh',
      label: 'Ngày sinh',
      rules: [{ required: true, message: 'Vui lòng chọn ngày sinh' }],
      component: (
        <DatePicker 
          format="DD/MM/YYYY" 
          style={{ width: '100%' }} 
          placeholder="Chọn ngày sinh"
          
        />
      )
    },
    {
      name: 'phai',
      label: 'Giới tính',
      rules: [{ required: true, message: 'Vui lòng chọn giới tính' }],
      component: (
        <Radio.Group>
          <Radio value={1}>Nam</Radio>
          <Radio value={0}>Nữ</Radio>
        </Radio.Group>
      )
    },
    {
      name: 'diaChi',
      label: 'Địa chỉ',
      rules: [{ required: true, message: 'Vui lòng nhập địa chỉ' }],
      component: <Input.TextArea placeholder="Nhập địa chỉ" rows={2} maxLength={200} />
    },
    {
      name: 'sdt',
      label: 'Số điện thoại',
      rules: [
        { required: true, message: 'Vui lòng nhập số điện thoại' },
        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' }
      ],
      component: <Input placeholder="Nhập số điện thoại" maxLength={11} />
    },
    {
      name: 'email',
      label: 'Email',
      rules: [
        { required: true, message: 'Vui lòng nhập email' },
        { type: 'email', message: 'Email không hợp lệ' }
      ],
      component: <Input placeholder="Nhập email" maxLength={100} />
    },
    {
      name: 'avatar',
      label: 'Avatar',
      valuePropName: 'fileList',
      component: (
        <Upload 
          listType="picture" 
          beforeUpload={() => false} 
          maxCount={1}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      )
    }
  ].filter(Boolean);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Danh sách Giáo viên</h2>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã GV, họ tên, email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value.toLowerCase())}
            allowClear
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            Thêm Giáo viên
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="maGv"
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giáo viên`
        }}
        loading={loading}
        scroll={{ x: 1200 }}
      />

      {/* Add Teacher Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <PlusOutlined className="mr-2" />
            Thêm Giáo viên mới
          </div>
        }
        open={addModalVisible}
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
        width={600}
        destroyOnClose
        okText="Thêm"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={addForm} layout="vertical">
          {getFormFields(false).map((field, index) => (
            <Form.Item
              key={`add-${index}`}
              name={field.name}
              label={field.label}
              rules={field.rules}
              valuePropName={field.valuePropName}
            >
              {field.component}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2" />
            Chỉnh sửa Giáo viên - {editingTeacher?.maGv}
          </div>
        }
        open={editModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        width={600}
        destroyOnClose
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical">
          {/* Hiển thị mã giáo viên nhưng không cho chỉnh sửa */}
          <Form.Item label="Mã giáo viên">
            <Input value={editingTeacher?.maGv} disabled />
          </Form.Item>
          
          {getFormFields(true).map((field, index) => (
            <Form.Item
              key={`edit-${index}`}
              name={field.name}
              label={field.label}
              rules={field.rules}
              valuePropName={field.valuePropName}
            >
              {field.component}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* Details Modal */}
      <ChiTietGiangVienComponents
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        lecturer={selectedTeacher}
      />
    </div>
  );
};