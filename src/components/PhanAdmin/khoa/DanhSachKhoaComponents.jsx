import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
  Alert,
  Spin,
  Upload,
  Progress,
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined 
} from '@ant-design/icons';
import { khoaService } from '../../../services/PhanAdmin/khoaService.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';

const { Title } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

// Validation functions
const validateKhoaData = (khoa, index) => {
  const errors = [];
  
  // Validate mã khoa
  if (!khoa.maKhoa || khoa.maKhoa.toString().trim() === '') {
    errors.push(`Dòng ${index + 1}: Mã khoa không được để trống`);
  } else if (khoa.maKhoa.toString().length > 50) {
    errors.push(`Dòng ${index + 1}: Mã khoa không được vượt quá 50 ký tự`);
  }
  
  // Validate tên khoa
  if (!khoa.tenKhoa || khoa.tenKhoa.toString().trim() === '') {
    errors.push(`Dòng ${index + 1}: Tên khoa không được để trống`);
  } else if (khoa.tenKhoa.toString().length > 255) {
    errors.push(`Dòng ${index + 1}: Tên khoa không được vượt quá 255 ký tự`);
  }
  
  return errors;
};

const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        });
        
        // Skip empty rows and find header row
        const nonEmptyRows = jsonData.filter(row => 
          row.some(cell => cell && cell.toString().trim() !== '')
        );
        
        if (nonEmptyRows.length < 2) {
          reject(new Error('File Excel không có dữ liệu hợp lệ'));
          return;
        }
        
        // Find header row (look for columns containing "mã", "tên")
        let headerRowIndex = -1;
        let headerRow = null;
        
        for (let i = 0; i < nonEmptyRows.length; i++) {
          const row = nonEmptyRows[i];
          const hasRequiredColumns = row.some(cell => {
            const cellStr = cell.toString().toLowerCase();
            return cellStr.includes('mã') || cellStr.includes('tên');
          });
          
          if (hasRequiredColumns) {
            headerRowIndex = i;
            headerRow = row;
            break;
          }
        }
        
        if (headerRowIndex === -1) {
          reject(new Error('Không tìm thấy dòng tiêu đề hợp lệ trong file Excel'));
          return;
        }
        
        // Map column indices
        const columnMapping = {};
        headerRow.forEach((header, index) => {
          const headerStr = header.toString().toLowerCase().trim();
          if (headerStr.includes('mã') && headerStr.includes('khoa')) {
            columnMapping.maKhoa = index;
          } else if (headerStr.includes('tên') && headerStr.includes('khoa')) {
            columnMapping.tenKhoa = index;
          }
        });
        
        // Validate required columns
        if (columnMapping.maKhoa === undefined || columnMapping.tenKhoa === undefined) {
          reject(new Error('File Excel thiếu các cột bắt buộc: Mã khoa, Tên khoa'));
          return;
        }
        
        // Parse data rows
        const dataRows = nonEmptyRows.slice(headerRowIndex + 1);
        const khoas = dataRows.map(row => ({
          maKhoa: row[columnMapping.maKhoa]?.toString().trim() || '',
          tenKhoa: row[columnMapping.tenKhoa]?.toString().trim() || ''
        })).filter(khoa => khoa.maKhoa || khoa.tenKhoa); // Filter out completely empty rows
        
        resolve(khoas);
      } catch (error) {
        reject(new Error('Lỗi khi đọc file Excel: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Không thể đọc file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

const importKhoas = async (khoas, onProgress) => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  const total = khoas.length;
  
  for (let i = 0; i < khoas.length; i++) {
    const khoa = khoas[i];
    
    try {
      // Validate data
      const validationErrors = validateKhoaData(khoa, i);
      if (validationErrors.length > 0) {
        results.failed++;
        results.errors.push(...validationErrors);
        continue;
      }
      
      // Call API
      await khoaService.createKhoa(khoa);
      results.success++;
      
      // Update progress
      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100));
      }
      
    } catch (error) {
      results.failed++;
      const errorMessage = error.response?.data || error.message || 'Lỗi không xác định';
      results.errors.push(`Dòng ${i + 1} (${khoa.maKhoa}): ${errorMessage}`);
    }
  }
  
  return results;
};

