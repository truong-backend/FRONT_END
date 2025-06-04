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
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { khoaService } from '../../services/khoaService';
import { lopService } from '../../services/lopService';

const { Option } = Select;
const { Title } = Typography;

const ListKhoa = () => {
  const [lops, setLops] = useState([]);
  const [khoas, setKhoas] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMaLop, setEditingMaLop] = useState(null);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    sortField: 'maLop',
    sortOrder: 'ascend',
  });

  // Fetch danh sách khoa
  const fetchKhoas = async () => {
    try {
      setError(null);
      const data = await khoaService.getKhoas();
      setKhoas(data);
    } catch (error) {
      console.error('Error fetching khoas:', error);
      setError('Không thể tải danh sách khoa. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách khoa');
      setKhoas([]);
    }
  };

  // Fetch danh sách lớp
  const fetchLops = async () => {
    try {
      setLoading(true);
      setError(null);
      const { current, pageSize, sortField, sortOrder } = pagination;
      const params = {
        page: current - 1,
        size: pageSize,
        sortBy: sortField,
        sortDir: sortOrder === 'ascend' ? 'asc' : 'desc',
      };

      if (selectedKhoa) {
        params.maKhoa = selectedKhoa;
      }

      const data = await lopService.getLops(params);
      if (data && data.content) {
        setLops(data.content);
        setTotalElements(data.totalElements);
      }
    } catch (error) {
      console.error('Error fetching lops:', error);
      setError('Không thể tải danh sách lớp. Vui lòng thử lại sau.');
      message.error('Không thể tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhoas();
  }, []);

  useEffect(() => {
    fetchLops();
  }, [pagination, selectedKhoa]);

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...newPagination,
      sortField: sorter.field || 'maLop',
      sortOrder: sorter.order || 'ascend',
    });
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingMaLop(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      maLop: record.maLop,
      tenLop: record.tenLop,
      maKhoa: record.maKhoa,
      gvcn: record.gvcn,
      sdtGvcn: record.sdtGvcn,
    });
    setEditingMaLop(record.maLop);
    setModalVisible(true);
  };

  const handleDelete = async (maLop) => {
    try {
      await lopService.deleteLop(maLop);
      message.success('Xóa lớp thành công');
      fetchLops();
    } catch (error) {
      message.error(error.response?.data || 'Không thể xóa lớp');
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
      fetchLops();
    } catch (error) {
      message.error(error.response?.data || 'Có lỗi xảy ra');
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
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.maLop)}
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
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
            onChange={setSelectedKhoa}
          >
            {Array.isArray(khoas) && khoas.map(khoa => (
              <Option key={khoa.maKhoa} value={khoa.maKhoa}>
                {khoa.tenKhoa}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm Lớp Mới
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={lops}
          rowKey="maLop"
          pagination={{
            ...pagination,
            total: totalElements,
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
        <Form
          form={form}
          layout="vertical"
        >
          {!editingMaLop && (
            <Form.Item
              name="maLop"
              label="Mã lớp"
              rules={[
                { required: true, message: 'Vui lòng nhập mã lớp' },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            name="tenLop"
            label="Tên lớp"
            rules={[
              { required: true, message: 'Vui lòng nhập tên lớp' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="maKhoa"
            label="Khoa"
            rules={[
              { required: true, message: 'Vui lòng chọn khoa' },
            ]}
          >
            <Select>
              {khoas.map(khoa => (
                <Option key={khoa.maKhoa} value={khoa.maKhoa}>
                  {khoa.tenKhoa}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="gvcn"
            label="Giáo viên chủ nhiệm"
            rules={[
              { required: true, message: 'Vui lòng nhập tên GVCN' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="sdtGvcn"
            label="Số điện thoại GVCN"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại GVCN' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListKhoa; 