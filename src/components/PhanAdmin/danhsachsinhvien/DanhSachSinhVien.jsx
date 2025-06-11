import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button, Popconfirm, message, Modal, Form, DatePicker, Radio, Upload, Avatar, Select } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, UserOutlined, UploadOutlined, ImportOutlined, DownloadOutlined } from '@ant-design/icons';
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
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const showImportModal = () => {
    setImportModalVisible(true);
    setSelectedFile(null);
  };

  const handleImportModalCancel = () => {
    setImportModalVisible(false);
    setSelectedFile(null);
  };

  const validateFile = (file) => {
    const isValidType = ['csv', 'xls', 'xlsx'].includes(file.name.split('.').pop().toLowerCase());
    if (!isValidType) {
      message.error('Chỉ hỗ trợ file CSV hoặc Excel (.xls, .xlsx)');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('File phải nhỏ hơn 2MB!');
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
    return Upload.LIST_IGNORE;
  };

  const handleImport = async () => {
    if (!selectedFile) {
      message.error('Vui lòng chọn file để import');
      return;
    }

    try {
      setImporting(true);
      const response = await studentService.importStudents(selectedFile);
      
      // Hiển thị thông báo thành công với chi tiết
      if (response === "Import thành công") {
        message.success('Import danh sách sinh viên thành công');
      } else {
        message.success(response || 'Import danh sách sinh viên thành công');
      }
      
      setImportModalVisible(false);
      fetchStudents();
    } catch (error) {
      // Xử lý các loại lỗi khác nhau
      if (error.response?.data) {
        message.error(`Lỗi: ${error.response.data}`);
      } else if (error.message) {
        message.error(`Lỗi: ${error.message}`);
      } else {
        message.error('Lỗi không xác định khi import danh sách sinh viên');
      }
      console.error('Import error:', error);
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await studentService.getImportTemplate();
      message.success('Tải file mẫu thành công');
    } catch (error) {
      message.error('Lỗi khi tải file mẫu');
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
            style={{ width: 200 }}
          />
          <Button 
            icon={<ImportOutlined />}
            onClick={showImportModal}
          >
            Import Excel/CSV
          </Button>
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

      {/* Import Modal */}
      <Modal
        title="Import Danh Sách Sinh Viên"
        open={importModalVisible}
        onCancel={handleImportModalCancel}
        footer={[
          <Button key="template" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            Tải file mẫu
          </Button>,
          <Button key="cancel" onClick={handleImportModalCancel}>
            Hủy
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={importing}
            onClick={handleImport}
            disabled={!selectedFile}
          >
            Import
          </Button>
        ]}
      >
        <div className="my-4">
          <p className="mb-4">Lưu ý:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Chỉ hỗ trợ file Excel (.xls, .xlsx) hoặc CSV</li>
            <li>Kích thước file tối đa 2MB</li>
            <li>Vui lòng sử dụng đúng format mẫu</li>
            <li>Các trường bắt buộc: Mã SV, Họ tên, Ngày sinh, Giới tính, Mã lớp</li>
            <li>Ngày sinh phải theo định dạng DD/MM/YYYY</li>
            <li>Giới tính: 1 (Nam) hoặc 0 (Nữ)</li>
            <li className="text-blue-600">Hệ thống sẽ tự động tạo tài khoản cho sinh viên với:</li>
            <ul className="list-circle pl-6">
              <li>Tên đăng nhập: Mã sinh viên</li>
              <li>Mật khẩu: Mã sinh viên</li>
              <li>Email: Email đã nhập</li>
            </ul>
          </ul>
          <Upload.Dragger
            beforeUpload={handleFileSelect}
            showUploadList={true}
            maxCount={1}
            fileList={selectedFile ? [selectedFile] : []}
            onRemove={() => setSelectedFile(null)}
            accept=".csv,.xls,.xlsx"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click hoặc kéo thả file vào đây</p>
            <p className="ant-upload-hint">
              Hỗ trợ file Excel (.xls, .xlsx) hoặc CSV
            </p>
          </Upload.Dragger>
        </div>
      </Modal>

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