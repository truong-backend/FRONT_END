import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, message, 
  Popconfirm, Select, Typography, Alert, Spin, Upload, Progress
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, 
  DownloadOutlined, UploadOutlined, InboxOutlined 
} from '@ant-design/icons';
import { khoaService } from '../../../services/Admin/khoaService.js';
import { lopService } from '../../../services/Admin/lopService.js';


const { Option } = Select;
const { Title } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

// Configuration
const DEFAULT_PAGINATION = { current: 1, pageSize: 10 };
const DEFAULT_SORTER = { field: 'maLop', order: 'ascend' };

const FORM_RULES = {
  maLop: [{ required: true, message: 'Vui lòng nhập mã lớp' }],
  tenLop: [{ required: true, message: 'Vui lòng nhập tên lớp' }],
  maKhoa: [{ required: true, message: 'Vui lòng chọn khoa' }],
  gvcn: [{ required: true, message: 'Vui lòng nhập tên GVCN' }],
  sdtGvcn: [
    { required: true, message: 'Vui lòng nhập số điện thoại GVCN' },
    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
  ]
};

// Excel column mapping
const EXCEL_COLUMNS = {
  'Mã Lớp': 'maLop',
  'Tên Lớp': 'tenLop', 
  'Mã Khoa': 'maKhoa',
  'GVCN': 'gvcn',
  'SĐT GVCN': 'sdtGvcn'
};

// Utility functions
const applyFilters = (data, filters) => {
  const { selectedKhoa, searchText } = filters;
  let result = [...data];

  if (selectedKhoa) {
    result = result.filter(item => item.maKhoa === selectedKhoa);
  }

  if (searchText) {
    const lower = searchText.toLowerCase();
    result = result.filter(item =>
      item.maLop.toLowerCase().includes(lower) || 
      item.tenLop.toLowerCase().includes(lower)
    );
  }

  return result;
};

const applySorting = (data, sorter) => {
  if (!sorter?.field || !sorter?.order) return data;

  return [...data].sort((a, b) => {
    const valA = a[sorter.field];
    const valB = b[sorter.field];
    
    const comparison = typeof valA === 'string' 
      ? valA.localeCompare(valB)
      : valA - valB;
    
    return sorter.order === 'ascend' ? comparison : -comparison;
  });
};

const applyPagination = (data, pagination) => {
  const { current, pageSize } = pagination;
  const start = (current - 1) * pageSize;
  return data.slice(start, start + pageSize);
};

const createTableColumns = (onEdit, onDelete) => [
  {
    title: 'Mã lớp',
    dataIndex: 'maLop',
    sorter: true,
    width: '15%',
  },
  {
    title: 'Tên lớp',
    dataIndex: 'tenLop',
    sorter: true,
    width: '20%',
  },
  {
    title: 'Khoa',
    dataIndex: 'tenKhoa',
    width: '20%',
  },
  {
    title: 'GVCN',
    dataIndex: 'gvcn',
    sorter: true,
    width: '15%',
  },
  {
    title: 'SĐT GVCN',
    dataIndex: 'sdtGvcn',
    width: '15%',
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: '15%',
    render: (_, record) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
          Sửa
        </Button>
        <Popconfirm 
          title="Bạn có chắc chắn muốn xóa?" 
          onConfirm={() => onDelete(record.maLop)}
        >
          <Button danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];

// Validate Excel data
const validateExcelRow = (row, index, khoas) => {
  const errors = [];
  
  // Check required fields
  if (!row.maLop?.trim()) {
    errors.push(`Dòng ${index + 1}: Thiếu mã lớp`);
  }
  
  if (!row.tenLop?.trim()) {
    errors.push(`Dòng ${index + 1}: Thiếu tên lớp`);
  }
  
  if (!row.maKhoa?.trim()) {
    errors.push(`Dòng ${index + 1}: Thiếu mã khoa`);
  } else {
    // Check if maKhoa exists
    const khoaExists = khoas.some(khoa => khoa.maKhoa === row.maKhoa.trim());
    if (!khoaExists) {
      errors.push(`Dòng ${index + 1}: Mã khoa "${row.maKhoa}" không tồn tại`);
    }
  }
  
  if (!row.gvcn?.trim()) {
    errors.push(`Dòng ${index + 1}: Thiếu tên GVCN`);
  }
  
  if (!row.sdtGvcn?.trim()) {
    errors.push(`Dòng ${index + 1}: Thiếu số điện thoại GVCN`);
  } else {
    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(row.sdtGvcn.toString().trim())) {
      errors.push(`Dòng ${index + 1}: Số điện thoại không hợp lệ`);
    }
  }
  
  return errors;
};

