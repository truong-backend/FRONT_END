import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Popconfirm, message, Modal, Form, Switch, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, FileExcelOutlined } from '@ant-design/icons';
import { userService } from '../../../services/Admin/userService.js';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const DanhSachTaiKhoanGiangVienComponents = () => {
  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form] = Form.useForm();
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    sorter: { field: 'createdAt', order: 'descend' },
    search: ''
  });

  // Data fetching
  const fetchTeachers = async () => {
    setLoading(true);
    try {
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
      setTableParams(prev => ({
        ...prev,
        pagination: { ...prev.pagination, total: data.totalElements }
      }));
    } catch (error) {
      message.error('Lỗi khi tải danh sách giảng viên');
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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
    const trimmedValue = value.trim();
    setTableParams(prev => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      search: trimmedValue
    }));
  };

  // Excel Export Function
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      
      // Lấy tất cả dữ liệu giảng viên để xuất (không phân trang)
      const allTeachersData = await userService.getUsersByRole(
        'TEACHER',
        0, // page 0
        1000, // lấy nhiều records
        'createdAt',
        'desc',
        tableParams.search // giữ filter search hiện tại
      );

      const teachersToExport = allTeachersData.content;

      if (teachersToExport.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = teachersToExport.map((teacher, index) => ({
        'STT': index + 1,
        'ID': teacher.id,
        'Họ và tên': teacher.fullName || '',
        'Username': teacher.username || '',
        'Email': teacher.email || '',
        'Trạng thái': teacher.isActive ? 'Hoạt động' : 'Khóa',
        'Email xác thực': teacher.emailVerifiedAt ? 'Đã xác thực' : 'Chưa xác thực',
        'Ngày tạo': teacher.createdAt ? moment(teacher.createdAt).format('DD/MM/YYYY HH:mm') : '',
        'Ngày cập nhật': teacher.updatedAt ? moment(teacher.updatedAt).format('DD/MM/YYYY HH:mm') : ''
      }));

      // Tạo workbook và worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Thiết lập độ rộng cột
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 8 },  // ID
        { wch: 25 }, // Họ và tên
        { wch: 15 }, // Username
        { wch: 30 }, // Email
        { wch: 12 }, // Trạng thái
        { wch: 15 }, // Email xác thực
        { wch: 18 }, // Ngày tạo
        { wch: 18 }  // Ngày cập nhật
      ];
      ws['!cols'] = colWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách giảng viên');

      // Tạo tên file với timestamp
      const fileName = `danh-sach-giang-vien-${moment().format('YYYY-MM-DD-HH-mm')}.xlsx`;

      // Xuất file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);

      message.success(`Xuất Excel thành công! File: ${fileName}`);
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + (error.message || 'Unknown error'));
      console.error('Export Excel error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = (teacher = null) => {
    setEditingTeacher(teacher);
    if (teacher) {
      form.setFieldsValue({
        username: teacher.username,
        email: teacher.email,
        fullName: teacher.fullName,
        isActive: teacher.isActive,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTeacher(null);
    form.resetFields();
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, role: 'TEACHER' };

      if (editingTeacher) {
        await userService.updateUser(editingTeacher.id, payload);
        message.success('Cập nhật giảng viên thành công');
        fetchTeachers();
      } else {
        await userService.createUser(payload);
        message.success('Thêm giảng viên mới thành công');
        fetchTeachers();
      }

      closeModal();
      fetchTeachers();
    } catch (error) {
      message.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete handler
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

  // Status change handler
  const handleStatusChange = async (id, isActive) => {
    try {
      await userService.updateUser(id, { isActive });
      message.success(`${isActive ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`);
      fetchTeachers();
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
    // {
    //   title: 'Thao tác',
    //   width: 120,
    //   render: (_, record) => (
    //     <div className="flex gap-2">
    //       <Button
    //         type="primary"
    //         size="small"
    //         icon={<EditOutlined />}
    //         onClick={() => openModal(record)}
    //       />
    //       {/* <Popconfirm
    //         title="Bạn có chắc chắn muốn xóa giảng viên này?"
    //         onConfirm={() => handleDelete(record.id)}
    //         okText="Có"
    //         cancelText="Không"
    //       >
    //         <Button 
    //           type="primary" 
    //           danger 
    //           size="small"
    //           icon={<DeleteOutlined />} 
    //         />
    //       </Popconfirm> */}
    //     </div>
    //   )
    // }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tài Khoản Giảng Viên</h2>
        <div className="flex gap-3">
          <Input.Search
            placeholder="Tìm kiếm giảng viên..."
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="default"
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={loading}
          >
            Xuất Excel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Thêm Giảng viên
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={teachers}
        rowKey="id"
        pagination={{
          ...tableParams.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} giảng viên`
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      {/* Modal */}
      <Modal
        title={editingTeacher ? "Cập nhật Giảng viên" : "Thêm Giảng viên mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        width={600}
        okText={editingTeacher ? "Cập nhật" : "Thêm"}
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

          {!editingTeacher && (
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