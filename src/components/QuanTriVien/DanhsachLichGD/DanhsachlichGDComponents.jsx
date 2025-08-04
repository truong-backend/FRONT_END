import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker,
  message, Typography, Alert, Spin
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';

// Services
import { LichGdService } from '../../../services/Admin/LichGdService';
import { monHocService } from '../../../services/Admin/monHocService.js';
import { teacherService } from '../../../services/Admin/teacherService.js';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

// ==========================
// CONFIGURATION
// ==========================
const PAGE_SIZE = 10;
const PERIOD_RANGE = { min: 1, max: 20 };
const GROUP_COUNT = 100;
const SEMESTER_OPTIONS = [
  { value: 1, label: 'Học kỳ 1' },
  { value: 2, label: 'Học kỳ 2' },
  { value: 3, label: 'Học kỳ 3' },
];

const FORM_RULES = {
  maGv: [{ required: true, message: 'Vui lòng chọn giáo viên' }],
  maMh: [{ required: true, message: 'Vui lòng chọn môn học' }],
  nmh: [{ required: true, message: 'Vui lòng chọn nhóm môn học' }],
  phongHoc: [{ required: true, message: 'Vui lòng nhập phòng học' }],
  ngayBd: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }],
  ngayKt: [
    { required: true, message: 'Vui lòng chọn ngày kết thúc' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || value.isAfter(getFieldValue('ngayBd'))) return Promise.resolve();
        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
      },
    }),
  ],
  stBd: [
    { required: true, message: 'Vui lòng nhập tiết bắt đầu' },
    { type: 'number', min: PERIOD_RANGE.min, max: PERIOD_RANGE.max, message: `Tiết từ ${PERIOD_RANGE.min}-${PERIOD_RANGE.max}` }
  ],
  stKt: [
    { required: true, message: 'Vui lòng nhập tiết kết thúc' },
    { type: 'number', min: PERIOD_RANGE.min, max: PERIOD_RANGE.max, message: `Tiết từ ${PERIOD_RANGE.min}-${PERIOD_RANGE.max}` },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('stBd') < value) return Promise.resolve();
        return Promise.reject(new Error('Tiết kết thúc phải sau tiết bắt đầu'));
      },
    }),
  ],
  hocKy: [{ required: true, message: 'Vui lòng chọn học kỳ' }],
};

// ==========================
// UTILITY FUNCTIONS
// ==========================
const filterData = (data, searchText) => {
  if (!searchText) return data;
  const lowerSearch = searchText.toLowerCase();
  return data.filter(item =>
    item.tenGv?.toLowerCase().includes(lowerSearch) ||
    item.tenMh?.toLowerCase().includes(lowerSearch)
  );
};

const createTableColumns = (onEdit, onDelete) => [
  { title: 'Mã GV', dataIndex: 'maGv', width: 100 },
  { title: 'Tên GV', dataIndex: 'tenGv', width: 150 },
  { title: 'Mã MH', dataIndex: 'maMh', width: 100 },
  { title: 'Tên MH', dataIndex: 'tenMh', width: 150 },
  { title: 'Nhóm MH', dataIndex: 'nmh', width: 100 },
  { title: 'Phòng học', dataIndex: 'phongHoc', width: 100 },
  { title: 'Ngày bắt đầu', dataIndex: 'ngayBd', width: 120, render: t => moment(t).format('DD/MM/YYYY') },
  { title: 'Ngày kết thúc', dataIndex: 'ngayKt', width: 120, render: t => moment(t).format('DD/MM/YYYY') },
  { title: 'Tiết bắt đầu', dataIndex: 'stBd', width: 90 },
  { title: 'Tiết kết thúc', dataIndex: 'stKt', width: 90 },
  { title: 'Học kỳ', dataIndex: 'hocKy', width: 80, render: t => `Học kỳ ${t}` },
  {
    title: 'Thao tác',
    key: 'action',
    width: 150,
    render: (_, record) => (
      <Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
        <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(record.id)}>Xóa</Button>
      </Space>
    ),
  },
];

// ==========================
// SUB-COMPONENTS
// ==========================
const SearchBar = ({ onChange }) => (
  <Search
    placeholder="Tìm theo tên GV hoặc tên MH"
    onSearch={onChange}
    onChange={(e) => onChange(e.target.value)}
    allowClear
    enterButton={<SearchOutlined />}
    style={{ marginBottom: '16px', width: 400 }}
  />
);

const Header = ({ onCreateClick }) => (
  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
    <Title level={2}>Quản lý Lịch giảng dạy</Title>
    <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>Thêm lịch giảng dạy</Button>
  </div>
);

const ErrorAlert = ({ error }) => error ? (
  <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: '16px' }} />
) : null;

