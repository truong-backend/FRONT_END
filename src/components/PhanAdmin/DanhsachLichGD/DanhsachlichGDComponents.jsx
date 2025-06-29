import React, { useState, useEffect } from 'react';
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
import { LichGdService } from '../../../services/PhanAdmin/LichGdService';
import { monHocService } from "../../../services/PhanAdmin/monHocService.js";
import { teacherService } from "../../../services/PhanAdmin/teacherService.js"

const { Option } = Select;

export const DanhsachlichGDComponents = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Lưu dữ liệu gốc
  const [monHocList, setMonHocList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchLichGdList = async () => {
    setLoading(true);
    try {
      const result = await LichGdService.getAllLichGdNoPaging();
      setData(result);
      setOriginalData(result); // Lưu dữ liệu gốc
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonHocList = async () => {
    try {
      const response = await monHocService.getAllMonHocs();
      setMonHocList(response || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách môn học: ' + error.message);
    }
  };

  const fetchTeacherList = async () => {
    try {
      const response = await teacherService.getListGiaoVien();
      setTeacherList(response || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách giáo viên: ' + error.message);
    }
  };

  useEffect(() => {
    fetchTeacherList();
    fetchMonHocList();
    fetchLichGdList();
  }, []);

  // Tìm kiếm theo tên giáo viên hoặc tên môn học
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    
    if (value === '') {
      setData(originalData); // Khôi phục dữ liệu gốc khi xóa tìm kiếm
    } else {
      const filtered = originalData.filter(
        (item) =>
          item.tenGv.toLowerCase().includes(value) ||
          item.tenMh.toLowerCase().includes(value)
      );
      setData(filtered);
    }
  };

  // Hàm xuất Excel
  const exportToExcel = () => {
    try {
      // Chuẩn bị dữ liệu để xuất
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
        'Thứ trong tuần': Array.isArray(item.cacBuoiHoc) 
          ? item.cacBuoiHoc.map(day => {
              const days = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
              return days[day];
            }).join(', ')
          : item.cacBuoiHoc
      }));

      // Tạo workbook và worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Thiết lập độ rộng cột
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 10 },  // Mã GV
        { wch: 20 },  // Tên GV
        { wch: 10 },  // Mã MH
        { wch: 25 },  // Tên MH
        { wch: 12 },  // Số tiết MH
        { wch: 15 },  // Phòng học
        { wch: 15 },  // Ngày bắt đầu
        { wch: 15 },  // Ngày kết thúc
        { wch: 12 },  // Tiết bắt đầu
        { wch: 12 },  // Tiết kết thúc
        { wch: 10 },  // Học kỳ
        { wch: 20 }   // Thứ trong tuần
      ];
      ws['!cols'] = colWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Lịch Giảng Dạy');

      // Tạo tên file với timestamp
      const fileName = `LichGiangDay_${moment().format('DDMMYYYY_HHmmss')}.xlsx`;

      // Xuất file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);

      message.success(`✅ Xuất Excel thành công! File: ${fileName}`);
    } catch (error) {
      message.error('❌ Lỗi khi xuất Excel: ' + error.message);
    }
  };

  // Mở modal tạo mới hoặc sửa
  const openModal = (record) => {
    setEditingRecord(record || null);
    if (record) {
      form.setFieldsValue({
        ...record,
        ngayBd: moment(record.ngayBd),
        ngayKt: moment(record.ngayKt),
        cacBuoiHoc: record.cacBuoiHoc,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await LichGdService.deleteLichGd(id);
      message.success('✅ Xóa lịch giảng dạy thành công!');
      fetchLichGdList(); // Cập nhật lại danh sách
    } catch (error) {
      // Lấy thông báo lỗi trả về từ BE (nếu có)
      const errorMsg =
        error.response?.data || error.message || 'Đã xảy ra lỗi khi xóa!';
      message.error(`❌ ${errorMsg}`);
    }
  };

  // Lưu tạo hoặc sửa
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const newRecord = {
        ...values,
        ngayBd: values.ngayBd.format('YYYY-MM-DD'),
        ngayKt: values.ngayKt.format('YYYY-MM-DD'),
      };

      if (editingRecord) {
        // Gọi API cập nhật
        await LichGdService.updateLichGd(editingRecord.id, newRecord);
        message.success('✅ Cập nhật thành công');
      } else {
        // Gọi API tạo mới
        await LichGdService.createLichGd(newRecord);
        message.success('✅ Tạo mới thành công');
      }

      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchLichGdList(); // Cập nhật lại danh sách từ backend
    } catch (error) {
      message.error(`❌ ${error.message}`);
    }
  };

  const handleMonHocChange = (value) => {
    const selectedMonHoc = monHocList.find((mh) => mh.maMh === value);
    if (selectedMonHoc) {
      form.setFieldsValue({ tenMh: selectedMonHoc.tenMh });
    }
  };

  const handleGiaoVienChange = (value) => {
    const selectedGiaoVien = teacherList.find((gv) => gv.maGv === value);
    if (selectedGiaoVien) {
      form.setFieldsValue({ tenGv: selectedGiaoVien.tenGv });
    }
  };

  const columns = [
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
      title: 'Số tiết MH',
      dataIndex: 'nmh',
      key: 'nmh',
      width: 90,
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
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            onClick={() => openModal(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            size="small"
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

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
          onClick={() => openModal(null)}
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
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingRecord ? 'Sửa lịch Giảng dạy' : 'Thêm lịch Giảng dạy'}
        visible={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ hocKy: 1, nmh: 1, stBd: 1, stKt: 1 }}
        >
          <Form.Item
            label="Giáo viên"
            name="maGv"
            rules={[{ required: true, message: 'Vui lòng nhập mã giáo viên' }]}
          >
            <Select placeholder="Chọn giáo viên" onChange={handleGiaoVienChange}>
              {teacherList.map(teacher => (
                <Option key={teacher.maGv} value={teacher.maGv}>{teacher.maGv} - {teacher.tenGv}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên giáo viên"
            name="tenGv"
            rules={[{ required: true, message: 'Vui lòng nhập tên giáo viên' }]}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Môn học"
            name="maMh"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select placeholder="Chọn môn học" onChange={handleMonHocChange}>
              {monHocList.map(mh => (
                <Option key={mh.maMh} value={mh.maMh}>
                  {mh.maMh} - {mh.tenMh}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên môn học"
            name="tenMh"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số tiết môn học"
            name="nmh"
            rules={[
              { required: true, type: 'number', min: 1, message: 'Số tiết phải lớn hơn 0' },
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            label="Phòng học"
            name="phongHoc"
            rules={[{ required: true, message: 'Vui lòng nhập phòng học' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="ngayBd"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="ngayKt"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Tiết bắt đầu"
            name="stBd"
            rules={[
              { required: true, type: 'number', min: 1, message: 'Tiết bắt đầu >=1' },
            ]}
          >
            <InputNumber min={1} max={20} />
          </Form.Item>

          <Form.Item
            label="Tiết kết thúc"
            name="stKt"
            rules={[
              { required: true, type: 'number', min: 1, message: 'Tiết kết thúc >=1' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('stBd') <= value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu')
                  );
                },
              }),
            ]}
          >
            <InputNumber min={1} max={20} />
          </Form.Item>

          <Form.Item
            label="Học kỳ"
            name="hocKy"
            rules={[
              { required: true, message: 'Vui lòng chọn học kỳ' },
            ]}
          >
            <Select>
              <Option value={1}>Học kỳ 1</Option>
              <Option value={2}>Học kỳ 2</Option>
              <Option value={3}>Học kỳ 3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Thứ trong tuần"
            name="cacBuoiHoc"
            rules={[{ required: true, message: 'Vui lòng nhập các buổi học' }]}
          >
            <Select mode="multiple">
              <Option value={1}>Thứ 2</Option>
              <Option value={2}>Thứ 3</Option>
              <Option value={3}>Thứ 4</Option>
              <Option value={4}>Thứ 5</Option>
              <Option value={5}>Thứ 6</Option>
              <Option value={6}>Thứ 7</Option>
              <Option value={7}>Chủ nhật</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};