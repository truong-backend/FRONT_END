import React, { useEffect, useState } from 'react';
import { Select, Button, Radio, InputNumber, Table, Form, message, Spin, Checkbox } from 'antd';
import moment from 'moment';
import {
  fetchHocKyList,
  fetchMonHocByGiaoVien,
  fetchNhomMonHoc,
  fetchNgayGiangDay,
  fetchSinhVienDiemDanh,
  markAttendanceManual
} from '../../services/PhanGiaoVien/QrcodeService';
import { useAuth } from '../../contexts/AuthContext';

const { Option } = Select;

export const GenerateQRCode = () => {
  // Lấy thông tin user từ AuthContext
  const { user, isAuthenticated } = useAuth();

  // State cho dropdown selections
  const [hocKyList, setHocKyList] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState(null);
  const [monHocList, setMonHocList] = useState([]);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);
  const [nhomList, setNhomList] = useState([]);
  const [selectedNhom, setSelectedNhom] = useState(null);
  const [ngayList, setNgayList] = useState([]);
  const [selectedNgay, setSelectedNgay] = useState(null);

  // State cho mode và sinh viên
  const [mode, setMode] = useState('thuCong');
  const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
  const [thoiGianHetHan, setThoiGianHetHan] = useState(5);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // State cho loading
  const [loading, setLoading] = useState({
    hocKy: false,
    monHoc: false,
    nhom: false,
    ngayGiangDay: false,
    sinhVien: false,
    diemDanh: false
  });

  // Lấy mã giảng viên từ user context
  // Có thể là user.maGv hoặc user.id hoặc user.username tùy vào cấu trúc response từ API
  const maGv = user?.maGv || user?.id || user?.username;

  // Kiểm tra authentication và mã giảng viên
  useEffect(() => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }

    if (!maGv) {
      message.error('Không tìm thấy mã giảng viên');
      console.log('User object:', user); // Debug để xem cấu trúc user
      return;
    }

    // Load danh sách học kỳ khi có đầy đủ thông tin
    loadHocKyList();
  }, [isAuthenticated, maGv]);

  const loadHocKyList = async () => {
    setLoading(prev => ({ ...prev, hocKy: true }));
    try {
      const data = await fetchHocKyList();
      setHocKyList(data);
    } catch (error) {
      message.error('Không thể tải danh sách học kỳ');
      console.error('Error loading hoc ky list:', error);
    } finally {
      setLoading(prev => ({ ...prev, hocKy: false }));
    }
  };

  const handleHocKyChange = async (value) => {
    if (!maGv) {
      message.error('Không tìm thấy mã giảng viên');
      return;
    }

    const selectedHocKyData = hocKyList.find(hk => hk.hocKy === value);
    if (!selectedHocKyData) return;

    setSelectedHocKy(value);
    setSelectedMonHoc(null);
    setSelectedNhom(null);
    setSelectedNgay(null);
    setMonHocList([]);
    setNhomList([]);
    setNgayList([]);
    setDanhSachSinhVien([]);

    // Load môn học của giảng viên trong học kỳ này
    setLoading(prev => ({ ...prev, monHoc: true }));
    try {
      const data = await fetchMonHocByGiaoVien(maGv, selectedHocKyData.hocKy, selectedHocKyData.namHoc);
      setMonHocList(data);
    } catch (error) {
      message.error('Không thể tải danh sách môn học');
      console.error('Error loading mon hoc:', error);
    } finally {
      setLoading(prev => ({ ...prev, monHoc: false }));
    }
  };

  const handleMonHocChange = async (value) => {
    if (!maGv) {
      message.error('Không tìm thấy mã giảng viên');
      return;
    }

    const selectedMonHocData = monHocList.find(mh => mh.maMh === value);
    const selectedHocKyData = hocKyList.find(hk => hk.hocKy === selectedHocKy);
    
    if (!selectedMonHocData || !selectedHocKyData) return;

    setSelectedMonHoc(value);
    setSelectedNhom(null);
    setSelectedNgay(null);
    setNhomList([]);
    setNgayList([]);
    setDanhSachSinhVien([]);

    // Load nhóm môn học
    setLoading(prev => ({ ...prev, nhom: true }));
    try {
      const data = await fetchNhomMonHoc(
        maGv,
        selectedMonHocData.maMh,
        selectedHocKyData.hocKy,
        selectedHocKyData.namHoc
      );
      setNhomList(data);
    } catch (error) {
      message.error('Không thể tải danh sách nhóm môn học');
      console.error('Error loading nhom mon hoc:', error);
    } finally {
      setLoading(prev => ({ ...prev, nhom: false }));
    }
  };

  const handleNhomChange = async (value) => {
    const selectedNhomData = nhomList.find(nhom => nhom.maGd === value);
    if (!selectedNhomData) return;

    setSelectedNhom(value);
    setSelectedNgay(null);
    setNgayList([]);
    setDanhSachSinhVien([]);

    // Load ngày giảng dạy
    setLoading(prev => ({ ...prev, ngayGiangDay: true }));
    try {
      const data = await fetchNgayGiangDay(selectedNhomData.maGd);
      setNgayList(data);
    } catch (error) {
      message.error('Không thể tải danh sách ngày giảng dạy');
      console.error('Error loading ngay giang day:', error);
    } finally {
      setLoading(prev => ({ ...prev, ngayGiangDay: false }));
    }
  };

  const handleNgayChange = (value) => {
    setSelectedNgay(value);
    setDanhSachSinhVien([]);
  };

  const handleThuCong = async () => {
    if (!selectedNgay) {
      message.warning('Vui lòng chọn ngày giảng dạy');
      return;
    }

    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (!selectedNgayData) return;

    setLoading(prev => ({ ...prev, sinhVien: true }));
    try {
      const data = await fetchSinhVienDiemDanh(selectedNgayData.maTkb);
      setDanhSachSinhVien(data);
      setSelectedStudents([]);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên');
      console.error('Error loading sinh vien:', error);
    } finally {
      setLoading(prev => ({ ...prev, sinhVien: false }));
    }
  };

  const handleDiemDanhThuCong = async () => {
    if (selectedStudents.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sinh viên để điểm danh');
      return;
    }

    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (!selectedNgayData) return;

    setLoading(prev => ({ ...prev, diemDanh: true }));
    try {
      // Điểm danh cho từng sinh viên được chọn
      const promises = selectedStudents.map(maSv => 
        markAttendanceManual({
          maTkb: selectedNgayData.maTkb,
          maSv: maSv,
          ngayHoc: selectedNgayData.ngayHoc,
          ghiChu: 'Điểm danh thủ công'
        })
      );

      await Promise.all(promises);
      message.success(`Điểm danh thành công cho ${selectedStudents.length} sinh viên`);
      
      // Reload danh sách sinh viên để cập nhật trạng thái
      handleThuCong();
      setSelectedStudents([]);
    } catch (error) {
      message.error('Có lỗi xảy ra khi điểm danh');
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(prev => ({ ...prev, diemDanh: false }));
    }
  };

  const handleTaoQR = () => {
    if (!selectedNgay) {
      message.warning('Vui lòng chọn ngày giảng dạy');
      return;
    }
    message.success(`QR được tạo thành công - Hết hạn sau ${thoiGianHetHan} phút`);
    // TODO: Implement QR code generation logic
  };

  const handleSelectAllStudents = (checked) => {
    if (checked) {
      const allStudentIds = danhSachSinhVien
        .filter(sv => sv.trangThaiDiemDanh !== 'Đã điểm danh')
        .map(sv => sv.maSv);
      setSelectedStudents(allStudentIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const studentColumns = [
    {
      title: (
        <Checkbox
          onChange={(e) => handleSelectAllStudents(e.target.checked)}
          checked={selectedStudents.length > 0 && 
            selectedStudents.length === danhSachSinhVien.filter(sv => sv.trangThaiDiemDanh !== 'Đã điểm danh').length}
          indeterminate={selectedStudents.length > 0 && 
            selectedStudents.length < danhSachSinhVien.filter(sv => sv.trangThaiDiemDanh !== 'Đã điểm danh').length}
        >
          Chọn
        </Checkbox>
      ),
      dataIndex: 'select',
      width: 80,
      render: (_, record) => (
        <Checkbox
          checked={selectedStudents.includes(record.maSv)}
          disabled={record.trangThaiDiemDanh === 'Đã điểm danh'}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedStudents([...selectedStudents, record.maSv]);
            } else {
              setSelectedStudents(selectedStudents.filter(id => id !== record.maSv));
            }
          }}
        />
      )
    },
    { title: 'MSSV', dataIndex: 'maSv', width: 120 },
    { title: 'Họ tên', dataIndex: 'tenSv' },
    { title: 'Lớp', dataIndex: 'tenLop', width: 100 },
    { title: 'Khoa', dataIndex: 'tenKhoa', width: 150 },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trangThaiDiemDanh',
      width: 120,
      render: (status) => (
        <span style={{ 
          color: status === 'Đã điểm danh' ? 'green' : 'orange',
          fontWeight: 'bold'
        }}>
          {status || 'Chưa điểm danh'}
        </span>
      )
    }
  ];

  // Hiển thị loading hoặc thông báo lỗi nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Vui lòng đăng nhập để sử dụng chức năng này</p>
      </div>
    );
  }

  if (!maGv) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Không tìm thấy thông tin giảng viên</p>
        <p>Thông tin user: {JSON.stringify(user)}</p>
      </div>
    );
  }

  return (
    <Spin spinning={Object.values(loading).some(Boolean)}>
      <Form layout="vertical" style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Hiển thị thông tin giảng viên để debug */}
        <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <small>Mã giảng viên: {maGv}</small>
        </div>

        <Form.Item label="Chọn học kỳ">
          <Select 
            onChange={handleHocKyChange} 
            placeholder="Chọn học kỳ"
            loading={loading.hocKy}
          >
            {hocKyList.map((hk) => (
              <Option key={hk.hocKy} value={hk.hocKy}>
                {hk.hocKyDisplay}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Chọn môn học">
          <Select 
            onChange={handleMonHocChange} 
            value={selectedMonHoc} 
            placeholder="Chọn môn học"
            loading={loading.monHoc}
            disabled={!selectedHocKy}
          >
            {monHocList.map((mh) => (
              <Option key={mh.maMh} value={mh.maMh}>
                {mh.tenMh}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Chọn nhóm học">
          <Select 
            onChange={handleNhomChange} 
            value={selectedNhom} 
            placeholder="Chọn nhóm"
            loading={loading.nhom}
            disabled={!selectedMonHoc}
          >
            {nhomList.map((nhom) => (
              <Option key={nhom.maGd} value={nhom.maGd}>
                Nhóm {nhom.nhomMonHoc} - {nhom.phongHoc} - {nhom.caHoc}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Chọn ngày giảng dạy">
          <Select 
            onChange={handleNgayChange} 
            value={selectedNgay} 
            placeholder="Chọn ngày"
            loading={loading.ngayGiangDay}
            disabled={!selectedNhom}
          >
            {ngayList.map((ngay) => (
              <Option key={ngay.maTkb} value={ngay.maTkb}>
                {moment(ngay.ngayHoc).format('DD/MM/YYYY')} - {ngay.phongHoc} - {ngay.caHoc}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Chọn phương thức điểm danh">
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
            <Radio.Button value="thuCong">Thủ công</Radio.Button>
            <Radio.Button value="qr">Tạo QR</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {mode === 'thuCong' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                onClick={handleThuCong}
                loading={loading.sinhVien}
                disabled={!selectedNgay}
              >
                Hiển thị danh sách sinh viên
              </Button>
              {danhSachSinhVien.length > 0 && (
                <Button 
                  type="primary" 
                  onClick={handleDiemDanhThuCong}
                  loading={loading.diemDanh}
                  disabled={selectedStudents.length === 0}
                  style={{ marginLeft: 8 }}
                >
                  Điểm danh ({selectedStudents.length})
                </Button>
              )}
            </div>
            
            {danhSachSinhVien.length > 0 && (
              <Table
                dataSource={danhSachSinhVien}
                columns={studentColumns}
                rowKey="maSv"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            )}
          </>
        )}

        {mode === 'qr' && (
          <>
            <Form.Item label="Thời gian hết hiệu lực (phút)">
              <InputNumber min={1} max={60} value={thoiGianHetHan} onChange={setThoiGianHetHan} />
            </Form.Item>
            <Button 
              type="primary" 
              onClick={handleTaoQR}
              disabled={!selectedNgay}
            >
              Tạo mã QR điểm danh
            </Button>
          </>
        )}
      </Form>
    </Spin>
  );
};