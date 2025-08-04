import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, DatePicker, Radio, 
  Select, Upload, Avatar, message, Popconfirm, Typography, Alert, Spin, Divider
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UserOutlined,
  UploadOutlined, ImportOutlined, ExportOutlined, EyeOutlined, FileExcelOutlined
} from '@ant-design/icons';
import { studentService } from '../../../services/Admin/studentService.js';
import { lopService } from '../../../services/Admin/lopService.js';
import { ChiTietSinhVienComponents } from './ChiTietSinhVienComponents.jsx';
import moment from 'moment';
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { Search } = Input;

// Configuration
const PAGE_SIZE = 10;
const FORM_RULES = {
  maSv: [
    { required: true, message: 'Vui lòng nhập mã sinh viên' },
    { max: 10, message: 'Mã sinh viên không được vượt quá 10 ký tự' }
  ],
  tenSv: [
    { required: true, message: 'Vui lòng nhập tên sinh viên' },
    { max: 150, message: 'Tên sinh viên không được vượt quá 150 ký tự' },
    { whitespace: true, message: 'Tên sinh viên không được chỉ chứa khoảng trắng' }
  ],
  ngaySinh: [
    { required: true, message: 'Vui lòng chọn ngày sinh' },
    {
      validator: (_, value) => {
        if (value && value.isAfter(moment())) {
          return Promise.reject('Ngày sinh phải là ngày trong quá khứ');
        }
        return Promise.resolve();
      }
    }
  ],
  phai: [{ required: true, message: 'Vui lòng chọn giới tính' }],
  maLop: [{ required: true, message: 'Vui lòng chọn lớp' }],
  diaChi: [
    { required: true, message: 'Vui lòng nhập địa chỉ' },
    { max: 300, message: 'Địa chỉ không được vượt quá 300 ký tự' },
    { whitespace: true, message: 'Địa chỉ không được chỉ chứa khoảng trắng' }
  ],
  sdt: [
    { required: true, message: 'Vui lòng nhập số điện thoại' },
    { pattern: /^[0][0-9]{9}$/, message: 'Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 0)' }
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email' },
    { type: 'email', message: 'Email không hợp lệ' },
    { max: 100, message: 'Email không được vượt quá 100 ký tự' }
  ]
};

// Utility functions
const filterData = (data, filters) => {
  return data.filter(student => {
    const searchLower = filters.search?.toLowerCase() || '';
    const phaiText = student.phai === 1 ? 'nam' : student.phai === 0 ? 'nữ' : '';
    
    const matchSearch = !filters.search || 
      student.maSv?.toLowerCase().includes(searchLower) ||
      student.tenSv?.toLowerCase().includes(searchLower) ||
      student.ngaySinh?.toLowerCase().includes(searchLower) ||
      phaiText.includes(searchLower) ||
      student.diaChi?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower);
    
    const matchLop = !filters.filterLop || student.tenLop === filters.filterLop;
    const matchKhoa = !filters.filterKhoa || student.tenKhoa === filters.filterKhoa;
    
    return matchSearch && matchLop && matchKhoa;
  });
};

