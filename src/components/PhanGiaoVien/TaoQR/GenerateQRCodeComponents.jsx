import React, { useEffect, useState } from 'react';
import { Select, Button, Radio, InputNumber, Table, Form, message, Spin, Checkbox, Card, Typography, Divider } from 'antd';
import { QrcodeOutlined, ClockCircleOutlined, CheckCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import moment from 'moment';
import {
  fetchHocKyList,
  fetchMonHocByGiaoVien,
  fetchNhomMonHoc,
  fetchNgayGiangDay,
  fetchSinhVienDiemDanh,
  markAttendanceManual,
  createQRCode
} from '../../../services/PhanGiaoVien/TaoQR/QrcodeService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const { Option } = Select;
const { Text, Title } = Typography;

export const GenerateQRCodeComponents = () => {
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
  const [thoiGianHetHan, setThoiGianHetHan] = useState(5); // Giá trị mặc định 5 phút
  const [selectedStudents, setSelectedStudents] = useState([]);

  // State cho QR Code
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrCodeExpired, setQrCodeExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null); // State riêng cho thời gian còn lại

  // State cho loading
  const [loading, setLoading] = useState({
    hocKy: false,
    monHoc: false,
    nhom: false,
    ngayGiangDay: false,
    sinhVien: false,
    diemDanh: false,
    taoQR: false
  });

  // Lấy mã giảng viên từ user context
  const maGv = user?.maGv || user?.id || user?.username;

  // Kiểm tra authentication và mã giảng viên
  useEffect(() => {
    if (!isAuthenticated) {
      message.error('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }

    if (!maGv) {
      message.error('Không tìm thấy mã giảng viên');
      console.log('User object:', user);
      return;
    }

    // Load danh sách học kỳ khi có đầy đủ thông tin
    loadHocKyList();
  }, [isAuthenticated, maGv]);

  // Effect để tự động load danh sách sinh viên khi chọn ngày giảng dạy
  useEffect(() => {
    if (mode === 'thuCong' && selectedNgay) {
      const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
      if (selectedNgayData) {
        handleThuCong();
      }
    } else {
      setDanhSachSinhVien([]);
      setSelectedStudents([]);
    }
  }, [selectedNgay, mode, ngayList]);

  // Effect để theo dõi thời gian hết hạn QR Code
  useEffect(() => {
    let interval;
    
    if (qrCodeData && qrCodeData.thoiGianKt && !qrCodeExpired) {
      // Cập nhật thời gian còn lại mỗi giây
      interval = setInterval(() => {
        const now = moment();
        const expireTime = moment(qrCodeData.thoiGianKt);
        const duration = moment.duration(expireTime.diff(now));
        
        if (duration.asSeconds() <= 0) {
          // Hết hạn - tự động đóng QR code
          setQrCodeExpired(true);
          setRemainingTime('Đã hết hạn');
          setQrCodeData(null); // Tự động đóng QR code
          message.warning('QR Code đã hết hạn và được đóng tự động!', 3);
          clearInterval(interval);
        } else {
          // Cập nhật thời gian còn lại
          const totalSeconds = Math.floor(duration.asSeconds());
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          
          const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          setRemainingTime(timeString);
          
          // Cảnh báo khi còn 1 phút
          if (totalSeconds === 60) {
            message.warning('QR Code sẽ hết hạn trong 1 phút!', 2);
          }
          // Cảnh báo khi còn 30 giây
          else if (totalSeconds === 30) {
            message.warning('QR Code sẽ hết hạn trong 30 giây!', 2);
          }
          // Cảnh báo khi còn 10 giây
          else if (totalSeconds === 10) {
            message.error('QR Code sẽ hết hạn trong 10 giây!', 2);
          }
        }
      }, 1000);
      
      // Tính toán thời gian ban đầu
      const now = moment();
      const expireTime = moment(qrCodeData.thoiGianKt);
      const duration = moment.duration(expireTime.diff(now));
      
      if (duration.asSeconds() > 0) {
        const totalSeconds = Math.floor(duration.asSeconds());
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setQrCodeExpired(true);
        setRemainingTime('Đã hết hạn');
        setQrCodeData(null);
      }
    } else if (!qrCodeData) {
      // Reset khi không có QR code
      setRemainingTime(null);
      setQrCodeExpired(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrCodeData, qrCodeExpired]);

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
    setQrCodeData(null);
    setQrCodeExpired(false);

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
    setQrCodeData(null);
    setQrCodeExpired(false);

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
    setQrCodeData(null);
    setQrCodeExpired(false);

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
    setQrCodeData(null);
    setQrCodeExpired(false);
  };

  const handleThoiGianHetHanChange = (value) => {
    setThoiGianHetHan(value);
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

  const handleTaoQR = async () => {
    // Kiểm tra ngày giảng dạy
    if (!selectedNgay) {
      message.warning('Vui lòng chọn ngày giảng dạy');
      return;
    }

    // Kiểm tra thời gian hết hạn (bắt buộc)
    if (!thoiGianHetHan || thoiGianHetHan <= 0) {
      message.warning('Vui lòng nhập thời gian hết hạn (phút) cho QR Code');
      return;
    }

    // Kiểm tra giá trị hợp lệ (từ 1 đến 120 phút)
    if (thoiGianHetHan < 1 || thoiGianHetHan > 120) {
      message.warning('Thời gian hết hạn phải từ 1 đến 120 phút');
      return;
    }

    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (!selectedNgayData) return;

    setLoading(prev => ({ ...prev, taoQR: true }));
    try {
      // Truyền thời gian hết hạn vào hàm createQRCode
      const qrData = await createQRCode(selectedNgayData.maTkb, thoiGianHetHan);
      setQrCodeData(qrData);
      setQrCodeExpired(false);
      
      const expireTime = moment(qrData.thoiGianKt);
      const now = moment();
      const minutesRemaining = expireTime.diff(now, 'minutes', true);
      
      message.success(`QR Code đã được tạo thành công! Còn hiệu lực ${Math.round(minutesRemaining)} phút`);
    } catch (error) {
      message.error('Không thể tạo QR Code');
      console.error('Error creating QR code:', error);
    } finally {
      setLoading(prev => ({ ...prev, taoQR: false }));
    }
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

  const getRemainingTime = () => {
    if (!qrCodeData || !qrCodeData.thoiGianKt) return null;
    
    const now = moment();
    const expireTime = moment(qrCodeData.thoiGianKt);
    const duration = moment.duration(expireTime.diff(now));
    
    if (duration.asSeconds() <= 0) return 'Đã hết hạn';
    
    const minutes = Math.floor(duration.asMinutes());
    const seconds = duration.seconds();
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Tạo QR code value từ dữ liệu
  const generateQRValue = () => {
    if (!qrCodeData) return '';
    
    // Tạo một object chứa thông tin cần thiết cho điểm danh
    const qrInfo = {
      id: qrCodeData.id,
      maTkb: qrCodeData.maTkb,
      ngayHoc: qrCodeData.ngayHoc,
      thoiGianKt: qrCodeData.thoiGianKt,
      type: 'attendance'
    };
    
    // Chuyển đổi thành JSON string
    return JSON.stringify(qrInfo);
  };

  // Copy QR code data to clipboard
  const copyQRData = async () => {
    try {
      const qrValue = generateQRValue();
      await navigator.clipboard.writeText(qrValue);
      message.success('Đã sao chép dữ liệu QR Code vào clipboard');
    } catch (error) {
      message.error('Không thể sao chép dữ liệu');
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

        {mode === 'thuCong' && danhSachSinhVien.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                onClick={handleDiemDanhThuCong}
                loading={loading.diemDanh}
                disabled={selectedStudents.length === 0}
              >
                Điểm danh ({selectedStudents.length})
              </Button>
            </div>
            
            <Table
              dataSource={danhSachSinhVien}
              columns={studentColumns}
              rowKey="maSv"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </>
        )}

        {mode === 'qr' && (
          <>
            {/* Thêm trường nhập thời gian hết hạn (bắt buộc) */}
            <Form.Item 
              label="Thời gian hết hạn QR Code (phút)" 
              required
              style={{ marginBottom: 16 }}
            >
              <InputNumber
                min={1}
                max={120}
                value={thoiGianHetHan}
                onChange={handleThoiGianHetHanChange}
                placeholder="Nhập số phút (1-120)"
                style={{ width: '100%' }}
                addonAfter="phút"
                status={!thoiGianHetHan || thoiGianHetHan <= 0 ? 'error' : ''}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                * Bắt buộc nhập. QR Code sẽ hết hạn sau {thoiGianHetHan || 0} phút kể từ khi tạo
              </div>
            </Form.Item>

            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<QrcodeOutlined />}
                onClick={handleTaoQR}
                loading={loading.taoQR}
                disabled={!selectedNgay || !thoiGianHetHan || thoiGianHetHan <= 0}
                size="large"
              >
                Tạo mã QR điểm danh
              </Button>
              {(!thoiGianHetHan || thoiGianHetHan <= 0) && (
                <div style={{ 
                  color: '#ff4d4f', 
                  fontSize: '12px', 
                  marginTop: 4,
                  fontStyle: 'italic'
                }}>
                  Vui lòng nhập thời gian hết hạn để tạo QR Code
                </div>
              )}
            </div>

            {qrCodeData && (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <QrcodeOutlined style={{ fontSize: 20 }} />
                    <span>Thông tin QR Code</span>
                  </div>
                }
                style={{ marginTop: 16 }}
                extra={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {qrCodeExpired ? (
                      <span style={{ color: 'red', fontWeight: 'bold' }}>
                        <ClockCircleOutlined /> Đã hết hạn
                      </span>
                    ) : (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>
                        <CheckCircleOutlined /> Còn hiệu lực
                      </span>
                    )}
                  </div>
                }
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Text strong>ID QR Code:</Text>
                    <div>{qrCodeData.id}</div>
                  </div>
                  <div>
                    <Text strong>Mã TKB:</Text>
                    <div>{qrCodeData.maTkb}</div>
                  </div>
                  <div>
                    <Text strong>Ngày học:</Text>
                    <div>{moment(qrCodeData.ngayHoc).format('DD/MM/YYYY')}</div>
                  </div>
                  <div>
                    <Text strong>Phòng học:</Text>
                    <div>{qrCodeData.phongHoc}</div>
                  </div>
                  <div>
                    <Text strong>Thời gian hết hạn:</Text>
                    <div>{moment(qrCodeData.thoiGianKt).format('DD/MM/YYYY HH:mm:ss')}</div>
                  </div>
                  <div>
                    <Text strong>Thời gian còn lại:</Text>
                    <div style={{ 
                      color: qrCodeExpired ? 'red' : 'green',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {getRemainingTime()}
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div style={{ textAlign: 'center' }}>
                  <Title level={4}>QR Code cho điểm danh</Title>
                  <div style={{ 
                    padding: 20, 
                    border: qrCodeExpired ? '2px dashed #ff4d4f' : '2px dashed #1890ff', 
                    borderRadius: 8,
                    backgroundColor: qrCodeExpired ? '#fff2f0' : '#f0f8ff',
                    display: 'inline-block',
                    position: 'relative'
                  }}>
                    <QRCodeSVG
                      value={generateQRValue()}
                      size={200}
                      level="M"
                      includeMargin={true}
                      fgColor={qrCodeExpired ? '#ff4d4f' : '#000000'}
                      bgColor="white"
                    />
                    {qrCodeExpired && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#ff4d4f'
                      }}>
                        ĐÃ HẾT HẠN
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <Button 
                      icon={<CopyOutlined />}
                      onClick={copyQRData}
                      disabled={qrCodeExpired}
                    >
                      Sao chép dữ liệu QR
                    </Button> 
                  </div>
                  <div style={{ marginTop: 8, color: '#666' }}>
                    <small>
                      {qrCodeExpired 
                        ? 'QR Code đã hết hạn, vui lòng tạo mã mới'
                        : 'Sinh viên quét mã này để điểm danh'
                      }
                    </small>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </Form>
    </Spin>
  );
};