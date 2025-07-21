import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Input,
  Select,
  message,
  Modal,
  Button,
  Form,
  DatePicker,
  InputNumber,
  Space,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Services
import { LichGdService } from '../../../services/Admin/LichGdService';
import { monHocService } from '../../../services/Admin/monHocService.js';
import { teacherService } from '../../../services/Admin/teacherService.js';
import { studentService } from '../../../services/Admin/studentService.js';
import { lichHocService } from '../../../services/Admin/lichHocService.js';

const { Option } = Select;

// Constants
const SEMESTER_OPTIONS = [
  { value: 1, label: 'Học kỳ 1' },
  { value: 2, label: 'Học kỳ 2' },
  { value: 3, label: 'Học kỳ 3' },
];

const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 7, label: 'Chủ nhật' },
];

const PERIOD_RANGE = { min: 1, max: 20 };
const GROUP_COUNT = 100;

export const DanhsachlichGDComponents = () => {

  const [studentSearchText, setStudentSearchText] = useState('');
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [currentMaGd, setCurrentMaGd] = useState(null);

  // State management
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Data lists
  const [monHocList, setMonHocList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Fetch functions
  const fetchLichGdList = useCallback(async () => {
    setLoading(true);
    try {
      const result = await LichGdService.getAllLichGdNoPaging();
      setData(result);
      setOriginalData(result);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách lịch giảng dạy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonHocList = useCallback(async () => {
    try {
      const response = await monHocService.getAllMonHocs();
      setMonHocList(response || []);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách môn học: ${error.message}`);
    }
  }, []);

  const fetchTeacherList = useCallback(async () => {
    try {
      const response = await teacherService.getListGiaoVien();
      setTeacherList(response || []);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách giáo viên: ${error.message}`);
    }
  }, []);

  const fetchStudentList = useCallback(async () => {
    try {
      const response = await studentService.getAllStudentsNoPagination();
      setStudentList(response || []);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách sinh viên: ${error.message}`);
    }
  }, []);

  // Fetch enrolled students for a specific teaching schedule
  const fetchEnrolledStudents = useCallback(async (maGd) => {
    try {
      const response = await lichHocService.getSinhVienDaHoc(maGd);
      setEnrolledStudents(response || []);

    } catch (error) {
      message.error(`Lỗi khi tải danh sách sinh viên đã đăng ký: ${error.message}`);
    }
  }, []);

  // Fetch available students (not enrolled yet)
  const fetchAvailableStudents = useCallback(async (maGd) => {
    try {
      const response = await lichHocService.getSinhVienChuaHoc(maGd);
      setAvailableStudents(response || []);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách sinh viên chưa học: ${error.message}`);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    Promise.all([
      fetchLichGdList(),
      fetchMonHocList(),
      fetchTeacherList(),
      fetchStudentList(),
    ]);
  }, [fetchLichGdList, fetchMonHocList, fetchTeacherList, fetchStudentList]);

  // Filter available students based on search
  const filteredAvailableStudents = useMemo(() => {
    if (!studentSearchText) return availableStudents;
    return availableStudents.filter(sv => {
      const search = studentSearchText.toLowerCase();
      return (
        sv.maSv?.toLowerCase().includes(search) ||
        sv.tenSv?.toLowerCase().includes(search) ||
        sv.email?.toLowerCase().includes(search)
      );
    });
  }, [studentSearchText, availableStudents]);

  // Search functionality
  const handleSearch = useCallback((e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    if (value === '') {
      setData(originalData);
    } else {
      const filtered = originalData.filter(
        (item) =>
          item.tenGv?.toLowerCase().includes(value) ||
          item.tenMh?.toLowerCase().includes(value)
      );
      setData(filtered);
    }
  }, [originalData]);

  // Student modal handlers
  const openAddStudentModal = async () => {
    if (!currentMaGd) {
      message.error('Không tìm thấy mã giảng dạy');
      return;
    }

    setSelectedStudentsToAdd([]);
    setStudentSearchText('');
    await fetchAvailableStudents(currentMaGd);
    setAddStudentModalVisible(true);
  };

  const closeAddStudentModal = () => {
    setAddStudentModalVisible(false);
    setSelectedStudentsToAdd([]);
    setAvailableStudents([]);
  };

  const handleAddStudentsConfirm = async () => {
    if (selectedStudentsToAdd.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sinh viên');
      return;
    }

    try {
      const promises = selectedStudentsToAdd.map(student =>
        lichHocService.themSinhVien({
          maSv: student.maSv,
          maGd: currentMaGd
        })
      );

      await Promise.all(promises);
      message.success(`Đã thêm ${selectedStudentsToAdd.length} sinh viên vào lịch học`);

      // Refresh enrolled students list
      await fetchEnrolledStudents(currentMaGd);
      closeAddStudentModal();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      message.error(`Lỗi khi thêm sinh viên: ${errorMsg}`);
    }
  };

  // Modal handlers
  const openModal = useCallback((record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        ngayBd: moment(record.ngayBd),
        ngayKt: moment(record.ngayKt),
        ngayTrongTuan: record.ngayTrongTuan || [],
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  }, [form]);

  const handleViewDetail = useCallback(async (record) => {
    setSelectedRecord(record);
    setCurrentMaGd(record.id); // Assuming record.id is the maGd
    await fetchEnrolledStudents(record.id);
    setDetailModalVisible(true);
  }, [fetchEnrolledStudents]);

  // Form handlers
  const handleMonHocChange = useCallback((value) => {
    const selectedMonHoc = monHocList.find((mh) => mh.maMh === value);
    if (selectedMonHoc) {
      form.setFieldsValue({
        tenMh: selectedMonHoc.tenMh,
        nmh: selectedMonHoc.soTiet || form.getFieldValue('nmh'),
      });
    }
  }, [monHocList, form]);

  const handleGiaoVienChange = useCallback((value) => {
    const selectedGiaoVien = teacherList.find((gv) => gv.maGv === value);
    if (selectedGiaoVien) {
      form.setFieldsValue({ tenGv: selectedGiaoVien.tenGv });
    }
  }, [teacherList, form]);

  // Validation functions
  const validateForm = (values) => {
    if (values.ngayKt.isBefore(values.ngayBd)) {
      throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
    }
    if (values.stKt <= values.stBd) {
      throw new Error('Tiết kết thúc phải sau tiết bắt đầu');
    }
  };

  // CRUD operations
  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      validateForm(values);

      const newRecord = {
        ...values,
        ngayBd: values.ngayBd.format('YYYY-MM-DD'),
        ngayKt: values.ngayKt.format('YYYY-MM-DD'),
        ngayTrongTuan: values.ngayTrongTuan || [],
      };

      if (editingRecord) {
        await LichGdService.updateLichGd(editingRecord.id, newRecord);
        message.success('✅ Cập nhật thành công');
      } else {
        await LichGdService.createLichGd(newRecord);
        message.success('✅ Tạo mới thành công');
      }

      closeModal();
      fetchLichGdList();
    } catch (error) {
      const errorMsg = error.response?.data || error.message || 'Đã xảy ra lỗi';
      message.error(`❌ ${errorMsg}`);
    }
  }, [form, editingRecord, closeModal, fetchLichGdList]);

  const handleDelete = useCallback(async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lịch giảng dạy này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await LichGdService.deleteLichGd(id);
          message.success('✅ Xóa lịch giảng dạy thành công!');
          fetchLichGdList();
        } catch (error) {
          const errorMsg = error.response?.data || error.message || 'Đã xảy ra lỗi khi xóa!';
          message.error(`❌ ${errorMsg}`);
        }
      },
    });
  }, [fetchLichGdList]);

  // Remove student from teaching schedule
  const handleXoaSinhVien = useCallback(async (maSv) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa sinh viên ${maSv} khỏi lịch học?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await lichHocService.xoaSinhVien(maSv, currentMaGd);
          message.success('✅ Đã xóa sinh viên khỏi lịch học');
          // Refresh enrolled students list
          await fetchEnrolledStudents(currentMaGd);
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
          message.error(`❌ Lỗi khi xóa sinh viên: ${errorMsg}`);
        }
      },
    });
  }, [currentMaGd, fetchEnrolledStudents]);

  // Excel export
  const exportToExcel = useCallback(() => {
    try {
      const exportData = data.map((item, index) => ({
        'STT': index + 1,
        'Mã GV': item.maGv,
        'Tên GV': item.tenGv,
        'Mã MH': item.maMh,
        'Tên MH': item.tenMh,
        'Số tiết MH': item.nmh,
        'Phòng học': item.phongHoc,
        'Ngày bắt đầu': moment(item.ngayBd).format('DD/MM/YYYY'),
        'Ngày kết thúc': moment(item.ngayKt).format('DD/MM/YYYY'),
        'Tiết bắt đầu': item.stBd,
        'Tiết kết thúc': item.stKt,
        'Học kỳ': `Học kỳ ${item.hocKy}`,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = [
        { wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 25 },
        { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 10 }, { wch: 20 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Lịch Giảng Dạy');

      const fileName = `LichGiangDay_${moment().format('DDMMYYYY_HHmmss')}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, fileName);
      message.success(`✅ Xuất Excel thành công! File: ${fileName}`);
    } catch (error) {
      message.error(`❌ Lỗi khi xuất Excel: ${error.message}`);
    }
  }, [data]);

  // Memoized options
  const groupOptions = useMemo(() =>
    Array.from({ length: GROUP_COUNT }, (_, i) => (
      <Option key={i + 1} value={i + 1}>
        Nhóm {i + 1}
      </Option>
    )), []
  );

  const teacherOptions = useMemo(() =>
    teacherList.map(teacher => (
      <Option key={teacher.maGv} value={teacher.maGv}>
        {teacher.maGv} - {teacher.tenGv}
      </Option>
    )), [teacherList]
  );

  const subjectOptions = useMemo(() =>
    monHocList.map(mh => (
      <Option key={mh.maMh} value={mh.maMh}>
        {mh.maMh} - {mh.tenMh}
      </Option>
    )), [monHocList]
  );

  // Table columns
  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, record, index) => index + 1,
    },
    {
      title: 'Mã GV',
      dataIndex: 'maGv',
      key: 'maGv',
      width: 100,
    },
    {
      title: 'Tên GV',
      dataIndex: 'tenGv',
      key: 'tenGv',
      width: 150,
    },
    {
      title: 'Mã MH',
      dataIndex: 'maMh',
      key: 'maMh',
      width: 100,
    },
    {
      title: 'Tên MH',
      dataIndex: 'tenMh',
      key: 'tenMh',
      width: 150,
    },
    {
      title: 'Nhóm MH',
      dataIndex: 'nmh',
      key: 'nmh',
      width: 150,
    },
    {
      title: 'Phòng học',
      dataIndex: 'phongHoc',
      key: 'phongHoc',
      width: 100,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngayBd',
      key: 'ngayBd',
      width: 120,
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'ngayKt',
      key: 'ngayKt',
      width: 120,
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Tiết bắt đầu',
      dataIndex: 'stBd',
      key: 'stBd',
      width: 90,
    },
    {
      title: 'Tiết kết thúc',
      dataIndex: 'stKt',
      key: 'stKt',
      width: 90,
    },
    {
      title: 'Học kỳ',
      dataIndex: 'hocKy',
      key: 'hocKy',
      width: 80,
      render: (text) => `Học kỳ ${text}`,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            onClick={() => openModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            size="small"
            onClick={() => handleDelete(record.id)}
          />
          <Button
            type="default"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ], [openModal, handleDelete, handleViewDetail]);

  // Student columns for enrolled students
  const studentColumns = useMemo(() => [
    {
      title: 'MSSV',
      dataIndex: 'maSv',
      key: 'maSv',
      render: (text, record) => record.maSv || text,
    },
    {
      title: 'Họ tên',
      dataIndex: 'tenSv',
      key: 'tenSv',
      render: (text, record) => {
        // If student info is not directly available, find from studentList
        const student = studentList.find(s => s.maSv === record.maSv);
        return student ? student.tenSv : text;
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => {
        // If student info is not directly available, find from studentList
        const student = studentList.find(s => s.maSv === record.maSv);
        return student ? student.email : text;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button danger onClick={() => handleXoaSinhVien(record.maSv)}>
          Xóa
        </Button>
      ),
    },
  ], [handleXoaSinhVien, studentList]);

  return (
    <div>
      <h2>Danh sách lịch giảng dạy</h2>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="Tìm kiếm theo tên GV hoặc tên MH"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ width: 300 }}
          allowClear
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Thêm lịch Giảng dạy
        </Button>
        <Button
          type="default"
          icon={<DownloadOutlined />}
          onClick={exportToExcel}
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
        >
          Xuất Excel ({data.length} bản ghi)
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Sửa lịch Giảng dạy' : 'Thêm lịch Giảng dạy'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={closeModal}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ hocKy: 1, nmh: 1, stBd: 1, stKt: 2 }}
        >
          <Form.Item
            label="Giáo viên"
            name="maGv"
            rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}
          >
            <Select
              placeholder="Chọn giáo viên"
              onChange={handleGiaoVienChange}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {teacherOptions}
            </Select>
          </Form.Item>

          <Form.Item
            label="Môn học"
            name="maMh"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select
              placeholder="Chọn môn học"
              onChange={handleMonHocChange}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {subjectOptions}
            </Select>
          </Form.Item>

          <Form.Item
            label="Nhóm môn học"
            name="nmh"
            rules={[{ required: true, message: 'Vui lòng chọn nhóm môn học' }]}
          >
            <Select placeholder="Chọn nhóm môn học">
              {groupOptions}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phòng học"
            name="phongHoc"
            rules={[{ required: true, message: 'Vui lòng nhập phòng học' }]}
          >
            <Input placeholder="Nhập phòng học" />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="ngayBd"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="ngayKt"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('ngayBd') || value.isAfter(getFieldValue('ngayBd'))) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                },
              }),
            ]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Tiết bắt đầu"
            name="stBd"
            rules={[
              { required: true, message: 'Vui lòng nhập tiết bắt đầu' },
              {
                type: 'number',
                min: PERIOD_RANGE.min,
                max: PERIOD_RANGE.max,
                message: `Tiết bắt đầu từ ${PERIOD_RANGE.min}-${PERIOD_RANGE.max}`
              },
            ]}
          >
            <InputNumber
              min={PERIOD_RANGE.min}
              max={PERIOD_RANGE.max}
              placeholder="Tiết bắt đầu"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Tiết kết thúc"
            name="stKt"
            rules={[
              { required: true, message: 'Vui lòng nhập tiết kết thúc' },
              {
                type: 'number',
                min: PERIOD_RANGE.min,
                max: PERIOD_RANGE.max,
                message: `Tiết kết thúc từ ${PERIOD_RANGE.min}-${PERIOD_RANGE.max}`
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('stBd') < value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Tiết kết thúc phải sau tiết bắt đầu'));
                },
              }),
            ]}
          >
            <InputNumber
              min={PERIOD_RANGE.min}
              max={PERIOD_RANGE.max}
              placeholder="Tiết kết thúc"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Học kỳ"
            name="hocKy"
            rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}
          >
            <Select>
              {SEMESTER_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Thứ trong tuần"
            name="ngayTrongTuan"
            rules={[
              { required: true, message: 'Vui lòng chọn ít nhất một ngày trong tuần' },
              {
                validator: (_, value) => {
                  if (value && value.length > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Phải chọn ít nhất một ngày trong tuần'));
                },
              },
            ]}
          >
            <Select mode="multiple" placeholder="Chọn các ngày trong tuần">
              {WEEKDAY_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết lịch giảng dạy"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="add" type="primary" onClick={openAddStudentModal}>
            Thêm sinh viên
          </Button>,
        ]}
        width={900}
      >
        {selectedRecord && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>Thông tin lịch giảng dạy:</h3>
              <p><strong>Giáo viên:</strong> {selectedRecord.tenGv} ({selectedRecord.maGv})</p>
              <p><strong>Môn học:</strong> {selectedRecord.tenMh} ({selectedRecord.maMh})</p>
              <p><strong>Phòng học:</strong> {selectedRecord.phongHoc}</p>
              <p><strong>Thời gian:</strong> {moment(selectedRecord.ngayBd).format('DD/MM/YYYY')} - {moment(selectedRecord.ngayKt).format('DD/MM/YYYY')}</p>
              <p><strong>Tiết học:</strong> {selectedRecord.stBd} - {selectedRecord.stKt}</p>
              <p><strong>Học kỳ:</strong> {selectedRecord.hocKy}</p>
            </div>

            <div>
              <h3>Danh sách sinh viên đã đăng ký ({enrolledStudents.length} sinh viên):</h3>
              <Table
                rowKey="maSv"
                columns={studentColumns}
                dataSource={enrolledStudents}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sinh viên`,
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Thêm sinh viên vào lịch học"
        open={addStudentModalVisible}
        onCancel={closeAddStudentModal}
        onOk={handleAddStudentsConfirm}
        okText="Thêm sinh viên"
        cancelText="Hủy"
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm sinh viên theo mã SV, tên hoặc email"
            prefix={<SearchOutlined />}
            value={studentSearchText}
            onChange={(e) => setStudentSearchText(e.target.value)}
            allowClear
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <p><strong>Nhập danh sách mã sinh viên (mỗi mã trên một dòng):</strong></p>
          <Input.TextArea
            rows={4}
            placeholder="VD:\nSV001\nSV002\nSV003"
            onBlur={(e) => {
              const lines = e.target.value
                .split('\n')
                .map(line => line.trim())
                .filter(line => line !== '');

              const uniqueMaSv = [...new Set(lines)]; // bỏ trùng

              const matchedStudents = availableStudents.filter(sv =>
                uniqueMaSv.includes(sv.maSv)
              );

              const notFound = uniqueMaSv.filter(ma => !matchedStudents.some(sv => sv.maSv === ma));
              if (notFound.length > 0) {
                message.warning(`Không tìm thấy: ${notFound.join(', ')}`);
              }

              // Thêm vào danh sách chọn, tránh thêm trùng
              const newSelections = matchedStudents.filter(
                sv => !selectedStudentsToAdd.some(sel => sel.maSv === sv.maSv)
              );

              setSelectedStudentsToAdd(prev => [...prev, ...newSelections]);
            }}
          />
        </div>

        <Table
          rowKey="maSv"
          columns={[
            {
              title: 'Chọn',
              key: 'select',
              width: 60,
              render: (_, record) => (
                <input
                  type="checkbox"
                  checked={selectedStudentsToAdd.some(s => s.maSv === record.maSv)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudentsToAdd([...selectedStudentsToAdd, record]);
                    } else {
                      setSelectedStudentsToAdd(selectedStudentsToAdd.filter(s => s.maSv !== record.maSv));
                    }
                  }}
                />
              ),
            },
            {
              title: 'MSSV',
              dataIndex: 'maSv',
              key: 'maSv',
            },
            {
              title: 'Họ tên',
              dataIndex: 'tenSv',
              key: 'tenSv',
            },
            {
              title: 'Email',
              dataIndex: 'email',
              key: 'email',
            },
          ]}
          dataSource={filteredAvailableStudents}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sinh viên`,
          }}
        />

        <div style={{ marginTop: 16 }}>
          <p><strong>Đã chọn:</strong> {selectedStudentsToAdd.length} sinh viên</p>
          {selectedStudentsToAdd.length > 0 && (
            <div style={{ maxHeight: 100, overflow: 'auto', border: '1px solid #d9d9d9', padding: 8 }}>
              {selectedStudentsToAdd.map(student => (
                <div key={student.maSv} style={{ marginBottom: 4 }}>
                  {student.maSv} - {student.tenSv}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};