const createTableColumns = (onEdit, onDelete, onViewDetail) => [
  {
    title: 'Mã SV',
    dataIndex: 'maSv',
    width: '10%',
    sorter: (a, b) => a.maSv.localeCompare(b.maSv),
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
    ),
  },
  {
    title: 'Họ và tên',
    dataIndex: 'tenSv',
    width: '15%',
    sorter: (a, b) => a.tenSv.localeCompare(b.tenSv),
  },
  {
    title: 'Ngày sinh',
    dataIndex: 'ngaySinh',
    width: '10%',
    sorter: (a, b) => moment(a.ngaySinh).unix() - moment(b.ngaySinh).unix(),
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
    width: '10%',
  },
  {
    title: 'Khoa',
    dataIndex: 'tenKhoa',
    width: '15%',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: '15%',
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: '12%',
    render: (_, record) => (
      <Space size="small">
        <Button type="text" icon={<EyeOutlined />} onClick={() => onViewDetail(record)}>
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sinh viên này?"
          onConfirm={() => onDelete(record.maSv)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

const SearchAndFilterBar = ({ filters, onChange, classes }) => {
  const uniqueKhoas = Array.from(new Set(classes.map(lop => lop.tenKhoa)));
  
  return (
    <Space wrap style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
      <Search
        placeholder="Tìm theo MSSV, Họ tên, Email"
        allowClear
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        style={{ width: 300 }}
        enterButton={<SearchOutlined />}
      />
      <Space>
        <Select
          placeholder="Lọc theo lớp"
          allowClear
          style={{ width: 180 }}
          value={filters.filterLop}
          onChange={(value) => onChange({ ...filters, filterLop: value })}
          options={classes.map(lop => ({ value: lop.tenLop, label: lop.tenLop }))}
        />
        <Select
          placeholder="Lọc theo khoa"
          allowClear
          style={{ width: 180 }}
          value={filters.filterKhoa}
          onChange={(value) => onChange({ ...filters, filterKhoa: value })}
          options={uniqueKhoas.map(khoa => ({ label: khoa, value: khoa }))}
        />
      </Space>
    </Space>
  );
};

const Header = ({ onCreateClick, onImportClick, onExportClick }) => (
  <div style={{ 
    marginBottom: '16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  }}>
    <Title level={2}>Quản lý Sinh viên</Title>
    <Space wrap>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
        Thêm Sinh viên
      </Button>
      <Divider type="vertical" />
      <Button icon={<ImportOutlined />} onClick={onImportClick}>
        Import Excel
      </Button>
      <Button icon={<ExportOutlined />} onClick={onExportClick}>
        Xuất Excel
      </Button>
    </Space>
  </div>
);

const ErrorAlert = ({ error }) => {
  if (!error) return null;
  return (
    <Alert
      message="Lỗi"
      description={error}
      type="error"
      showIcon
      style={{ marginBottom: '16px' }}
    />
  );
};

const SinhVienForm = ({ form, editingSinhVien, classes }) => (
  <Form form={form} layout="vertical">
    {!editingSinhVien && (
      <Form.Item name="maSv" label="Mã sinh viên" rules={FORM_RULES.maSv}>
        <Input placeholder="Nhập mã sinh viên" />
      </Form.Item>
    )}
    <Form.Item name="tenSv" label="Họ và tên" rules={FORM_RULES.tenSv}>
      <Input placeholder="Nhập họ và tên" />
    </Form.Item>
    <Form.Item name="ngaySinh" label="Ngày sinh" rules={FORM_RULES.ngaySinh}>
      <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
    </Form.Item>
    <Form.Item name="phai" label="Giới tính" rules={FORM_RULES.phai}>
      <Radio.Group>
        <Radio value={1}>Nam</Radio>
        <Radio value={0}>Nữ</Radio>
      </Radio.Group>
    </Form.Item>
    <Form.Item name="maLop" label="Lớp" rules={FORM_RULES.maLop}>
      <Select placeholder="Chọn lớp" showSearch optionFilterProp="children">
        {classes.map(lop => (
          <Select.Option key={lop.maLop} value={lop.maLop}>
            {lop.tenLop} - {lop.tenKhoa}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item name="diaChi" label="Địa chỉ" rules={FORM_RULES.diaChi}>
      <Input placeholder="Nhập địa chỉ" />
    </Form.Item>
    <Form.Item name="sdt" label="Số điện thoại" rules={FORM_RULES.sdt}>
      <Input placeholder="Nhập số điện thoại" />
    </Form.Item>
    <Form.Item name="email" label="Email" rules={FORM_RULES.email}>
      <Input placeholder="Nhập email" />
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
);

const SinhVienModal = ({ visible, title, onOk, onCancel, form, editingSinhVien, classes }) => (
  <Modal
    title={title}
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    width={600}
  >
    <SinhVienForm form={form} editingSinhVien={editingSinhVien} classes={classes} />
  </Modal>
);

const ImportModal = ({ visible, onCancel, onImportFile }) => (
  <Modal
    title="Import Danh sách Sinh viên từ Excel"
    open={visible}
    onCancel={onCancel}
    footer={[
      <Button key="cancel" onClick={onCancel}>
        Hủy
      </Button>,
    ]}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontWeight: 'medium' }}>Hướng dẫn Import:</p>
        <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
          <li>1. Tải template Excel mẫu</li>
          <li>2. Điền thông tin sinh viên theo đúng format</li>
          <li>3. Upload file Excel đã hoàn thành</li>
          <li>4. Kiểm tra và xác nhận import</li>
        </ul>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontWeight: 'medium' }}>Chọn file Excel:</p>
        <Upload
          accept=".xlsx,.xls"
          beforeUpload={onImportFile}
          showUploadList={false}
        >
          <Button icon={<FileExcelOutlined />} size="large" style={{ width: '100%' }}>
            Chọn file Excel để import
          </Button>
        </Upload>
      </div>
    </div>
  </Modal>
);

const ImportPreviewModal = ({ visible, data, onConfirm, onCancel, loading, classes }) => (
  <Modal
    title="Xem trước dữ liệu Import"
    open={visible}
    onOk={onConfirm}
    onCancel={onCancel}
    width={1000}
    okText="Xác nhận Import"
    cancelText="Hủy"
    confirmLoading={loading}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontWeight: 'medium' }}>
          Sẽ import {data.length} sinh viên
        </p>
      </div>
      <Table
        dataSource={data}
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
            title: 'Trạng thái',
            width: 120,
            render: (_, record) => {
              const hasRequiredFields = record.maSv && record.tenSv && record.email;
              const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email || '');
              const sdtValid = /^[0][0-9]{9}$/.test(record.sdt || '');
              const classValid = classes.find(cls => cls.maLop === record.maLop);
              
              if (!hasRequiredFields) {
                return <span style={{ color: '#f5222d' }}>Thiếu thông tin</span>;
              }
              if (!emailValid) {
                return <span style={{ color: '#fa8c16' }}>Email không hợp lệ</span>;
              }
              if (!sdtValid) {
                return <span style={{ color: '#fa8c16' }}>SĐT không hợp lệ</span>;
              }
              if (!classValid) {
                return <span style={{ color: '#fa8c16' }}>Lớp không hợp lệ</span>;
              }
              return <span style={{ color: '#52c41a' }}>Hợp lệ</span>;
            }
          }
        ]}
      />
    </div>
  </Modal>
);

