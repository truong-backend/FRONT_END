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
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

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

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  const filteredData = teachers.filter((teacher) =>
    teacher.maGv?.toLowerCase().includes(searchText) ||
    teacher.tenGv?.toLowerCase().includes(searchText) ||
    teacher.email?.toLowerCase().includes(searchText)
  );

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
      const formatted = {
        ...values,
        tenGv: values.tenGv.trim(),
        diaChi: values.diaChi.trim(),
        sdt: values.sdt.trim(),
        email: values.email.trim(),
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD')
      };

      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.maGv, formatted);
        message.success('Cập nhật giáo viên thành công');
      } else {
        await teacherService.createTeacher(formatted);
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
      render: (avatar, record) => (
        <Avatar src={avatar} icon={<UserOutlined />} />
      )
    },
    {
      title: 'Họ và tên',
      dataIndex: 'tenGv',
      width: '15%'
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
      render: (phai) => (phai === 1 ? 'Nam' : 'Nữ')
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'diaChi',
      width: '15%'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'sdt',
      width: '12%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '15%'
    },
    {
      title: 'Thao tác',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDetails(record)} />
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Xác nhận xóa giáo viên?"
            onConfirm={() => handleDelete(record.maGv)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Danh sách Giáo viên</h2>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm theo mã GV, họ tên, email"
            value={searchText}
            onChange={handleSearch}
            allowClear
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Thêm Giáo viên
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="maGv"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal
        title={editingTeacher ? 'Chỉnh sửa Giáo viên' : 'Thêm Giáo viên'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          {!editingTeacher && (
            <Form.Item
              name="maGv"
              label="Mã giáo viên"
              rules={[{ required: true }, { min: 3 }]}
            >
              <Input />
            </Form.Item>
          )}
          <Form.Item name="tenGv" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ngaySinh" label="Ngày sinh" rules={[{ required: true }]}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="phai" label="Giới tính" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={1}>Nam</Radio>
              <Radio value={0}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sdt" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="Avatar" valuePropName="fileList">
            <Upload listType="picture" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <ChiTietGiangVienComponents
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        lecturer={selectedTeacher}
      />
    </div>
  );
};
