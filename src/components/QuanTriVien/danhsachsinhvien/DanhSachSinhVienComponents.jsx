import React, { useState, useEffect } from 'react';
import {
  Table, Input, Space, Button, Popconfirm, message, Modal, Form,
  DatePicker, Radio, Upload, Avatar, Select, Divider
} from 'antd';
import {
  EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined,
  UserOutlined, UploadOutlined, ImportOutlined, ExportOutlined,
  EyeOutlined, FileExcelOutlined
} from '@ant-design/icons';
import { studentService } from '../../../services/Admin/studentService.js';
import { lopService } from '../../../services/Admin/lopService.js';
import { ChiTietSinhVienComponents } from './ChiTietSinhVienComponents.jsx';
import moment from 'moment';
import * as XLSX from 'xlsx';

export const DanhSachSinhVienComponents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    search: '',
    filterLop: null,
    filterKhoa: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [importPreviewData, setImportPreviewData] = useState([]);
  const [importPreviewModalVisible, setImportPreviewModalVisible] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAllStudentsNoPagination();
      setStudents(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (error) {
      message.error('Lỗi khi tải danh sách sinh viên');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await lopService.getLopsKhongPhanTrang();
      setClasses(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách lớp');
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleTableChange = (newPagination, tableFilters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const getFilteredData = () => {
    return students.filter(student => {
      const searchLower = filters.search?.toLowerCase() || '';
      const phaiText = student.phai === 1 ? 'nam' : student.phai === 0 ? 'nữ' : '';
      const matchSearch =
        student.maSv?.toLowerCase().includes(searchLower) ||
        student.tenSv?.toLowerCase().includes(searchLower) ||
        student.ngaySinh?.toLowerCase().includes(searchLower) ||
        phaiText.includes(searchLower) ||
        student.diaChi?.toLowerCase().includes(searchLower);
      const matchLop = filters.filterLop ? student.tenLop === filters.filterLop : true;
      const matchKhoa = filters.filterKhoa ? student.tenKhoa === filters.filterKhoa : true;
      return matchSearch && matchLop && matchKhoa;
    });
  };

  const openModal = (student = null) => {
    setEditingStudent(student);
    if (student) {
      form.setFieldsValue({
        ...student,
        ngaySinh: moment(student.ngaySinh)
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const openDetailModal = (student) => {
    setSelectedStudent(student);
    setDetailModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingStudent) {
        const updateData = {
          tenSv: values.tenSv.trim(),
          ngaySinh: values.ngaySinh.format('YYYY-MM-DD'),
          phai: values.phai,
          diaChi: values.diaChi.trim(),
          sdt: values.sdt.trim(),
          email: values.email.trim(),
          maLop: values.maLop
        };
        if (values.avatar?.length > 0) {
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
      closeModal();
      fetchStudents();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
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

  const exportToExcel = (dataToExport = null) => {
    try {
      const exportData = dataToExport || getFilteredData();
      if (exportData.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }
      const excelData = exportData.map((student, index) => ({
        'STT': index + 1,
        'Mã sinh viên': student.maSv || '',
        'Họ lót': student.hoLot || '',
        'Tên': student.ten || student.tenSv || '',
        'Mã lớp': student.maLop || '',
        'Email': student.email || '',
        'Phái': student.phai === 1 ? 1 : 0,
        'Địa Chỉ': student.diaChi || '',
        'Số điện thoại': student.sdt || '',
        'Ngày Sinh': moment(student.ngaySinh).format('M/D/YYYY') || ''
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
        { wch: 30 }, { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 12 }
      ];
      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên');
      const fileName = `danh-sach-sinh-vien-${moment().format('YYYY-MM-DD-HH-mm-ss')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success(`Xuất Excel thành công: ${fileName}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Có lỗi xảy ra khi xuất Excel');
    }
  };

  const handleImportExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length < 2) {
          message.error('File Excel không có dữ liệu hoặc định dạng không đúng');
          return;
        }
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);
        const expectedHeaders = ['STT', 'Mã sinh viên', 'Họ lót', 'Tên', 'Mã lớp', 'Email', 'Phái', 'Địa Chỉ', 'Số điện thoại', 'Ngày Sinh'];
        const isValidFormat = expectedHeaders.every(header => headers.includes(header));
        if (!isValidFormat) {
          message.error('Định dạng file Excel không đúng. Vui lòng sử dụng template có các cột: ' + expectedHeaders.join(', '));
          return;
        }
        const importedStudents = dataRows
          .filter(row => row.length > 1 && row[1]) // Lọc bỏ dòng trống và dòng không có mã sinh viên
          .map((row) => {
            const student = {};
            headers.forEach((header, index) => {
              switch (header) {
                case 'STT':
                  break;
                case 'Mã sinh viên':
                  student.maSv = row[index] ? String(row[index]).trim() : '';
                  break;
                case 'Họ lót':
                  student.hoLot = row[index] ? String(row[index]).trim() : '';
                  break;
                case 'Tên':
                  student.ten = row[index] ? String(row[index]).trim() : '';
                  student.tenSv = `${student.hoLot || ''} ${student.ten || ''}`.trim();
                  break;
                case 'Mã lớp':
                  student.maLop = row[index] ? String(row[index]).trim() : '';
                  break;
                case 'Email':
                  student.email = row[index] ? String(row[index]).trim() : '';
                  break;
                case 'Phái':
                  student.phai = row[index] === 1 || row[index] === '1' ? 1 : 0;
                  break;
                case 'Địa Chỉ':
                  student.diaChi = row[index] && String(row[index]).trim() !== 'diaChi' ? String(row[index]).trim() : 'Chưa cập nhật';
                  break;
                case 'Số điện thoại':
                  student.sdt = row[index] ? String(row[index]).trim() : '0000000000';
                  break;
                case 'Ngày Sinh':
                  if (row[index]) {
                    const dateValue = row[index];
                    if (typeof dateValue === 'number') {
                      // Excel date serial number
                      student.ngaySinh = moment(new Date((dateValue - 25569) * 86400 * 1000)).format('YYYY-MM-DD');
                    } else {
                      student.ngaySinh = moment(dateValue, ['M/D/YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY']).isValid()
                        ? moment(dateValue, ['M/D/YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY']).format('YYYY-MM-DD')
                        : '2000-01-01';
                    }
                  } else {
                    student.ngaySinh = '2000-01-01';
                  }
                  break;
              }
            });
            return student;
          });
        if (importedStudents.length === 0) {
          message.error('Không có dữ liệu hợp lệ để import');
          return;
        }
        showImportPreview(importedStudents);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        message.error('Có lỗi xảy ra khi đọc file Excel');
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const showImportPreview = (data) => {
    setImportPreviewData(data);
    setImportPreviewModalVisible(true);
  };

  const confirmImport = async () => {
    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      for (const student of importPreviewData) {
        try {
          // Validate required fields
          if (!student.maSv || !student.tenSv || !student.email) {
            errors.push(`Dòng có mã SV "${student.maSv || 'Trống'}": Thiếu thông tin bắt buộc`);
            errorCount++;
            continue;
          }
          // Validate email format
          const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email);
          if (!emailValid) {
            errors.push(`Mã SV "${student.maSv}": Email không hợp lệ`);
            errorCount++;
            continue;
          }
          // Validate phone number format (10 digits, starts with 0)
          const sdtValid = /^[0][0-9]{9}$/.test(student.sdt);
          if (!sdtValid) {
            errors.push(`Mã SV "${student.maSv}": Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0)`);
            errorCount++;
            continue;
          }
          // Validate class
          const foundClass = classes.find(cls => cls.maLop === student.maLop);
          if (!foundClass) {
            errors.push(`Mã SV "${student.maSv}": Mã lớp không hợp lệ`);
            errorCount++;
            continue;
          }
          const importData = {
            maSv: student.maSv,
            tenSv: student.tenSv,
            email: student.email,
            maLop: student.maLop,
            ngaySinh: student.ngaySinh,
            phai: student.phai,
            diaChi: student.diaChi,
            sdt: student.sdt
          };
          await studentService.createStudent(importData);
          successCount++;
        } catch (error) {
          errorCount++;
          const errorMsg = error.response?.data?.message || error.message;
          errors.push(`Mã SV "${student.maSv}": ${errorMsg}`);
        }
      }
      if (successCount > 0) {
        message.success(`Import thành công ${successCount} sinh viên`);
      }
      if (errorCount > 0) {
        console.error('Import errors:', errors);
        message.error(`${errorCount} sinh viên import thất bại. Kiểm tra console để xem chi tiết.`);
      }
      await fetchStudents();
      setImportPreviewModalVisible(false);
      setImportModalVisible(false);
    } catch (error) {
      console.error('Error during import:', error);
      message.error('Có lỗi xảy ra trong quá trình import');
    } finally {
      setLoading(false);
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
      width: '12%',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sinh viên này?"
            onConfirm={() => handleDelete(record.maSv)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const validationRules = {
    maSv: [
      { required: true, message: 'Mã sinh viên không được để trống' },
      { max: 10, message: 'Mã sinh viên không được vượt quá 10 ký tự' }
    ],
    tenSv: [
      { required: true, message: 'Tên sinh viên không được để trống' },
      { max: 150, message: 'Tên sinh viên không được vượt quá 150 ký tự' },
      { whitespace: true, message: 'Tên sinh viên không được chỉ chứa khoảng trắng' }
    ],
    ngaySinh: [
      { required: true, message: 'Ngày sinh không được để trống' },
      {
        validator: (_, value) => {
          if (value && value.isAfter(moment())) {
            return Promise.reject('Ngày sinh phải là ngày trong quá khứ');
          }
          return Promise.resolve();
        }
      }
    ],
    phai: [{ required: true, message: 'Giới tính không được để trống' }],
    maLop: [{ required: true, message: 'Lớp không được để trống' }],
    diaChi: [
      { required: true, message: 'Địa chỉ không được để trống' },
      { max: 300, message: 'Địa chỉ không được vượt quá 300 ký tự' },
      { whitespace: true, message: 'Địa chỉ không được chỉ chứa khoảng trắng' }
    ],
    sdt: [
      { required: true, message: 'Số điện thoại không được để trống' },
      { pattern: /^[0][0-9]{9}$/, message: 'Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0)' }
    ],
    email: [
      { required: true, message: 'Email không được để trống' },
      { type: 'email', message: 'Email không hợp lệ' },
      { max: 100, message: 'Email không được vượt quá 50 ký tự' }
    ]
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Danh sách Sinh viên</h2>
        <Space wrap>
          <Input
            placeholder="Tìm theo MSSV, Họ tên, Email"
            allowClear
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Lọc theo lớp"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => setFilters(prev => ({ ...prev, filterLop: value }))}
            options={classes.map(lop => ({ value: lop.tenLop, label: lop.tenLop }))}
          />
          <Select
            placeholder="Lọc theo khoa"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => setFilters(prev => ({ ...prev, filterKhoa: value }))}
            options={Array.from(new Set(classes.map(lop => lop.tenKhoa))).map(khoa => ({
              label: khoa,
              value: khoa
            }))}
          />
        </Space>
      </div>
      <div className="mb-4">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Thêm Sinh viên
          </Button>
          <Divider type="vertical" />
          <Button
            icon={<ImportOutlined />}
            onClick={() => setImportModalVisible(true)}
          >
            Import Excel
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => exportToExcel()}
          >
            Xuất Excel
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={getFilteredData()}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="maSv"
        scroll={{ x: 1500 }}
      />
      <ChiTietSinhVienComponents
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        student={selectedStudent}
      />
      <Modal
        title={editingStudent ? "Cập nhật Sinh viên" : "Thêm Sinh viên mới"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingStudent && (
            <Form.Item name="maSv" label="Mã sinh viên" rules={validationRules.maSv}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="tenSv" label="Họ và tên" rules={validationRules.tenSv}>
            <Input />
          </Form.Item>
          <Form.Item name="ngaySinh" label="Ngày sinh" rules={validationRules.ngaySinh}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="phai" label="Giới tính" rules={validationRules.phai}>
            <Radio.Group>
              <Radio value={1}>Nam</Radio>
              <Radio value={0}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="maLop" label="Lớp" rules={validationRules.maLop}>
            <Select placeholder="Chọn lớp" showSearch optionFilterProp="children">
              {classes.map(lop => (
                <Select.Option key={lop.maLop} value={lop.maLop}>
                  {lop.tenLop} - {lop.tenKhoa}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="diaChi" label="Địa chỉ" rules={validationRules.diaChi}>
            <Input />
          </Form.Item>
          <Form.Item name="sdt" label="Số điện thoại" rules={validationRules.sdt}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={validationRules.email}>
            <Input />
          </Form.Item>
          <Form.Item
            name="avatar"
            label="Avatar"
            valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
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
      <Modal
        title="Import Danh sách Sinh viên từ Excel"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setImportModalVisible(false)}>
            Hủy
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-medium">Hướng dẫn Import:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Tải template Excel mẫu</li>
              <li>2. Điền thông tin sinh viên theo đúng format</li>
              <li>3. Upload file Excel đã hoàn thành</li>
              <li>4. Kiểm tra và xác nhận import</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium">Chọn file Excel:</p>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleImportExcel}
              showUploadList={false}
            >
              <Button icon={<FileExcelOutlined />} size="large" className="w-full">
                Chọn file Excel để import
              </Button>
            </Upload>
          </div>
        </div>
      </Modal>
      <Modal
        title="Xem trước dữ liệu Import"
        open={importPreviewModalVisible}
        onOk={confirmImport}
        onCancel={() => setImportPreviewModalVisible(false)}
        width={1000}
        okText="Xác nhận Import"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-medium">
              Sẽ import {importPreviewData.length} sinh viên
            </p>
          </div>
          <Table
            dataSource={importPreviewData}
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 800 }}
            rowKey={(record, index) => `preview-${index}`}
            columns={[
              {
                title: 'STT',
                width: 60,
                render: (_, record, index) => index + 1
              },
              {
                title: 'Mã SV',
                dataIndex: 'maSv',
                width: 120
              },
              {
                title: 'Họ và tên',
                dataIndex: 'tenSv',
                width: 180
              },
              {
                title: 'Email',
                dataIndex: 'email',
                width: 200
              },
              {
                title: 'Mã lớp',
                dataIndex: 'maLop',
                width: 100
              },
              {
                title: 'Phái',
                dataIndex: 'phai',
                width: 80,
                render: (phai) => phai === 1 ? 'Nam' : 'Nữ'
              },
              {
                title: 'Ngày sinh',
                dataIndex: 'ngaySinh',
                width: 100,
                render: (date) => date ? moment(date).format('DD/MM/YYYY') : ''
              },
              {
                title: 'Địa chỉ',
                dataIndex: 'diaChi',
                width: 150
              },
              {
                title: 'Số điện thoại',
                dataIndex: 'sdt',
                width: 120
              },
              {
                title: 'Trạng thái',
                width: 120,
                render: (_, record) => {
                  const hasRequiredFields = record.maSv && record.tenSv && record.email;
                  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email || '');
                  const sdtValid = /^[0][0-9]{9}$/.test(record.sdt || '');
                  const classValid = classes.find(cls => cls.maLop === record.maLop);
                  if (!hasRequiredFields) {
                    return <span className="text-red-500">Thiếu thông tin</span>;
                  }
                  if (!emailValid) {
                    return <span className="text-orange-500">Email không hợp lệ</span>;
                  }
                  if (!sdtValid) {
                    return <span className="text-orange-500">SĐT không hợp lệ</span>;
                  }
                  if (!classValid) {
                    return <span className="text-orange-500">Lớp không hợp lệ</span>;
                  }
                  return <span className="text-green-500">Hợp lệ</span>;
                }
              }
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};