// Main Component
export const DanhSachSinhVienComponents = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSinhVien, setEditingSinhVien] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importPreviewModalVisible, setImportPreviewModalVisible] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    filterLop: null,
    filterKhoa: null
  });
  const [form] = Form.useForm();

  // Data fetching
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAllStudentsNoPagination();
      setStudents(data);
      const filtered = filterData(data, filters);
      setFilteredData(filtered);
    } catch (error) {
      setError('Không thể tải danh sách sinh viên. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách sinh viên');
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

  useEffect(() => {
    const filtered = filterData(students, filters);
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [students, filters]);

  // Event handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingSinhVien(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      ngaySinh: moment(record.ngaySinh)
    });
    setEditingSinhVien(record);
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedStudent(record);
    setDetailModalVisible(true);
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

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSinhVien) {
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
        await studentService.updateStudent(editingSinhVien.maSv, updateData);
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
      form.resetFields();
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

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleExportExcel = () => {
    try {
      const exportData = filteredData;
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

  const handleImportFile = (file) => {
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
          .filter(row => row.length > 1 && row[1])
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
        
        setImportPreviewData(importedStudents);
        setImportPreviewModalVisible(true);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        message.error('Có lỗi xảy ra khi đọc file Excel');
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleConfirmImport = async () => {
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
          
          // Validate phone number format
          const sdtValid = /^[0][0-9]{9}$/.test(student.sdt);
          if (!sdtValid) {
            errors.push(`Mã SV "${student.maSv}": Số điện thoại không hợp lệ`);
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

  // Table configuration
  const columns = createTableColumns(handleEdit, handleDelete, handleViewDetail);
  const modalTitle = editingSinhVien ? 'Cập nhật Sinh viên' : 'Thêm Sinh viên Mới';

  return (
    <div style={{ padding: '24px' }}>
      <Header 
        onCreateClick={handleCreate}
        onImportClick={() => setImportModalVisible(true)}
        onExportClick={handleExportExcel}
      />
      
      <SearchAndFilterBar 
        filters={filters}
        onChange={handleFiltersChange}
        classes={classes}
      />
      
      <ErrorAlert error={error} />
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="maSv"
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: PAGE_SIZE,
            current: currentPage,
            onChange: setCurrentPage,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} sinh viên`
          }}
        />
      </Spin>

      {/* Detail Modal */}
      <ChiTietSinhVienComponents
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        student={selectedStudent}
      />

      {/* Create/Edit Modal */}
      <SinhVienModal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        editingSinhVien={editingSinhVien}
        classes={classes}
      />

      {/* Import Modal */}
      <ImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onImportFile={handleImportFile}
      />

      {/* Import Preview Modal */}
      <ImportPreviewModal
        visible={importPreviewModalVisible}
        data={importPreviewData}
        onConfirm={handleConfirmImport}
        onCancel={() => setImportPreviewModalVisible(false)}
        loading={loading}
        classes={classes}
      />
    </div>
  );
};