import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Space,
  InputNumber
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { LichGdService } from "../../services/LichGdService";
import { monHocService } from "../../services/monHocService";
import { teacherService } from "../../services/teacherService";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

export const ListCalendar = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [monHocList, setMonHocList] = useState([]);
  const [giaoVienList, setGiaoVienList] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('ascend');

  useEffect(() => {
    fetchData();
    fetchMonHocList();
    fetchGiaoVienList();
  }, []);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const page = params.current ? params.current - 1 : 0;
      const size = params.pageSize || 10;
      const sortBy = params.sortField || sortField;
      const sortDir = params.sortOrder === 'ascend' ? 'asc' : 'desc';

      const response = await LichGdService.getAllLichGd(page, size, sortBy, sortDir);
      
      if (response) {
        setData(response.content || []);
        setPagination({
          ...pagination,
          total: response.totalElements || 0,
          current: page + 1,
          pageSize: size,
        });
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu: ' + error.message);
    }
    setLoading(false);
  };

  const fetchMonHocList = async () => {
    try {
      const response = await monHocService.getMonHocs();
      setMonHocList(response || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách môn học: ' + error.message);
    }
  };

  const fetchGiaoVienList = async () => {
    try {
      const response = await teacherService.getListGiaoVien();
      setGiaoVienList(response || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách giáo viên: ' + error.message);
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setSortField(sorter.field || 'id');
    setSortOrder(sorter.order || 'ascend');
    fetchData({
      ...newPagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [ngayBd, ngayKt] = values.dateRange;
      
      const formData = {
        ...values,
        ngayBd: ngayBd.format('YYYY-MM-DD'),
        ngayKt: ngayKt.format('YYYY-MM-DD'),
      };
      delete formData.dateRange;

      if (editingId) {
        await LichGdService.updateLichGd(editingId, formData);
        message.success('Cập nhật lịch giảng dạy thành công!');
      } else {
        await LichGdService.createLichGd(formData);
        message.success('Thêm lịch giảng dạy thành công!');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.ngayBd), dayjs(record.ngayKt)],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await LichGdService.deleteLichGd(id);
      message.success('Xóa lịch giảng dạy thành công!');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi xóa: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Giáo viên',
      dataIndex: 'tenGv',
      sorter: true,
    },
    {
      title: 'Môn học',
      dataIndex: 'tenMh',
      sorter: true,
    },
    {
      title: 'Phòng học',
      dataIndex: 'phongHoc',
      sorter: true,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngayBd',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      sorter: true,
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngayKt',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      sorter: true,
    },
    {
      title: 'Tiết bắt đầu',
      dataIndex: 'stBd',
      sorter: true,
    },
    {
      title: 'Tiết kết thúc',
      dataIndex: 'stKt',
      sorter: true,
    },
    {
      title: 'Học kỳ',
      dataIndex: 'hocKy',
      sorter: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
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
    <>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Lịch Giảng Dạy</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title={editingId ? "Sửa lịch giảng dạy" : "Thêm lịch giảng dạy"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="maGv"
            label="Giáo viên"
            rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
          >
            <Select placeholder="Chọn giáo viên">
              {giaoVienList.map(gv => (
                <Option key={gv.maGv} value={gv.maGv}>{gv.tenGv}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="maMh"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
          >
            <Select placeholder="Chọn môn học">
              {monHocList.map(mh => (
                <Option key={mh.maMh} value={mh.maMh}>{mh.tenMh}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="phongHoc"
            label="Phòng học"
            rules={[{ required: true, message: 'Vui lòng nhập phòng học!' }]}
          >
            <Input placeholder="Nhập phòng học" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <RangePicker format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="stBd"
            label="Tiết bắt đầu"
            rules={[{ required: true, message: 'Vui lòng nhập tiết bắt đầu!' }]}
          >
            <InputNumber min={1} max={15} />
          </Form.Item>

          <Form.Item
            name="stKt"
            label="Tiết kết thúc"
            rules={[{ required: true, message: 'Vui lòng nhập tiết kết thúc!' }]}
          >
            <InputNumber min={1} max={15} />
          </Form.Item>

          <Form.Item
            name="hocKy"
            label="Học kỳ"
            rules={[{ required: true, message: 'Vui lòng nhập học kỳ!' }]}
          >
            <InputNumber min={1} max={3} />
          </Form.Item>

          <Form.Item
            name="nmh"
            label="Nhóm môn học"
            rules={[{ required: true, message: 'Vui lòng nhập nhóm môn học!' }]}
          >
            <InputNumber min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ListCalendar;
