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
import { khoaService } from '../../../services/Admin/khoaService.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';

const { Title } = Typography;
const { Search } = Input;
const { Dragger } = Upload;




export const DanhSachKhoaComponents = () => {
  // State management
  const [khoas, setKhoas] = useState([]);
  const [filteredKhoas, setFilteredKhoas] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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


    </div>
  );
};