// Components
const Header = ({ onCreateClick}) => (
  <div style={{ 
    marginBottom: '16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  }}>
    <Title level={2}>Quản lý Lớp</Title>
    <Space>

     
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
        Thêm Lớp Mới
      </Button>
    </Space>
  </div>
);

const FilterControls = ({ 
  khoas, 
  selectedKhoa, 
  onKhoaChange, 
  searchText, 
  onSearchChange 
}) => (
  <Space style={{ marginBottom: '16px', width: '100%' }}>
    <Select
      style={{ width: 200 }}
      placeholder="Chọn khoa"
      allowClear
      value={selectedKhoa}
      onChange={onKhoaChange}
    >
      {khoas.map(khoa => (
        <Option key={khoa.maKhoa} value={khoa.maKhoa}>
          {khoa.tenKhoa}
        </Option>
      ))}
    </Select>
    
    <Search
      placeholder="Tìm mã/tên lớp"
      allowClear
      value={searchText}
      onChange={(e) => onSearchChange(e.target.value)}
      style={{ width: 250 }}
      enterButton={<SearchOutlined />}
    />
  </Space>
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

const LopForm = ({ form, khoas, editingMaLop }) => (
  <Form form={form} layout="vertical">
    {!editingMaLop && (
      <Form.Item name="maLop" label="Mã lớp" rules={FORM_RULES.maLop}>
        <Input />
      </Form.Item>
    )}
    
    <Form.Item name="tenLop" label="Tên lớp" rules={FORM_RULES.tenLop}>
      <Input />
    </Form.Item>
    
    <Form.Item name="maKhoa" label="Khoa" rules={FORM_RULES.maKhoa}>
      <Select placeholder="Chọn khoa">
        {khoas.map(khoa => (
          <Option key={khoa.maKhoa} value={khoa.maKhoa}>
            {khoa.tenKhoa}
          </Option>
        ))}
      </Select>
    </Form.Item>
    
    <Form.Item name="gvcn" label="GVCN" rules={FORM_RULES.gvcn}>
      <Input />
    </Form.Item>
    
    <Form.Item name="sdtGvcn" label="SĐT GVCN" rules={FORM_RULES.sdtGvcn}>
      <Input />
    </Form.Item>
  </Form>
);

const LopModal = ({ visible, title, onOk, onCancel, form, khoas, editingMaLop }) => (
  <Modal
    title={title}
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    destroyOnClose
    width={600}
  >
    <LopForm form={form} khoas={khoas} editingMaLop={editingMaLop} />
  </Modal>
);



// Main Component
export const DanhSachLopComponents = () => {
  // State management
  const [allLops, setAllLops] = useState([]);
  const [filteredLops, setFilteredLops] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [editingMaLop, setEditingMaLop] = useState(null);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sorter, setSorter] = useState(DEFAULT_SORTER);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [form] = Form.useForm();

  // Excel export function
  const exportToExcel = () => {
    try {
      // Get all filtered data (not just current page)
      const allFilteredData = applyFilters(allLops, { selectedKhoa, searchText });
      const sortedData = applySorting(allFilteredData, sorter);
      
      // Prepare data for export
      const exportData = sortedData.map((item, index) => ({
        'STT': index + 1,
        'Mã Lớp': item.maLop,
        'Tên Lớp': item.tenLop,
        'Khoa': item.tenKhoa,
        'GVCN': item.gvcn,
        'SĐT GVCN': item.sdtGvcn,
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 12 }, // Mã Lớp
        { wch: 20 }, // Tên Lớp
        { wch: 25 }, // Khoa
        { wch: 20 }, // GVCN
        { wch: 15 }, // SĐT GVCN
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách Lớp');

      // Generate Excel file and save
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Generate filename with current date and filters
      const currentDate = new Date().toISOString().split('T')[0];
      let fileName = `DanhSachLop_${currentDate}`;
      
      if (selectedKhoa) {
        const khoaName = khoas.find(k => k.maKhoa === selectedKhoa)?.tenKhoa || selectedKhoa;
        fileName += `_${khoaName.replace(/\s+/g, '_')}`;
      }
      
      if (searchText) {
        fileName += `_Search_${searchText.replace(/\s+/g, '_')}`;
      }
      
      fileName += '.xlsx';
      
      saveAs(blob, fileName);
      message.success(`Xuất file Excel thành công! (${exportData.length} bản ghi)`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Có lỗi xảy ra khi xuất file Excel');
    }
  };

  // Excel import function
  const handleImport = async (importData) => {
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      // Validate data
      const errors = [];
      const validData = [];
      
      importData.forEach((row, index) => {
        const rowErrors = validateExcelRow(row, index, khoas);
        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
        } else {
          // Clean and format data
          validData.push({
            maLop: row.maLop.toString().trim(),
            tenLop: row.tenLop.toString().trim(),
            maKhoa: row.maKhoa.toString().trim(),
            gvcn: row.gvcn.toString().trim(),
            sdtGvcn: row.sdtGvcn.toString().trim()
          });
        }
      });

      if (errors.length > 0) {
        message.error(`Phát hiện ${errors.length} lỗi trong dữ liệu`);
        return;
      }

      if (validData.length === 0) {
        message.warning('Không có dữ liệu hợp lệ để import');
        return;
      }

      // Import data using forEach with API calls
      let successCount = 0;
      let errorCount = 0;
      const importErrors = [];

      for (let i = 0; i < validData.length; i++) {
        try {
          await lopService.createLop(validData[i]);
          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error.response?.data || error.message || 'Lỗi không xác định';
          importErrors.push(`Dòng ${i + 1} (${validData[i].maLop}): ${errorMessage}`);
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / validData.length) * 100);
        setImportProgress(progress);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Show results
      if (successCount > 0) {
        message.success(`Import thành công ${successCount} lớp`);
      }
      
      if (errorCount > 0) {
        message.error(`${errorCount} lớp không thể import`);
        console.error('Import errors:', importErrors);
      }


      fetchData();
      
    } catch (error) {
      console.error('Import error:', error);
      message.error('Có lỗi xảy ra trong quá trình import');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  // Data processing
  const processData = () => {
    const filtered = applyFilters(allLops, { selectedKhoa, searchText });
    const sorted = applySorting(filtered, sorter);
    const paginated = applyPagination(sorted, pagination);
    setFilteredLops(paginated);
    return filtered.length; // Return total count for pagination
  };

  // Effects
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    processData();
  }, [allLops, selectedKhoa, searchText, pagination, sorter]);

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      const [lopData, khoaData] = await Promise.all([
        lopService.getLopsKhongPhanTrang(),
        khoaService.getKhoas(),
      ]);
      setAllLops(lopData);
      setKhoas(khoaData);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleTableChange = (newPagination, filters, newSorter) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    setSorter({
      field: newSorter.field || DEFAULT_SORTER.field,
      order: newSorter.order || DEFAULT_SORTER.order,
    });
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleKhoaChange = (value) => {
    setSelectedKhoa(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaLop(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingMaLop(record.maLop);
    setModalVisible(true);
  };

  const handleDelete = async (maLop) => {
    try {
      await lopService.deleteLop(maLop);
      message.success('Xóa lớp thành công');
      fetchData();
    } catch (err) {
      message.error(err.response?.data || 'Không thể xóa lớp');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMaLop) {
        await lopService.updateLop(editingMaLop, values);
        message.success('Cập nhật lớp thành công');
      } else {
        await lopService.createLop(values);
        message.success('Thêm lớp mới thành công');
      }
      
      setModalVisible(false);
      fetchData();
    } catch (err) {
      message.error(err.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  // Configuration
  const columns = createTableColumns(handleEdit, handleDelete);
  const modalTitle = editingMaLop ? 'Cập nhật Lớp' : 'Thêm Lớp Mới';
  const totalFilteredItems = applyFilters(allLops, { selectedKhoa, searchText }).length;
  const hasData = totalFilteredItems > 0;

  return (
    <div style={{ padding: '24px' }}>
      <Header 
        onCreateClick={handleCreate} 
        

        hasData={hasData}
      />
      
      <FilterControls
        khoas={khoas}
        selectedKhoa={selectedKhoa}
        onKhoaChange={handleKhoaChange}
        searchText={searchText}
        onSearchChange={handleSearchChange}
      />

      <ErrorAlert error={error} />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredLops}
          rowKey="maLop"
          pagination={{
            ...pagination,
            total: totalFilteredItems,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
          onChange={handleTableChange}
        />
      </Spin>

      <LopModal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        khoas={khoas}
        editingMaLop={editingMaLop}
      />

    </div>
  );
};