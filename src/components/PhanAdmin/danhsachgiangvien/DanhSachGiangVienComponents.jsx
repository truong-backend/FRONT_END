import React, { useState, useEffect } from 'react';
import {
  Table, Input, Space, Button, Popconfirm, message, Modal, Form,
  DatePicker, Radio, Upload, Avatar
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, UserOutlined,
  UploadOutlined, EyeOutlined, SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { teacherService } from '../../../services/PhanAdmin/teacherService.js';
import { ChiTietGiangVienComponents } from './ChiTietGiangVienComponents.jsx';

export const DanhSachGiangVienComponents = () => {
  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Data fetching
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

  // Modal handlers
  const showModal = (record = null) => {
    setEditingTeacher(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        ngaySinh: moment(record.ngaySinh)
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedData = {
        ...values,
        tenGv: values.tenGv.trim(),
        diaChi: values.diaChi.trim(),
        sdt: values.sdt.trim(),
        email: values.email.trim(),
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD')
      };

      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.maGv, formattedData);
        message.success('Cập nhật giáo viên thành công');
      } else {
        await teacherService.createTeacher(formattedData);
        message.success('Thêm giáo viên mới thành công');
      }

      setModalVisible(false);
      fetchTeachers();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu giáo viên');
    }
  };

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
            onClick={() => showModal(record)}
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

  // Form fields configuration
  const formFields = [
    !editingTeacher && {
      name: 'maGv',
      label: 'Mã giáo viên',
      rules: [{ required: true, message: 'Vui lòng nhập mã giáo viên' }],
      component: <Input placeholder="Nhập mã giáo viên" />
    },
    {
      name: 'tenGv',
      label: 'Họ và tên',
      rules: [{ required: true, message: 'Vui lòng nhập họ tên' }],
      component: <Input placeholder="Nhập họ và tên" />
    },
    {
      name: 'ngaySinh',
      label: 'Ngày sinh',
      rules: [{ required: true, message: 'Vui lòng chọn ngày sinh' }],
      component: <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
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
      component: <Input placeholder="Nhập địa chỉ" />
    },
    {
      name: 'sdt',
      label: 'Số điện thoại',
      rules: [{ required: true, message: 'Vui lòng nhập số điện thoại' }],
      component: <Input placeholder="Nhập số điện thoại" />
    },
    {
      name: 'email',
      label: 'Email',
      rules: [
        { required: true, message: 'Vui lòng nhập email' },
        { type: 'email', message: 'Email không hợp lệ' }
      ],
      component: <Input placeholder="Nhập email" />
    },
    {
      name: 'avatar',
      label: 'Avatar',
      valuePropName: 'fileList',
      component: (
        <Upload listType="picture" beforeUpload={() => false} maxCount={1}>
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
            onClick={() => showModal()}
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
        pagination={{ pageSize: 10, showSizeChanger: true }}
        loading={loading}
        scroll={{ x: 1200 }}
      />

      {/* Form Modal */}
      <Modal
        title={editingTeacher ? 'Chỉnh sửa Giáo viên' : 'Thêm Giáo viên'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {formFields.map((field, index) => (
            <Form.Item
              key={index}
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