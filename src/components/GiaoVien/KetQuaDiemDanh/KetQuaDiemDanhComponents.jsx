import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Modal, Input, Alert, Spin, Typography, message
} from 'antd';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import { GiaoVienService } from '../../../services/GiaoVien/HoSo/GiaoVienService';

const { Title } = Typography;
const { Search } = Input;

// =================== CONFIG ===================
const PAGE_SIZE = 10;

// =================== UTILS ===================
const filterData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter(item =>
    item.tenMh.toLowerCase().includes(lowerSearch) ||
    item.maMh.toLowerCase().includes(lowerSearch)
  );
};

const ViewMonHocColumns = (onView) => [
  { title: 'Mã môn học', dataIndex: 'maMh', key: 'maMh', width: '20%' },
  { title: 'Tên môn học', dataIndex: 'tenMh', key: 'tenMh', width: '40%' },
  { title: 'Phòng học', dataIndex: 'phongHoc', key: 'phongHoc', width: '20%' },
  { title: 'Nhóm', dataIndex: 'nmh', key: 'nmh', width: '10%' },
  {
    title: 'Kết quả điểm danh',
    key: 'action',
    width: '10%',
    render: (_, record) => (
      <Button type="primary" onClick={() => onView(record)}>
        Xem kết quả
      </Button>
    ),
  },
];

const createThongKeColumns = () => [
  { title: 'MSSV', dataIndex: 'maSv', key: 'maSv', width: 100 },
  { title: 'Họ và tên', dataIndex: 'tenSv', key: 'tenSv', width: 200 },
  { title: 'Lớp', dataIndex: 'tenLop', key: 'tenLop', width: 120 },
  { title: 'Số buổi học', dataIndex: 'so_buoi_hoc', key: 'so_buoi_hoc', width: 120 },
  { title: 'Số buổi điểm danh', dataIndex: 'so_buoi_diem_danh', key: 'so_buoi_diem_danh', width: 150 },
  { title: 'Số buổi vắng', dataIndex: 'so_buoi_chua_diem_danh', key: 'so_buoi_chua_diem_danh', width: 150 },
];

// =================== COMPONENTS ===================
const SearchBar = ({ onChange }) => (
  <Search
    placeholder="Tìm theo mã hoặc tên môn học"
    onSearch={onChange}
    onChange={(e) => onChange(e.target.value)}
    allowClear
    enterButton={<SearchOutlined />}
    style={{ marginBottom: '16px', width: 400 }}
  />
);

const Header = () => (
  <div style={{
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Title level={2}>Kết quả điểm danh</Title>
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

const ThongKeModal = ({ visible, onCancel, data, pagination, onPageChange, onExport }) => (
  <Modal
    title="Kết quả điểm danh"
    open={visible}
    onCancel={onCancel}
    footer={null}
    centered
    width={900}
  >
    <Table
      dataSource={data}
      columns={createThongKeColumns()}
      rowKey="maSv"
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: onPageChange,
      }}
      scroll={{ x: 'max-content' }}
    />
    <div style={{ marginTop: '16px', textAlign: 'left' }}>
      <Button
        type="primary"
        icon={<FileExcelOutlined />}
        className="bg-green-600"
        onClick={onExport}
      >
        Xuất Excel
      </Button>
    </div>
  </Modal>
);

// =================== MAIN COMPONENT ===================
export const KetQuaDiemDanhComponents = () => {
  const [monHocs, setMonHocs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);
  const [thongKeData, setThongKeData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });

  // Fetch danh sách môn học
  const fetchMonHocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await GiaoVienService.getMonHocForDiemDanh();
      setMonHocs(res);
      setFilteredData(res);
    } catch (err) {
      setError('Không thể tải danh sách môn học.');
      message.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  // Fetch thống kê điểm danh
  const fetchThongKe = async (monhoc) => {
    try {
      setLoading(true);
      setError(null);
      const res = await GiaoVienService.thongKeDiemDanh(monhoc.maMh, monhoc.nmh, monhoc.maGd);
      setThongKeData(res);
      setPagination((prev) => ({ ...prev, total: res.length }));
    } catch (err) {
      setError('Không thể tải kết quả điểm danh.');
      message.error('Không thể tải kết quả điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = filterData(monHocs, value);
    setFilteredData(filtered);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleView = async (record) => {
    setSelectedMonHoc(record);
    setModalVisible(true);
    await fetchThongKe(record);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMonHoc(null);
    setThongKeData([]);
  };

  const handleExport = async () => {
    if (!selectedMonHoc) return;
    try {
      const res = await GiaoVienService.ExportThongKe(selectedMonHoc.maMh, selectedMonHoc.nmh, selectedMonHoc.maGd);
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thong_ke_diem_danh.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      message.error('Lỗi khi xuất Excel');
    }
  };

  useEffect(() => {
    fetchMonHocs();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Header />
      <SearchBar value={searchText} onChange={handleSearch} />
      <ErrorAlert error={error} />

      <Spin spinning={loading}>
        <Table
          columns={ViewMonHocColumns(handleView)}
          dataSource={filteredData}
          rowKey={(record) => `${record.maMh}-${record.nmh}`}
          pagination={false}
        />
      </Spin>

      <ThongKeModal
        visible={modalVisible}
        onCancel={handleCloseModal}
        data={thongKeData}
        pagination={pagination}
        onPageChange={(page, pageSize) => setPagination({ ...pagination, current: page, pageSize })}
        onExport={handleExport}
      />
    </div>
  );
};