const LichGdForm = ({ form, monHocList, teacherList }) => {
  const groupOptions = useMemo(() =>
    Array.from({ length: GROUP_COUNT }, (_, i) => (
      <Option key={i + 1} value={i + 1}>Nhóm {i + 1}</Option>
    )), []);

  return (
    <Form form={form} layout="vertical" initialValues={{ hocKy: 1, nmh: 1, stBd: 1, stKt: 2 }}>
      <Form.Item name="maGv" label="Giáo viên" rules={FORM_RULES.maGv}>
        <Select placeholder="Chọn giáo viên" showSearch optionFilterProp="children">
          {teacherList.map(gv => <Option key={gv.maGv} value={gv.maGv}>{gv.maGv} - {gv.tenGv}</Option>)}
        </Select>
      </Form.Item>

      <Form.Item name="maMh" label="Môn học" rules={FORM_RULES.maMh}>
        <Select placeholder="Chọn môn học" showSearch optionFilterProp="children">
          {monHocList.map(mh => <Option key={mh.maMh} value={mh.maMh}>{mh.maMh} - {mh.tenMh}</Option>)}
        </Select>
      </Form.Item>

      <Form.Item name="nmh" label="Nhóm môn học" rules={FORM_RULES.nmh}>
        <Select placeholder="Chọn nhóm">{groupOptions}</Select>
      </Form.Item>

      <Form.Item name="phongHoc" label="Phòng học" rules={FORM_RULES.phongHoc}>
        <Input />
      </Form.Item>

      <Form.Item name="ngayBd" label="Ngày bắt đầu" rules={FORM_RULES.ngayBd}>
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="ngayKt" label="Ngày kết thúc" rules={FORM_RULES.ngayKt}>
        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="stBd" label="Tiết bắt đầu" rules={FORM_RULES.stBd}>
        <InputNumber min={PERIOD_RANGE.min} max={PERIOD_RANGE.max} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="stKt" label="Tiết kết thúc" rules={FORM_RULES.stKt}>
        <InputNumber min={PERIOD_RANGE.min} max={PERIOD_RANGE.max} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="hocKy" label="Học kỳ" rules={FORM_RULES.hocKy}>
        <Select>{SEMESTER_OPTIONS.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}</Select>
      </Form.Item>
    </Form>
  );
};

const LichGdModal = ({ visible, title, onOk, onCancel, form, monHocList, teacherList }) => (
  <Modal title={title} open={visible} onOk={onOk} onCancel={onCancel} destroyOnClose width={600}>
    <LichGdForm form={form} monHocList={monHocList} teacherList={teacherList} />
  </Modal>
);

// ==========================
// MAIN COMPONENT
// ==========================
export const DanhsachlichGDComponents = () => {
  const [form] = Form.useForm();
  const [lichGdList, setLichGdList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [monHocList, setMonHocList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lichGd, monHoc, teachers] = await Promise.all([
        LichGdService.getAllLichGdNoPaging(),
        monHocService.getAllMonHocs(),
        teacherService.getListGiaoVien(),
      ]);
      setLichGdList(lichGd);
      setFilteredData(lichGd);
      setMonHocList(monHoc);
      setTeacherList(teachers);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    setFilteredData(filterData(lichGdList, value));
    setCurrentPage(1);
  };

  const handleCreate = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      ngayBd: moment(record.ngayBd),
      ngayKt: moment(record.ngayKt),
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await LichGdService.deleteLichGd(id);
      message.success('Xóa lịch giảng dạy thành công');
      fetchData();
    } catch (err) {
      message.error(err.response?.data || 'Không thể xóa');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        ngayBd: values.ngayBd.format('YYYY-MM-DD'),
        ngayKt: values.ngayKt.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await LichGdService.updateLichGd(editingId, payload);
        message.success('Cập nhật thành công');
      } else {
        await LichGdService.createLichGd(payload);
        message.success('Thêm mới thành công');
      }

      setModalVisible(false);
      fetchData();
    } catch (err) {
      message.error(err.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const columns = createTableColumns(handleEdit, handleDelete);
  const modalTitle = editingId ? 'Cập nhật lịch giảng dạy' : 'Thêm lịch giảng dạy';

  return (
    <div style={{ padding: '24px' }}>
      <Header onCreateClick={handleCreate} />
      <SearchBar value={searchText} onChange={handleSearch} />
      <ErrorAlert error={error} />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: PAGE_SIZE,
            current: currentPage,
            onChange: setCurrentPage,
          }}
          scroll={{ x: 1400 }}
        />
      </Spin>

      <LichGdModal
        visible={modalVisible}
        title={modalTitle}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
        monHocList={monHocList}
        teacherList={teacherList}
      />
    </div>
  );
};