// Import Modal Component
const ImportModal = ({ visible, onCancel, onImport }) => {
  const [fileList, setFileList] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = async (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);
    setPreviewData([]);
    setImportResults(null);
    
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      try {
        const data = await parseExcelFile(file);
        setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
      } catch (error) {
        message.error(error.message);
      }
    }
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error('Vui lòng chọn file Excel');
      return;
    }

    try {
      setImporting(true);
      setImportProgress(0);
      
      const file = fileList[0].originFileObj;
      const data = await parseExcelFile(file);
      
      if (data.length === 0) {
        message.error('File Excel không có dữ liệu');
        return;
      }

      const results = await importKhoas(data, setImportProgress);
      setImportResults(results);
      
      if (results.success > 0) {
        message.success(`Import thành công ${results.success}/${data.length} khoa`);
        onImport(); // Refresh data
      }
      
      if (results.failed > 0) {
        message.warning(`${results.failed} khoa import thất bại`);
      }
      
    } catch (error) {
      message.error('Lỗi khi import: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleModalCancel = () => {
    if (!importing) {
      setFileList([]);
      setPreviewData([]);
      setImportResults(null);
      setImportProgress(0);
      onCancel();
    }
  };

  const previewColumns = [
    { title: 'Mã khoa', dataIndex: 'maKhoa', key: 'maKhoa' },
    { title: 'Tên khoa', dataIndex: 'tenKhoa', key: 'tenKhoa' }
  ];

  return (
    <Modal
      title="Import Khoa từ Excel"
      open={visible}
      onCancel={handleModalCancel}
      footer={[
        <Button key="cancel" onClick={handleModalCancel} disabled={importing}>
          Đóng
        </Button>,
        <Button 
          key="import" 
          type="primary" 
          onClick={handleImport}
          loading={importing}
          disabled={fileList.length === 0}
        >
          Import
        </Button>
      ]}
      width={800}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="Lưu ý"
          description="File Excel cần có các cột: Mã khoa, Tên khoa"
          type="info"
          showIcon
        />
      </div>

      <Dragger
        accept=".xlsx,.xls"
        fileList={fileList}
        onChange={handleFileChange}
        beforeUpload={() => false}
        maxCount={1}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click hoặc kéo file Excel vào đây</p>
        <p className="ant-upload-hint">
          Chỉ hỗ trợ file .xlsx và .xls
        </p>
      </Dragger>

      {importing && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={importProgress} status="active" />
          <p style={{ textAlign: 'center', marginTop: 8 }}>
            Đang import dữ liệu...
          </p>
        </div>
      )}

      {previewData.length > 0 && !importing && (
        <div style={{ marginTop: 16 }}>
          <Title level={5}>Xem trước dữ liệu (5 dòng đầu tiên):</Title>
          <Table
            columns={previewColumns}
            dataSource={previewData}
            rowKey={(record, index) => index}
            pagination={false}
            size="small"
          />
        </div>
      )}

      {importResults && (
        <div style={{ marginTop: 16 }}>
          <Alert
            message="Kết quả Import"
            description={
              <div>
                <p>Thành công: {importResults.success}</p>
                <p>Thất bại: {importResults.failed}</p>
                {importResults.errors.length > 0 && (
                  <div style={{ marginTop: 8, maxHeight: 200, overflow: 'auto' }}>
                    <Title level={5}>Chi tiết lỗi:</Title>
                    {importResults.errors.map((error, index) => (
                      <p key={index} style={{ margin: 0, color: 'red', fontSize: 12 }}>
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            }
            type={importResults.success > 0 ? 'success' : 'error'}
            showIcon
          />
        </div>
      )}
    </Modal>
  );
};

export const DanhSachKhoaComponents = () => {
  // State management
  const [khoas, setKhoas] = useState([]);
  const [filteredKhoas, setFilteredKhoas] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingMaKhoa, setEditingMaKhoa] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Data fetching
  const fetchKhoas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await khoaService.getKhoas();
      setKhoas(data);
      setFilteredKhoas(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (err) {
      const errorMessage = 'Không thể tải danh sách khoa. Vui lòng thử lại sau.';
      setError(errorMessage);
      message.error('Không thể tải danh sách khoa');
      console.error('Error fetching khoas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhoas();
  }, []);

  // Excel export function
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredKhoas.map((item, index) => ({
        'STT': index + 1,
        'Mã khoa': item.maKhoa,
        'Tên khoa': item.tenKhoa,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 15 }, // Mã khoa
        { wch: 40 }, // Tên khoa
      ];
      ws['!cols'] = colWidths;

      // Add title row
      XLSX.utils.sheet_add_aoa(ws, [['DANH SÁCH KHOA']], { origin: 'A1' });
      
      // Merge title cells
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({
        s: { r: 0, c: 0 },
        e: { r: 0, c: 2 }
      });

      // Style the title
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
        [`Tổng số khoa: ${filteredKhoas.length}`],
        ['']
      ];
      
      XLSX.utils.sheet_add_aoa(ws, exportInfo, { 
        origin: `A${exportData.length + 5}` 
      });

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khoa');

      // Generate file name with timestamp
      const fileName = `DanhSachKhoa_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;

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

  // Search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = khoas.filter(item =>
      item.tenKhoa.toLowerCase().includes(value.toLowerCase()) ||
      item.maKhoa.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredKhoas(filtered);
    setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
  };

  // Table handlers
  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    if (sorter?.field) {
      const sortedData = [...filteredKhoas].sort((a, b) => {
        const isAsc = sorter.order === 'ascend';
        return isAsc
          ? a[sorter.field].localeCompare(b[sorter.field])
          : b[sorter.field].localeCompare(a[sorter.field]);
      });
      setFilteredKhoas(sortedData);
    }
  };

  // Modal handlers
  const openModal = (record = null) => {
    if (record) {
      form.setFieldsValue(record);
      setEditingMaKhoa(record.maKhoa);
    } else {
      form.resetFields();
      setEditingMaKhoa(null);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // CRUD operations
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMaKhoa) {
        await khoaService.updateKhoa(editingMaKhoa, values);
        message.success('Cập nhật khoa thành công');
      } else {
        await khoaService.createKhoa(values);
        message.success('Thêm khoa mới thành công');
      }
      
      closeModal();
      fetchKhoas();
    } catch (error) {
      message.error(error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maKhoa) => {
    try {
      await khoaService.deleteKhoa(maKhoa);
      message.success('Xóa khoa thành công');
      fetchKhoas();
    } catch (error) {
      message.error(error.response?.data || 'Không thể xóa khoa');
    }
  };

  const handleImport = () => {
    setImportModalVisible(true);
  };

  const handleImportComplete = () => {
    setImportModalVisible(false);
    fetchKhoas(); // Refresh data after import
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Mã khoa',
      dataIndex: 'maKhoa',
      sorter: true,
      width: '30%',
    },
    {
      title: 'Tên khoa',
      dataIndex: 'tenKhoa',
      sorter: true,
      width: '50%',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.maKhoa)}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Form validation rules
  const validationRules = {
    maKhoa: [
      { required: true, message: 'Vui lòng nhập mã khoa' },
      { max: 50, message: 'Mã khoa không được vượt quá 50 ký tự' }
    ],
    tenKhoa: [
      { required: true, message: 'Vui lòng nhập tên khoa' },
      { max: 255, message: 'Tên khoa không được vượt quá 255 ký tự' }
    ]
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '16px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Title level={2}>Quản lý Khoa</Title>
        <Space>
          <Button 
            type="default" 
            icon={<UploadOutlined />} 
            onClick={handleImport}
            title="Import file Excel"
          >
            Import Excel
          </Button>
          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={exportToExcel}
            disabled={filteredKhoas.length === 0}
            title="Xuất báo cáo Excel"
          >
            Xuất Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm Khoa Mới
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Search
        placeholder="Tìm kiếm theo mã hoặc tên khoa"
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        value={searchText}
        enterButton={<SearchOutlined />}
        allowClear
        style={{ marginBottom: '16px', width: 400 }}
      />

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Data Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredKhoas}
          rowKey="maKhoa"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
        />
      </Spin>

      {/* Modal Form */}
      <Modal
        title={editingMaKhoa ? 'Cập nhật Khoa' : 'Thêm Khoa Mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingMaKhoa && (
            <Form.Item name="maKhoa" label="Mã khoa" rules={validationRules.maKhoa}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="tenKhoa" label="Tên khoa" rules={validationRules.tenKhoa}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <ImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onImport={handleImportComplete}
      />
    </div>
  );
};