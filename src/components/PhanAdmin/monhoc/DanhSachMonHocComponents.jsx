import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, 
  message, Popconfirm, Typography, Alert, Spin, Upload, Progress
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, 
  DownloadOutlined, UploadOutlined, InboxOutlined 
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { monHocService } from '../../../services/PhanAdmin/monHocService.js';

const { Title } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

// Configuration
const PAGE_SIZE = 10;
const FORM_RULES = {
  maMh: [
    { required: true, message: 'Vui lòng nhập mả môn học' },
    { max: 20, message: 'Mã môn học không được vượt quá 20 ký tự' }
  ],
  tenMh: [
    { required: true, message: 'Vui lòng nhập tên môn học' },
    { max: 50, message: 'Tên môn học không được vượt quá 50 ký tự' }
  ],
  soTiet: [
    { required: true, message: 'Vui lòng nhập số tiết' },
    { type: 'number', min: 1, message: 'Số tiết phải lớn hơn 0' }
  ]
};

// Utility functions
const filterData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter(item => 
    item.tenMh.toLowerCase().includes(lowerSearch) ||
    item.maMh.toLowerCase().includes(lowerSearch)
  );
};

const createTableColumns = (onEdit, onDelete) => [
  {
    title: 'Mã môn học',
    dataIndex: 'maMh',
    width: '20%',
    sorter: (a, b) => a.maMh.localeCompare(b.maMh),
  },
  {
    title: 'Tên môn học',
    dataIndex: 'tenMh',
    width: '40%',
    sorter: (a, b) => a.tenMh.localeCompare(b.tenMh),
  },
  {
    title: 'Số tiết',
    dataIndex: 'soTiet',
    width: '15%',
    sorter: (a, b) => a.soTiet - b.soTiet,
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: '25%',
    render: (_, record) => (
      <Space size="middle">
        <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>
          Sửa
        </Button>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => onDelete(record.maMh)}
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

// Export Excel functionality
const exportToExcel = (filteredData) => {
  try {
    // Prepare data for export
    const exportData = filteredData.map((monHoc, index) => ({
      'STT': index + 1,
      'Mã môn học': monHoc.maMh || '',
      'Tên môn học': monHoc.tenMh || '',
      'Số tiết': monHoc.soTiet || 0
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = [
      { wch: 5 },   // STT
      { wch: 15 },  // Mã môn học
      { wch: 40 },  // Tên môn học
      { wch: 10 }   // Số tiết
    ];
    ws['!cols'] = colWidths;

    // Add title row
    XLSX.utils.sheet_add_aoa(ws, [['DANH SÁCH MÔN HỌC']], { origin: 'A1' });
    
    // Merge title cells
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({
      s: { r: 0, c: 0 },
      e: { r: 0, c: 3 }
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
    const totalLessons = filteredData.reduce((sum, item) => sum + (item.soTiet || 0), 0);
    const exportInfo = [
      [`Ngày xuất: ${moment().format('DD/MM/YYYY HH:mm:ss')}`],
      [`Tổng số môn học: ${filteredData.length}`],
      [`Tổng số tiết: ${totalLessons}`],
      ['']
    ];
    
    XLSX.utils.sheet_add_aoa(ws, exportInfo, { 
      origin: `A${exportData.length + 5}` 
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách môn học');

    // Generate file name with timestamp
    const fileName = `DanhSachMonHoc_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;

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

// Import Excel functionality
const validateMonHocData = (monHoc, index) => {
  const errors = [];
  
  // Validate mã môn học
  if (!monHoc.maMh || monHoc.maMh.toString().trim() === '') {
    errors.push(`Dòng ${index + 1}: Mã môn học không được để trống`);
  } else if (monHoc.maMh.toString().length > 20) {
    errors.push(`Dòng ${index + 1}: Mã môn học không được vượt quá 20 ký tự`);
  }
  
  // Validate tên môn học
  if (!monHoc.tenMh || monHoc.tenMh.toString().trim() === '') {
    errors.push(`Dòng ${index + 1}: Tên môn học không được để trống`);
  } else if (monHoc.tenMh.toString().length > 50) {
    errors.push(`Dòng ${index + 1}: Tên môn học không được vượt quá 50 ký tự`);
  }
  
  // Validate số tiết
  if (!monHoc.soTiet || isNaN(monHoc.soTiet) || monHoc.soTiet <= 0) {
    errors.push(`Dòng ${index + 1}: Số tiết phải là số nguyên dương`);
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
        
        // Find header row (look for columns containing "mã", "tên", "số tiết")
        let headerRowIndex = -1;
        let headerRow = null;
        
        for (let i = 0; i < nonEmptyRows.length; i++) {
          const row = nonEmptyRows[i];
          const hasRequiredColumns = row.some(cell => {
            const cellStr = cell.toString().toLowerCase();
            return cellStr.includes('mã') || cellStr.includes('tên') || cellStr.includes('tiết');
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
          if (headerStr.includes('mã')) {
            columnMapping.maMh = index;
          } else if (headerStr.includes('tên')) {
            columnMapping.tenMh = index;
          } else if (headerStr.includes('tiết')) {
            columnMapping.soTiet = index;
          }
        });
        
        // Validate required columns
        if (!columnMapping.maMh || !columnMapping.tenMh || !columnMapping.soTiet) {
          reject(new Error('File Excel thiếu các cột bắt buộc: Mã môn học, Tên môn học, Số tiết'));
          return;
        }
        
        // Parse data rows
        const dataRows = nonEmptyRows.slice(headerRowIndex + 1);
        const monHocs = dataRows.map(row => ({
          maMh: row[columnMapping.maMh]?.toString().trim() || '',
          tenMh: row[columnMapping.tenMh]?.toString().trim() || '',
          soTiet: parseInt(row[columnMapping.soTiet]) || 0
        })).filter(monHoc => monHoc.maMh || monHoc.tenMh); // Filter out completely empty rows
        
        resolve(monHocs);
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

const importMonHocs = async (monHocs, onProgress) => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  const total = monHocs.length;
  
  for (let i = 0; i < monHocs.length; i++) {
    const monHoc = monHocs[i];
    
    try {
      // Validate data
      const validationErrors = validateMonHocData(monHoc, i);
      if (validationErrors.length > 0) {
        results.failed++;
        results.errors.push(...validationErrors);
        continue;
      }
      
      // Call API
      await monHocService.createMonHoc(monHoc);
      results.success++;
      
      // Update progress
      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100));
      }
      
    } catch (error) {
      results.failed++;
      const errorMessage = error.response?.data || error.message || 'Lỗi không xác định';
      results.errors.push(`Dòng ${i + 1} (${monHoc.maMh}): ${errorMessage}`);
    }
  }
  
  return results;
};

// Components
const SearchBar = ({ value, onChange }) => (
  <Search
    placeholder="Tìm theo mã hoặc tên môn học"
    onSearch={onChange}
    onChange={(e) => onChange(e.target.value)}
    value={value}
    allowClear
    enterButton={<SearchOutlined />}
    style={{ marginBottom: '16px', width: 400 }}
  />
);

const Header = ({ onCreateClick, onExportClick, onImportClick }) => (
  <div style={{ 
    marginBottom: '16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  }}>
    <Title level={2}>Quản lý Môn học</Title>
    <Space>
      <Button 
        type="default" 
        icon={<UploadOutlined />} 
        onClick={onImportClick}
        title="Import file Excel"
      >
        Import Excel
      </Button>
      <Button 
        type="default" 
        icon={<DownloadOutlined />} 
        onClick={onExportClick}
        title="Xuất báo cáo Excel"
      >
        Xuất Excel
      </Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
        Thêm Môn học Mới
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

const MonHocForm = ({ form, editingMaMh }) => (
  <Form form={form} layout="vertical">
    {!editingMaMh && (
      <Form.Item name="maMh" label="Mã môn học" rules={FORM_RULES.maMh}>
        <Input />
      </Form.Item>
    )}
    <Form.Item name="tenMh" label="Tên môn học" rules={FORM_RULES.tenMh}>
      <Input />
    </Form.Item>
    <Form.Item name="soTiet" label="Số tiết" rules={FORM_RULES.soTiet}>
      <InputNumber style={{ width: '100%' }} />
    </Form.Item>
  </Form>
);

const MonHocModal = ({ visible, title, onOk, onCancel, form, editingMaMh }) => (
  <Modal
    title={title}
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    width={600}
  >
    <MonHocForm form={form} editingMaMh={editingMaMh} />
  </Modal>
);

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

      const results = await importMonHocs(data, setImportProgress);
      setImportResults(results);
      
      if (results.success > 0) {
        message.success(`Import thành công ${results.success}/${data.length} môn học`);
        onImport(); // Refresh data
      }
      
      if (results.failed > 0) {
        message.warning(`${results.failed} môn học import thất bại`);
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
    { title: 'Mã môn học', dataIndex: 'maMh', key: 'maMh' },
    { title: 'Tên môn học', dataIndex: 'tenMh', key: 'tenMh' },
    { title: 'Số tiết', dataIndex: 'soTiet', key: 'soTiet' }
  ];

  return (
    <Modal
      title="Import Môn học từ Excel"
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
          description="File Excel cần có các cột: Mã môn học, Tên môn học, Số tiết"
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

// Main Component
export const DanhSachMonHocComponents = () => {
  // State management
  const [monHocs, setMonHocs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [editingMaMh, setEditingMaMh] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm();

  // Data fetching
  const fetchMonHocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await monHocService.getAllMonHocs();
      setMonHocs(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching monhocs:', error);
      setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonHocs();
  }, []);

  // Event handlers
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = filterData(monHocs, value);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaMh(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingMaMh(record.maMh);
    setModalVisible(true);
  };

  const handleDelete = async (maMh) => {
    try {
      await monHocService.deleteMonHoc(maMh);
      message.success('Xóa môn học thành công');
      fetchMonHocs();
    } catch (error) {
      message.error(error.response?.data || 'Không thể xóa môn học');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMaMh) {
        await monHocService.updateMonHoc(editingMaMh, values);
        message.success('Cập nhật môn học thành công');
      } else {
        await monHocService.createMonHoc(values);
        message.success('Thêm môn học mới thành công');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchMonHocs();
    } catch (error) {
      message.error(error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleExport = () => {
    exportToExcel(filteredData);
  };

  const handleImport = () => {
    setImportModalVisible(true);
  };

  const handleImportComplete = () => {
    setImportModalVisible(false);
    fetchMonHocs(); // Refresh data after import
  };

  // Table configuration
  const columns = createTableColumns(handleEdit, handleDelete);
  const modalTitle = editingMaMh ? 'Cập nhật Môn học' : 'Thêm Môn học Mới';

  return (
    <div style={{ padding: '24px' }}>
      <Header 
        onCreateClick={handleCreate} 
        onExportClick={handleExport}
        onImportClick={handleImport}
      />
      <SearchBar value={searchText} onChange={handleSearch} />
      <ErrorAlert error={error} />
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="maMh"
          pagination={{
            pageSize: PAGE_SIZE,
            current: currentPage,
            onChange: setCurrentPage,
          }}
        />
      </Spin>

      <MonHocModal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        editingMaMh={editingMaMh}
      />

      <ImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onImport={handleImportComplete}
      />
    </div>
  );
};