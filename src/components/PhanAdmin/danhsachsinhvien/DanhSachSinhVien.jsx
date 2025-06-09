import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button, Popconfirm, message, Modal, Form, DatePicker, Radio, Upload, Avatar, Select } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons';
import { studentService } from '../../../services/PhanAdmin/studentService.js';
import { lopService } from '../../../services/PhanAdmin/lopService.js';
import moment from 'moment';

export const DanhSachSinhVien = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [form] = Form.useForm();
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sorter: {
      field: 'maSv',
      order: 'ascend'
    },
    search: ''
  });

  // Fetch classes for dropdown
  const fetchClasses = async () => {
    try {
      const response = await lopService.getLopsKhongPhanTrang();
      setClasses(response);
    } catch (error) {
      message.error('Lỗi khi tải danh sách lớp');
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { pagination, sorter, search } = tableParams;
      const response = await studentService.getStudents(
        pagination.current - 1,
        pagination.pageSize,
        sorter.field,
        sorter.order === 'ascend' ? 'asc' : 'desc',
        search
      );
      
      setStudents(response.content);
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: response.totalElements
        }
      });
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

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      ...tableParams,
      pagination,
      sorter: {
        field: sorter.field || 'maSv',
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
    setEditingStudent(record);
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
      
      if (editingStudent) {
        // Validate and transform data for update
        const updateData = {
          tenSv: values.tenSv.trim(),
          ngaySinh: values.ngaySinh.format('YYYY-MM-DD'),
          phai: values.phai,
          diaChi: values.diaChi.trim(),
          sdt: values.sdt.trim(),
          email: values.email.trim(),
          maLop: values.maLop
        };

        if (values.avatar && values.avatar.length > 0) {
          updateData.avatar = values.avatar;
        }

        await studentService.updateStudent(editingStudent.maSv, updateData);
        message.success('Cập nhật sinh viên thành công');
      } else {
        const createData = {
          ...values,
          ngaySinh: values.ngaySinh.format('YYYY-MM-DD')
        };
        await studentService.createStudent(createData);
        message.success('Thêm sinh viên mới thành công');
      }
      setModalVisible(false);
      fetchStudents();
    } catch (error) {
      console.error('Error in handleModalOk:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.errorFields) {
        error.errorFields.forEach(field => {
          message.error(field.errors[0]);
        });
      } else {
        message.error('Có lỗi xảy ra khi xử lý yêu cầu');
      }
    }
  };

  const handleDelete = async (maSv) => {
    try {
      await studentService.deleteStudent(maSv);
      message.success('Xóa sinh viên thành công');
      fetchStudents();
    } catch (error) {
      message.error('Lỗi khi xóa sinh viên');
      console.error('Error deleting student:', error);
    }
  };

  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'maSv',
      sorter: true,
      width: '10%'
    },
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      width: '8%',
      render: (avatar, record) => (
        <Avatar 
          src={avatar} 
          icon={<UserOutlined />}
          alt={`Avatar của ${record.tenSv}`}
        />
      )
    },
    {
      title: 'Họ và tên',
      dataIndex: 'tenSv',
      sorter: true,
      width: '15%'
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'ngaySinh',
      sorter: true,
      width: '10%',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Giới tính',
      dataIndex: 'phai',
      width: '8%',
      render: (phai) => phai === 1 ? 'Nam' : 'Nữ'
    },
    {
      title: 'Lớp',
      dataIndex: 'tenLop',
      width: '10%'
    },
    {
      title: 'Khoa',
      dataIndex: 'tenKhoa',
      width: '15%'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '15%'
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
            title="Bạn có chắc chắn muốn xóa sinh viên này?"
            onConfirm={() => handleDelete(record.maSv)}
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
        <h2 className="text-2xl font-semibold">Danh sách Sinh viên</h2>
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
            Thêm Sinh viên
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="maSv"
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={editingStudent ? "Cập nhật Sinh viên" : "Thêm Sinh viên mới"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {!editingStudent && (
            <Form.Item
              name="maSv"
              label="Mã sinh viên"
              rules={[
                { required: true, message: 'Mã sinh viên không được để trống' },
                { max: 10, message: 'Mã sinh viên không được vượt quá 10 ký tự' }
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            name="tenSv"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Tên sinh viên không được để trống' },
              { max: 150, message: 'Tên sinh viên không được vượt quá 150 ký tự' },
              { whitespace: true, message: 'Tên sinh viên không được chỉ chứa khoảng trắng' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="ngaySinh"
            label="Ngày sinh"
            rules={[
              { required: true, message: 'Ngày sinh không được để trống' },
              {
                validator: (_, value) => {
                  if (value && value.isAfter(moment())) {
                    return Promise.reject('Ngày sinh phải là ngày trong quá khứ');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="phai"
            label="Giới tính"
            rules={[
              { required: true, message: 'Giới tính không được để trống' }
            ]}
          >
            <Radio.Group>
              <Radio value={1}>Nam</Radio>
              <Radio value={0}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="maLop"
            label="Lớp"
            rules={[
              { required: true, message: 'Lớp không được để trống' }
            ]}
          >
            <Select
              placeholder="Chọn lớp"
              showSearch
              optionFilterProp="children"
            >
              {classes.map(lop => (
                <Select.Option key={lop.maLop} value={lop.maLop}>
                  {lop.tenLop} - {lop.tenKhoa}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="diaChi"
            label="Địa chỉ"
            rules={[
              { required: true, message: 'Địa chỉ không được để trống' },
              { max: 300, message: 'Địa chỉ không được vượt quá 300 ký tự' },
              { whitespace: true, message: 'Địa chỉ không được chỉ chứa khoảng trắng' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="sdt"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Số điện thoại không được để trống' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email không được để trống' },
              { type: 'email', message: 'Email không hợp lệ' },
              { max: 50, message: 'Email không được vượt quá 50 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="Avatar"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
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

          {!editingStudent && (
            <Form.Item
              name="createAccount"
              valuePropName="checked"
              initialValue={true}
            >
              <Radio.Group>
                <Radio value={true}>Tạo tài khoản</Radio>
                <Radio value={false}>Không tạo tài khoản</Radio>
              </Radio.Group>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};