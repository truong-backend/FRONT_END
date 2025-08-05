import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Input,
  Select,
  message,
  Modal,
  Button,
  Form,
  Space,
  Popconfirm,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../../contexts/AuthContext.jsx';

// Services
import { lichGDService } from '../../../services/GiaoVien/LichGD/lichGDService.js';
import { studentService } from '../../../services/Admin/studentService.js';
import { lichHocService } from '../../../services/Admin/lichHocService.js';
import { ThoiKhoaBieuService } from '../../../services/GiaoVien/ThoiKhoaBieu/ThoiKhoaBieuService.js';

const { Option } = Select;
const { TabPane } = Tabs;

export const ThemSinhVienComponent = () => {
  // Student management states
  const [studentSearchText, setStudentSearchText] = useState('');
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [enrolledStudentSearchText, setEnrolledStudentSearchText] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Shared states
  const [currentMaGd, setCurrentMaGd] = useState(null);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ThoiKhoaBieu states
  const [tkbModalVisible, setTkbModalVisible] = useState(false);
  const [tkbForm] = Form.useForm();
  const [creatingTkb, setCreatingTkb] = useState(false);
  const [deletingTkb, setDeletingTkb] = useState(false);
  const [tkbList, setTkbList] = useState([]);
  const [loadingTkb, setLoadingTkb] = useState(false);
  const [tkbSearchText, setTkbSearchText] = useState('');

  const { user } = useAuth();
  const maGv = user.maGv || user.username || user.id;

  // Fetch functions
  const fetchLichGdList = useCallback(async (maGv) => {
    setLoading(true);
    try {
      const result = await lichGDService.LayLichGiangDayGiangVien(maGv);
      setData(result);
      setOriginalData(result);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách lịch giảng dạy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEnrolledStudents = useCallback(async (maGd) => {
    try {
      const response = await lichHocService.getSinhVienDaHoc(maGd);
      setEnrolledStudents(response || []);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách sinh viên đã đăng ký: ${error.message}`);
    }
  }, []);

  const fetchAvailableStudents = useCallback(async (maGd) => {
    try {
      const response = await lichHocService.getSinhVienChuaHoc(maGd);
      setAvailableStudents(response || []);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách sinh viên chưa học: ${error.message}`);
    }
  }, []);

  const fetchTkbByMaGd = useCallback(async (maGd) => {
    setLoadingTkb(true);
    try {
      const result = await ThoiKhoaBieuService.LayTkbTheoMaGd(maGd);
      setTkbList(result);
    } catch {
      setTkbList([]);
    } finally {
      setLoadingTkb(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    Promise.all([
      fetchLichGdList(maGv),
    ]);
  }, [fetchLichGdList, maGv]);

  // Filter functions
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

  const filteredEnrolledStudents = useMemo(() => {
    if (!enrolledStudentSearchText) return enrolledStudents;
    return enrolledStudents.filter((sv) => {
      const search = enrolledStudentSearchText.toLowerCase();
      const studentInfo = studentList.find(s => s.maSv === sv.maSv);
      return (
        sv.maSv?.toLowerCase().includes(search) ||
        studentInfo?.tenSv?.toLowerCase().includes(search) ||
        studentInfo?.email?.toLowerCase().includes(search)
      );
    });
  }, [enrolledStudentSearchText, enrolledStudents, studentList]);

  const filteredTkbList = useMemo(() => {
    if (!tkbSearchText) return tkbList;
    return tkbList.filter(tkb => {
      const search = tkbSearchText.toLowerCase();
      return (
        tkb.phongHoc?.toLowerCase().includes(search) ||
        moment(tkb.ngayHoc).format('DD/MM/YYYY').includes(search) ||
        tkb.stBd?.toString().includes(search) ||
        tkb.stKt?.toString().includes(search)
      );
    });
  }, [tkbSearchText, tkbList]);

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

  // Student management functions
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
          await fetchEnrolledStudents(currentMaGd);
          if (addStudentModalVisible) {
            await fetchAvailableStudents(currentMaGd);
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
          message.error(`❌ Lỗi khi xóa sinh viên: ${errorMsg}`);
        }
      },
    });
  }, [currentMaGd, fetchEnrolledStudents, fetchAvailableStudents, addStudentModalVisible]);

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

      await fetchEnrolledStudents(currentMaGd);
      closeAddStudentModal();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
      message.error(`Lỗi khi thêm sinh viên: ${errorMsg}`);
    }
  };

  // ThoiKhoaBieu functions
  const handleAddTKB = () => {
    setTkbModalVisible(true);
  };

  const handleCreateTkb = async (values) => {
    setCreatingTkb(true);
    try {
      const { thu } = values;

      if (!currentMaGd || !selectedRecord?.maMh) {
        message.error('Không đủ thông tin để tạo thời khóa biểu');
        return;
      }

      if (!thu || thu.length === 0) {
        message.error('Vui lòng chọn ít nhất một thứ');
        return;
      }

      const result = await ThoiKhoaBieuService.TaoTkb(currentMaGd, thu, selectedRecord.maMh);

      const thuNames = {
        1: 'Thứ hai',
        2: 'Thứ ba',
        3: 'Thứ tư',
        4: 'Thứ năm',
        5: 'Thứ sáu',
        6: 'Thứ bảy',
        7: 'Chủ nhật'
      };

      const selectedThuNames = thu.map(t => thuNames[t]).join(', ');

      message.success(`Đã tạo thành công ${Array.isArray(result) ? result.length : 'các'} buổi học cho các thứ: ${selectedThuNames}`);

      setTkbModalVisible(false);
      tkbForm.resetFields();
      await fetchTkbByMaGd(currentMaGd);

    } catch (error) {
      console.error('Lỗi khi tạo thời khóa biểu:', error);
      message.error(`Lỗi khi tạo thời khóa biểu: ${error.message}`);
    } finally {
      setCreatingTkb(false);
    }
  };

  const handleDeleteTkbByMaGd = async () => {
    if (!currentMaGd) {
      message.error('Không có thông tin mã giảng dạy');
      return;
    }

    setDeletingTkb(true);
    try {
      await ThoiKhoaBieuService.XoaTkbTheoMaGd(currentMaGd);
      message.success('Đã xóa tất cả thời khóa biểu của môn học này');
      
      await fetchTkbByMaGd(currentMaGd);
    } catch (error) {
      console.error('Lỗi khi xóa thời khóa biểu:', error);
      message.error(`Lỗi khi xóa thời khóa biểu: ${error.message}`);
    } finally {
      setDeletingTkb(false);
    }
  };

  const handleViewDetail = useCallback(async (record) => {
    setSelectedRecord(record);
    setCurrentMaGd(record.id);
    await Promise.all([
      fetchEnrolledStudents(record.id),
      fetchTkbByMaGd(record.id)
    ]);
    setDetailModalVisible(true);
  }, [fetchEnrolledStudents, fetchTkbByMaGd]);

  // Table columns
  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, record, index) => index + 1,
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
            type="default"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ], [handleViewDetail]);

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
        const student = studentList.find(s => s.maSv === record.maSv);
        return student ? student.tenSv : text || record.tenSv;
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => {
        const student = studentList.find(s => s.maSv === record.maSv);
        return student ? student.email : text || record.email;
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
  ], [studentList, handleXoaSinhVien]);

  // Available students columns for add modal
  const availableStudentColumns = useMemo(() => [
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
  ], [selectedStudentsToAdd]);

  // TKB columns
  const tkbColumns = useMemo(() => [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, record, index) => index + 1,
    },
    {
      title: 'Ngày học',
      dataIndex: 'ngayHoc',
      key: 'ngayHoc',
      render: (text) => moment(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Thứ',
      dataIndex: 'ngayHoc',
      key: 'thu',
      render: (text) => {
        const dayOfWeek = moment(text).day();
        const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
        const days = {
          1: 'Thứ hai',
          2: 'Thứ ba', 
          3: 'Thứ tư',
          4: 'Thứ năm',
          5: 'Thứ sáu',
          6: 'Thứ bảy',
          7: 'Chủ nhật'
        };
        return days[isoDayOfWeek];
      },
    },
    {
      title: 'Phòng học',
      dataIndex: 'phongHoc',
      key: 'phongHoc',
    },
    {
      title: 'Tiết bắt đầu',
      dataIndex: 'stBd',
      key: 'stBd',
    },
    {
      title: 'Tiết kết thúc',
      dataIndex: 'stKt',
      key: 'stKt',
    },
  ], []);

  return (
    <div>
      <h2>QUẢN LÝ LỊCH GIẢNG DẠY</h2>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="Tìm kiếm theo tên GV hoặc tên MH"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
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

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết lịch giảng dạy - ${selectedRecord?.tenMh || ''}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={1200}
      >
        {selectedRecord && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 48,
                padding: '16px',
                backgroundColor: '#f0f8ff',
                borderRadius: '6px'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <p><strong>Giáo viên:</strong> {selectedRecord.tenGv}</p>
                  <p><strong>Môn học:</strong> {selectedRecord.tenMh} ({selectedRecord.maMh})</p>
                  <p><strong>Nhóm MH:</strong> {selectedRecord.nmh}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p><strong>Phòng học:</strong> {selectedRecord.phongHoc}</p>
                  <p><strong>Thời gian:</strong> {moment(selectedRecord.ngayBd).format('DD/MM/YYYY')} - {moment(selectedRecord.ngayKt).format('DD/MM/YYYY')}</p>
                  <p><strong>Tiết học:</strong> {selectedRecord.stBd} - {selectedRecord.stKt}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p><strong>Học kỳ:</strong> {selectedRecord.hocKy}</p>
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Danh sách sinh viên" key="1">
                <div>
                  <h3>Danh sách sinh viên đã đăng ký ({enrolledStudents.length} sinh viên):</h3>
                  
                  <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                    <Input
                      placeholder="Tìm kiếm sinh viên đã đăng ký (MSSV, tên, email)"
                      prefix={<SearchOutlined />}
                      allowClear
                      value={enrolledStudentSearchText}
                      onChange={(e) => setEnrolledStudentSearchText(e.target.value)}
                      style={{ width: 400 }}
                    />
                    <Button type="primary" onClick={openAddStudentModal}>
                      Thêm sinh viên
                    </Button>
                  </div>

                  <Table
                    rowKey="maSv"
                    columns={studentColumns}
                    dataSource={filteredEnrolledStudents}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sinh viên`,
                    }}
                  />
                </div>
              </TabPane>

              <TabPane tab="Thời khóa biểu" key="2">
                <div>
                  <h3>Danh sách thời khóa biểu</h3>
                  
                  <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                    <Input
                      placeholder="Tìm kiếm theo phòng học, ngày học, tiết học"
                      prefix={<SearchOutlined />}
                      allowClear
                      value={tkbSearchText}
                      onChange={(e) => setTkbSearchText(e.target.value)}
                      style={{ width: 400 }}
                    />
                    <Button type="primary" onClick={handleAddTKB}>
                      Thêm thời khóa biểu
                    </Button>
                    <Popconfirm
                      title="Xóa tất cả thời khóa biểu"
                      description="Bạn có chắc chắn muốn xóa tất cả thời khóa biểu của môn học này không?"
                      onConfirm={handleDeleteTkbByMaGd}
                      okText="Có"
                      cancelText="Không"
                      placement="topRight"
                    >
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deletingTkb}
                      >
                        Xóa tất cả TKB
                      </Button>
                    </Popconfirm>
                  </div>

                  <Table
                    rowKey="id"
                    columns={tkbColumns}
                    dataSource={filteredTkbList}
                    loading={loadingTkb}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} buổi học`,
                    }}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
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

              const uniqueMaSv = [...new Set(lines)];

              const matchedStudents = availableStudents.filter(sv =>
                uniqueMaSv.includes(sv.maSv)
              );

              const notFound = uniqueMaSv.filter(ma => !matchedStudents.some(sv => sv.maSv === ma));
              if (notFound.length > 0) {
                message.warning(`Không tìm thấy: ${notFound.join(', ')}`);
              }

              const newSelections = matchedStudents.filter(
                sv => !selectedStudentsToAdd.some(sel => sel.maSv === sv.maSv)
              );

              setSelectedStudentsToAdd(prev => [...prev, ...newSelections]);
            }}
          />
        </div>

        <Table
          rowKey="maSv"
          columns={availableStudentColumns}
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

      {/* Add TKB Modal */}
      <Modal
        title="Thêm thời khóa biểu"
        open={tkbModalVisible}
        onCancel={() => {
          setTkbModalVisible(false);
          tkbForm.resetFields();
        }}
        onOk={() => {
          tkbForm
            .validateFields()
            .then(values => {
              handleCreateTkb(values);
            })
            .catch(err => {
              console.error('❌ Lỗi validate:', err);
            });
        }}
        okText="Tạo thời khóa biểu"
        cancelText="Hủy"
        confirmLoading={creatingTkb}
        destroyOnClose={true}
      >
        <Form form={tkbForm} layout="vertical">
          <Form.Item
            name="thu"
            label="Chọn thứ"
            rules={[{
              required: true,
              message: 'Vui lòng chọn ít nhất một thứ'
            }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn một hoặc nhiều thứ"
              style={{ width: '100%' }}
              maxTagCount="responsive"
              allowClear
            >
              <Option value={0}>Thứ Hai</Option>
              <Option value={1}>Thứ Ba</Option>
              <Option value={2}>Thứ Tư</Option>
              <Option value={3}>Thứ Năm</Option>
              <Option value={4}>Thứ Sáu</Option>
              <Option value={5}>Thứ Bảy</Option>
              <Option value={6}>Chủ Nhật</Option>
            </Select>
          </Form.Item>

          {selectedRecord && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              marginTop: '16px'
            }}>
              <h4>Thông tin lịch giảng dạy:</h4>
              <p><strong>Môn học:</strong> {selectedRecord.tenMh} ({selectedRecord.maMh})</p>
              <p><strong>Phòng học:</strong> {selectedRecord.phongHoc}</p>
              <p><strong>Thời gian:</strong> {moment(selectedRecord.ngayBd).format('DD/MM/YYYY')} - {moment(selectedRecord.ngayKt).format('DD/MM/YYYY')}</p>
              <p><strong>Tiết:</strong> {selectedRecord.stBd} - {selectedRecord.stKt}</p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};