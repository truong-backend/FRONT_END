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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { teacherService } from '../../../services/Admin/teacherService.js';
import { ChiTietGiangVienComponents } from './ChiTietGiangVienComponents.jsx';

const { Dragger } = Upload;
const { Text, Title } = Typography;

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

  // Import states
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);

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

  // Import Excel functionality
  const handleImportExcel = async (file) => {
    try {
      setImportLoading(true);
      setImportProgress(0);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validate and transform data
          const transformedData = jsonData.map((row, index) => {
            const rowNumber = index + 2; // Excel row number (assuming header is row 1)
            
            // Map Excel columns to our data structure
            const teacher = {
              maGv: row['Mã giáo viên'] || row['maGv'] || '',
              tenGv: row['Họ và tên'] || row['tenGv'] || '',
              ngaySinh: row['Ngày sinh'] || row['ngaySinh'] || '',
              phai: row['Giới tính'] || row['phai'] || '',
              diaChi: row['Địa chỉ'] || row['diaChi'] || '',
              sdt: row['Số điện thoại'] || row['sdt'] || '',
              email: row['Email'] || row['email'] || '',
              rowNumber: rowNumber
            };

            // Transform gender
            if (typeof teacher.phai === 'string') {
              teacher.phai = teacher.phai.toLowerCase() === 'nam' ? 1 : 0;
            }

            // Transform date
            if (teacher.ngaySinh) {
              if (typeof teacher.ngaySinh === 'number') {
                // Excel date number
                const excelDate = new Date((teacher.ngaySinh - 25569) * 86400 * 1000);
                teacher.ngaySinh = moment(excelDate).format('YYYY-MM-DD');
              } else if (typeof teacher.ngaySinh === 'string') {
                // String date
                const parsedDate = moment(teacher.ngaySinh, ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']);
                teacher.ngaySinh = parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : '';
              }
            }

            return teacher;
          });

          // Validate required fields
          const validatedData = transformedData.map(teacher => {
            const errors = [];
            
            if (!teacher.maGv) errors.push('Mã giáo viên không được để trống');
            if (!teacher.tenGv) errors.push('Họ tên không được để trống');
            if (!teacher.email) errors.push('Email không được để trống');
            if (!teacher.ngaySinh) errors.push('Ngày sinh không được để trống');
            if (teacher.phai === undefined || teacher.phai === null) errors.push('Giới tính không được để trống');
            if (!teacher.diaChi) errors.push('Địa chỉ không được để trống');
            if (!teacher.sdt) errors.push('Số điện thoại không được để trống');

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (teacher.email && !emailRegex.test(teacher.email)) {
              errors.push('Email không đúng định dạng');
            }

            return {
              ...teacher,
              errors: errors,
              isValid: errors.length === 0
            };
          });

          setImportData(validatedData);
          setImportModalVisible(true);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          message.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
        } finally {
          setImportLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      message.error('Lỗi khi import file Excel');
      setImportLoading(false);
    }

    return false; // Prevent default upload
  };

  const processImport = async () => {
    try {
      setImportLoading(true);
      setImportProgress(0);
      
      const validData = importData.filter(item => item.isValid);
      const results = {
        total: importData.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // Process each valid record
      for (let i = 0; i < validData.length; i++) {
        const teacher = validData[i];
        setImportProgress(Math.round(((i + 1) / validData.length) * 100));

        try {
          // Prepare data for API
          const teacherData = {
            maGv: teacher.maGv.trim(),
            tenGv: teacher.tenGv.trim(),
            ngaySinh: teacher.ngaySinh,
            phai: teacher.phai,
            diaChi: teacher.diaChi.trim(),
            sdt: teacher.sdt.trim(),
            email: teacher.email.trim()
          };

          await teacherService.createTeacher(teacherData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: teacher.rowNumber,
            maGv: teacher.maGv,
            tenGv: teacher.tenGv,
            error: error.message || 'Lỗi không xác định'
          });
        }

        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportResults(results);
      
      if (results.success > 0) {
        message.success(`Import thành công ${results.success} giáo viên`);
        fetchTeachers(); // Refresh the list
      }
      
      if (results.failed > 0) {
        message.warning(`${results.failed} giáo viên import thất bại`);
      }

    } catch (error) {
      console.error('Process import error:', error);
      message.error('Lỗi khi xử lý import');
    } finally {
      setImportLoading(false);
      setImportProgress(0);
    }
  };



  // Export Excel functionality
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredData.map((teacher, index) => ({
        'STT': index + 1,
        'Mã giáo viên': teacher.maGv || '',
        'Họ và tên': teacher.tenGv || '',
        'Ngày sinh': teacher.ngaySinh ? moment(teacher.ngaySinh).format('DD/MM/YYYY') : '',
        'Giới tính': teacher.phai === 1 ? 'Nam' : 'Nữ',
        'Địa chỉ': teacher.diaChi || '',
        'Số điện thoại': teacher.sdt || '',
        'Email': teacher.email || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 12 },  // Mã giáo viên
        { wch: 25 },  // Họ và tên
        { wch: 12 },  // Ngày sinh
        { wch: 10 },  // Giới tính
        { wch: 30 },  // Địa chỉ
        { wch: 15 },  // Số điện thoại
        { wch: 25 }   // Email
      ];
      ws['!cols'] = colWidths;

      // Add title row
      XLSX.utils.sheet_add_aoa(ws, [['DANH SÁCH GIÁO VIÊN']], { origin: 'A1' });
      
      // Merge title cells
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({
        s: { r: 0, c: 0 },
        e: { r: 0, c: 7 }
      });

      // Style the title (if needed, you can add more styling here)
      if (ws['A1']) {
        ws['A1'].s = {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' }
        };
      }

      // Shift data down to make room for title
      XLSX.utils.sheet_add_json(ws, exportData, {
        origin: 'A3',
        skipHeader: false
      });

      // Add export info
      const exportInfo = [
        [`Ngày xuất: ${moment().format('DD/MM/YYYY HH:mm:ss')}`],
        [`Tổng số giáo viên: ${filteredData.length}`],
        ['']
      ];
      
      XLSX.utils.sheet_add_aoa(ws, exportInfo, { 
        origin: `A${exportData.length + 5}` 
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách giáo viên');

      // Generate file name with timestamp
      const fileName = `DanhSachGiaoVien_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;

      // Save file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileName);

      message.success(`Xuất báo cáo thành công! Tệp: ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất báo cáo Excel');
    }
  };

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

  const closeImportModal = () => {
    setImportModalVisible(false);
    setImportData([]);
    setImportResults(null);
    setImportProgress(0);
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

          <Upload
            accept=".xlsx,.xls"
            beforeUpload={handleImportExcel}
            showUploadList={false}
          >
            <Button 
              type="default"
              icon={<ImportOutlined />}
              loading={importLoading}
              title="Import từ Excel"
            >
              Import Excel
            </Button>
          </Upload>
          <Button 
            type="default"
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            title="Xuất báo cáo Excel"
          >
            Xuất Excel
          </Button>
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

      {/* Import Modal */}
      <Modal
        title="Import Danh sách Giáo viên từ Excel"
        open={importModalVisible}
        onCancel={closeImportModal}
        width={800}
        footer={[
          <Button key="cancel" onClick={closeImportModal}>
            Hủy
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={importLoading}
            onClick={processImport}
            disabled={!importData.length || importData.filter(item => item.isValid).length === 0}
          >
            Thực hiện Import
          </Button>
        ]}
      >
        <div className="space-y-4">
          {/* Import Progress */}
          {importLoading && (
            <div>
              <Text>Đang xử lý...</Text>
              <Progress percent={importProgress} />
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="bg-gray-50 p-4 rounded">
              <Title level={5}>Kết quả Import:</Title>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                  <div className="text-sm text-gray-600">Tổng số</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-sm text-gray-600">Thành công</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                  <div className="text-sm text-gray-600">Thất bại</div>
                </div>
              </div>
              
              {importResults.errors.length > 0 && (
                <div className="mt-4">
                  <Text strong>Lỗi chi tiết:</Text>
                  <List
                    size="small"
                    dataSource={importResults.errors}
                    renderItem={(error) => (
                      <List.Item>
                        <Text type="danger">
                          Dòng {error.row}: {error.maGv} - {error.tenGv} - {error.error}
                        </Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          )}

          {/* Import Data Preview */}
          {importData.length > 0 && !importResults && (
            <div>
              <Title level={5}>
                Dữ liệu import ({importData.filter(item => item.isValid).length} hợp lệ / {importData.length} tổng)
              </Title>
              <div className="max-h-96 overflow-y-auto">
                <Table
                  size="small"
                  dataSource={importData}
                  rowKey={(record, index) => index}
                  pagination={false}
                  columns={[
                    {
                      title: 'Dòng',
                      dataIndex: 'rowNumber',
                      width: 60
                    },
                    {
                      title: 'Mã GV',
                      dataIndex: 'maGv',
                      width: 100
                    },
                    {
                      title: 'Họ tên',
                      dataIndex: 'tenGv',
                      width: 150
                    },
                    {
                      title: 'Email',
                      dataIndex: 'email',
                      width: 150
                    },
                    {
                      title: 'Trạng thái',
                      width: 100,
                      render: (_, record) => (
                        record.isValid ? 
                          <Text type="success">Hợp lệ</Text> : 
                          <Text type="danger">Lỗi</Text>
                      )
                    },
                    {
                      title: 'Lỗi',
                      render: (_, record) => (
                        record.errors.length > 0 && (
                          <Text type="danger" className="text-xs">
                            {record.errors.join(', ')}
                          </Text>
                        )
                      )
                    }
                  ]}
                  rowClassName={(record) => record.isValid ? '' : 'bg-red-50'}
                />
              </div>
            </div>
          )}
        </div>
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