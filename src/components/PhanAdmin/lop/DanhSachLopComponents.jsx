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
  Select,
  Typography,
  Alert,
  Spin,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { khoaService } from '../../../services/PhanAdmin/khoaService.js';
import { lopService } from '../../../services/PhanAdmin/lopService.js';

const { Option } = Select;
const { Title } = Typography;
const { Search } = Input;

export const DanhSachLopComponents = () => {
  const [allLops, setAllLops] = useState([]);
  const [filteredLops, setFilteredLops] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMaLop, setEditingMaLop] = useState(null);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [sorter, setSorter] = useState({
    field: 'maLop',
    order: 'ascend',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allLops, selectedKhoa, searchText, pagination.current, pagination.pageSize, sorter]);

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

  const applyFilters = () => {
    let data = [...allLops];

    // Lọc theo khoa
    if (selectedKhoa) {
      data = data.filter(item => item.maKhoa === selectedKhoa);
    }

    // Tìm kiếm
    if (searchText) {
      const lower = searchText.toLowerCase();
      data = data.filter(item =>
        item.maLop.toLowerCase().includes(lower) || item.tenLop.toLowerCase().includes(lower)
      );
    }

    // Sắp xếp
    if (sorter?.field && sorter?.order) {
      data.sort((a, b) => {
        const valA = a[sorter.field];
        const valB = b[sorter.field];
        if (typeof valA === 'string') {
          return sorter.order === 'ascend'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sorter.order === 'ascend' ? valA - valB : valB - valA;
        }
      });
    }

    // Phân trang
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);
    setFilteredLops(paginated);
  };

  const handleTableChange = (newPagination, filters, newSorter) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    setSorter({
      field: newSorter.field || 'maLop',
      order: newSorter.order || 'ascend',
    });
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
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

  const columns = [
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
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.maLop)}>
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Quản lý Lớp</Title>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Chọn khoa"
            allowClear
            onChange={(value) => {
              setSelectedKhoa(value);
              setPagination({ ...pagination, current: 1 });
            }}
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
  onChange={(e) => {
    const value = e.target.value;
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }}
  style={{ width: 250 }}
  enterButton={<SearchOutlined />}
/>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Thêm Lớp Mới</Button>
        </Space>
      </div>

      {error && (
        <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: '16px' }} />
      )}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredLops}
          rowKey="maLop"
          pagination={{
            ...pagination,
            total: allLops.filter(item =>
              (!selectedKhoa || item.maKhoa === selectedKhoa) &&
              (!searchText || item.maLop.toLowerCase().includes(searchText.toLowerCase()) || item.tenLop.toLowerCase().includes(searchText.toLowerCase()))
            ).length,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
        />
      </Spin>

      <Modal
        title={editingMaLop ? 'Cập nhật Lớp' : 'Thêm Lớp Mới'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingMaLop && (
            <Form.Item name="maLop" label="Mã lớp" rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="tenLop" label="Tên lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="maKhoa" label="Khoa" rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}>
            <Select>
              {khoas.map(khoa => (
                <Option key={khoa.maKhoa} value={khoa.maKhoa}>
                  {khoa.tenKhoa}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="gvcn" label="GVCN" rules={[{ required: true, message: 'Vui lòng nhập tên GVCN' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="sdtGvcn"
            label="SĐT GVCN"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại GVCN' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
