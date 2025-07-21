import React, { useEffect, useState } from 'react';
import { Select, Button, Radio, InputNumber, Table, Form, message, Spin, Checkbox, Card, Typography, Divider, Popconfirm } from 'antd';
import { QrcodeOutlined, DeleteOutlined, CopyOutlined, CameraOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Modal, Input } from 'antd';
import moment from 'moment';
import {
  fetchHocKyList,
  fetchMonHocByGiaoVien,
  fetchNhomMonHoc,
  fetchNgayGiangDay,
  fetchSinhVienDiemDanh,
  markAttendanceManual,
  createQRCode,
  xoaDiemDanhThuCong
} from '../../../services/GiaoVien/TaoQR/QrcodeService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { GiaoVienService } from '../../../services/GiaoVien/HoSo/GiaoVienService.js';
import { responsiveArray } from 'antd/es/_util/responsiveObserver.js';
import { data } from 'autoprefixer';

const { Option } = Select;
const { Text, Title } = Typography;

export const DiemDanhComponents = () => {
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [hocKyList, setHocKyList] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState(null);
  const [monHocList, setMonHocList] = useState([]);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);
  const [nhomList, setNhomList] = useState([]);
  const [selectedNhom, setSelectedNhom] = useState(null);
  const [ngayList, setNgayList] = useState([]);
  const [selectedNgay, setSelectedNgay] = useState(null);

  // Mode and data
  const [mode, setMode] = useState('thuCong');
  const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [thoiGianHetHan, setThoiGianHetHan] = useState(5);
  const [ghiChuThuCong, setGhiChuThuCong] = useState({});

  // QR Code state
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrCodeExpired, setQrCodeExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  //Dùng cho quét QR sinh viên
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [startCamera, setStartCamera] = useState(false);

  // Loading states
  const [loading, setLoading] = useState({
    hocKy: false,
    monHoc: false,
    nhom: false,
    ngayGiangDay: false,
    sinhVien: false,
    diemDanh: false,
    taoQR: false,
    xoaDiemDanhThuCong: false
  });
  //hook mở modal bật cam quét QR sinh viên
  useEffect(() => {
    if (mode === 'svqr') {
      setShowScanner(true);
    }
    else {
      setShowScanner(false);
      setStartCamera(false);
    }
  }, [mode]);

  const stopScanning = () => {
    setShowScanner(false);
    setIsScanning(false);
  };
  const handleScan = async (result) => {
    if (result && result.length > 0) {
      const qrData = result[0].rawValue;
      if (isScanning || qrData === lastScanned) return;

      setIsScanning(true);
      setLastScanned(qrData);

      try {
        await processAttendance(qrData);
      } catch (error) {
        console.log('Lỗi xử lý QR', error);
      }
      finally {
        setTimeout(() => {
          setIsScanning(false);
          setLastScanned(null);
        }, 2000);
      }
    }
  };
  //Xử lý điểm danh
  const processAttendance = async (qrData) => {
    setLoading(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        //xử lý chuỗi masv-hoten-tenlop ||
        const delimiters = ['-', '_'];
        for (let delimiter of delimiters) {
          const parts = qrData.split(delimiter);
          if (parts.length >= 2) {
            const maSv = parts[0];
            const tenSv = parts[1];
            const third = parts[2];
            let field = 'tenLop';
            let value = third;
            if (/^\d{2}\.\d{2}\.\d{4}$/.test(third)) {
              const [dd, mm, yyyy] = third.split('.');
              value = `${yyyy}-${mm}-${dd}`;
              field = 'ngaySinh';
            }
            else if (/^\d{4}-\d{2}-\d{2}$/.test(third)) {
              field = 'ngaySinh';
            }

            parsedData = {
              maSv,
              tenSv,
              ...(third && { [field]: value })
            };
            break;
          }
        }
      }
      if (!parsedData) {
        message.error('QR Code không hợp lệ');
        return;
      }
      const { maSv, tenSv } = parsedData;
      if (!maSv) {
        message.error('Không tìm thấy thông tin sinh viên');
        return;
      }
      if (!selectedNgay) {
        message.error('Chưa chọn đầy đủ thông tin buổi học!');
        return;
      }
      const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
      const requestData = {
        maSv,
        maTkb: selectedNgayData.maTkb,
        ngayHoc: new Date().toISOString().split('T')[0],
        //ngayHoc:selectedNgayData.ngayHoc
      };

      await GiaoVienService.diemdanhQRSinhVien(requestData);
      message.success('Điểm danh thành công');
      await handleThuCong();
    } catch (error) {
      console.log('Lỗi điểm danh', error);
      const backendMessage = error?.response?.data?.message ||
        error?.response?.data || 'Điểm danh thất bại'
      message.error(backendMessage);
    }
    finally {
      setLoading(false);
    }
  }
  // Xử lý lỗi scanner
  const handleError = (error) => {
    console.error('Scanner error:', error);
    message.error('Lỗi camera: ' + error.message);
    setShowScanner(false);
    setIsScanning(false);
  };

  const maGv = user?.maGv || user?.id || user?.username;

  useEffect(() => {
    if (!isAuthenticated || !maGv) {
      message.error('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }
    console.log('Gọi API học kỳ với maGv:', maGv);
    loadHocKyList(maGv);
  }, [isAuthenticated, maGv]);


  // Load students when date is selected in manual mode
  useEffect(() => {
    if (mode === 'thuCong' && selectedNgay) {
      handleThuCong();
    }
    // } else {
    //   setDanhSachSinhVien([]);
    //   setSelectedStudents([]);
    // }
  }, [selectedNgay, mode]);

  // QR Code timer
  useEffect(() => {
    if (!qrCodeData || qrCodeExpired) {
      setRemainingTime(null);
      return;
    }

    const updateTimer = () => {
      const now = moment();
      const expireTime = moment(qrCodeData.thoiGianKt);
      const duration = moment.duration(expireTime.diff(now));

      if (duration.asSeconds() <= 0) {
        setQrCodeExpired(true);
        setRemainingTime('Đã hết hạn');
        setQrCodeData(null);
        message.warning('QR Code đã hết hạn!');
        return;
      }

      const totalSeconds = Math.floor(duration.asSeconds());
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      // Warning notifications
      if (totalSeconds === 60) message.warning('QR Code sẽ hết hạn trong 1 phút!');
      else if (totalSeconds === 30) message.warning('QR Code sẽ hết hạn trong 30 giây!');
      else if (totalSeconds === 10) message.error('QR Code sẽ hết hạn trong 10 giây!');
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [qrCodeData, qrCodeExpired]);

  const loadHocKyList = async (maGv) => {
    setLoading(prev => ({ ...prev, hocKy: true }));
    try {
      const data = await fetchHocKyList(maGv);
      console.log('Danh sách học kỳ:', data);
      setHocKyList(data);
    } catch (error) {
      console.error('Lỗi tải học kỳ:', error);
      message.error('Không thể tải danh sách học kỳ');
    } finally {
      setLoading(prev => ({ ...prev, hocKy: false }));
    }
  };



  const handleHocKyChange = async (value) => {
    if (!maGv) return;

    const selectedHocKyData = hocKyList.find(hk => hk.hocKy === value);
    if (!selectedHocKyData) return;

    resetSelections();
    setSelectedHocKy(value);

    setLoading(prev => ({ ...prev, monHoc: true }));
    try {
      const data = await fetchMonHocByGiaoVien(maGv, selectedHocKyData.hocKy, selectedHocKyData.namHoc);
      setMonHocList(data);
    } catch (error) {
      message.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(prev => ({ ...prev, monHoc: false }));
    }
  };

  const handleMonHocChange = async (value) => {
    if (!maGv) return;

    const selectedMonHocData = monHocList.find(mh => mh.maMh === value);
    const selectedHocKyData = hocKyList.find(hk => hk.hocKy === selectedHocKy);


    if (!selectedMonHocData || !selectedHocKyData) return;

    setSelectedMonHoc(value);
    resetSubSelections();

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
    resetDataState();

    setLoading(prev => ({ ...prev, ngayGiangDay: true }));
    try {
      const data = await fetchNgayGiangDay(selectedNhomData.maGd);
      setNgayList(data);
    } catch (error) {
      message.error('Không thể tải danh sách ngày giảng dạy');
    } finally {
      setLoading(prev => ({ ...prev, ngayGiangDay: false }));
    }
  };

  const handleNgayChange = (value) => {
    setSelectedNgay(value);
    resetDataState();
  };

  const handleThuCong = async () => {
    if (!selectedNgay) return;

    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (!selectedNgayData) return;

    setLoading(prev => ({ ...prev, sinhVien: true }));
    try {
      //Lấy dssv điểm danh có chứa diemDanh1 diemDanh2 xem từ console log
      const data = await fetchSinhVienDiemDanh(selectedNgayData.maTkb);
      //Sắp xếp time điểm danh
      const sortedData = [...data].sort((a, b) => {
        const fisrtTime = new Date(a.diemDanh2 || a.diemDanh1 || 0);
        const secondTime = new Date(b.diemDanh2 || b.diemDanh1 || 0);
        return secondTime - fisrtTime; //sort theo time điểm danh gần nhất
      });
      setDanhSachSinhVien(sortedData);
      setSelectedStudents([]);
    } catch (error) {
      message.error('Không thể tải danh sách sinh viên');
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
      const promises = selectedStudents.map(maSv =>
        markAttendanceManual({
          maTkb: selectedNgayData.maTkb,
          maSv: maSv,
          ngayHoc: selectedNgayData.ngayHoc,
          ghiChu: typeof ghiChuThuCong[maSv] === 'string'
            ? ghiChuThuCong[maSv].trim()
            : 'Điểm danh thủ công'
        })
      );

      await Promise.all(promises);
      message.success(`Điểm danh thành công`);
      handleThuCong();
    } catch (error) {
      console.log('Lỗi điểm danh', error);
      const backendMessage = error?.response?.data?.message ||
        error?.response?.data || 'Điểm danh thất bại'
      message.error(backendMessage);
    } finally {
      setLoading(prev => ({ ...prev, diemDanh: false }));
    }
  };

  const handleDeleteMultipleAttendance = async () => {
    if (selectedStudents.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sinh viên để xóa điểm danh');
      return;
    }
    console.log('selectedStudents', selectedStudents.length);
    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (!selectedNgayData) return;

    const attendedStudents = selectedStudents.filter(maSv =>
      danhSachSinhVien.find(sv => sv.maSv === maSv)
    );

    if (attendedStudents.length === 0) {
      message.warning('Không có sinh viên nào đã điểm danh trong danh sách được chọn');
      return;
    }

    setLoading(prev => ({ ...prev, xoaDiemDanhThuCong: true }));
    try {
      const promises = attendedStudents.map(maSv =>
        xoaDiemDanhThuCong(maSv,
          selectedNgayData.maTkb,
          selectedNgayData.ngayHoc,
          ghiChuThuCong[maSv])
      );


      await Promise.all(promises);
      message.success(`Xóa điểm danh thành công cho ${attendedStudents.length} sinh viên`);
      handleThuCong();
      setSelectedStudents([]);
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa điểm danh');
    } finally {
      setLoading(prev => ({ ...prev, xoaDiemDanhThuCong: false }));
    }
  };

  const handleTaoQR = async () => {
    if (!selectedNgay || !thoiGianHetHan || thoiGianHetHan <= 0) {
      message.warning('Vui lòng chọn ngày giảng dạy và nhập thời gian hết hạn');
      return;
    }

    if (thoiGianHetHan < 1 || thoiGianHetHan > 120) {
      message.warning('Thời gian hết hạn phải từ 1 đến 120 phút');
      return;
    }

    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (!selectedNgayData) return;

    setLoading(prev => ({ ...prev, taoQR: true }));
    try {
      const qrData = await createQRCode(selectedNgayData.maTkb, thoiGianHetHan);
      setQrCodeData(qrData);
      setQrCodeExpired(false);
      message.success('QR Code đã được tạo thành công!');
    } catch (error) {
      message.error('Không thể tạo QR Code');
    } finally {
      setLoading(prev => ({ ...prev, taoQR: false }));
    }
  };

  // Helper functions
  const resetSelections = () => {
    setSelectedMonHoc(null);
    setSelectedNhom(null);
    setSelectedNgay(null);
    setMonHocList([]);
    setNhomList([]);
    setNgayList([]);
    resetDataState();
  };

  const resetSubSelections = () => {
    setSelectedNhom(null);
    setSelectedNgay(null);
    setNhomList([]);
    setNgayList([]);
    resetDataState();
  };

  const resetDataState = () => {
    setDanhSachSinhVien([]);
    setSelectedStudents([]);
    setQrCodeData(null);
    setQrCodeExpired(false);
  };

  const handleSelectAllStudents = (checked) => {
    if (checked) {
      setSelectedStudents(danhSachSinhVien.map(sv => sv.maSv));
    } else {
      setSelectedStudents([]);
    }
  };

  const generateQRValue = () => {
    if (!qrCodeData) return '';
    return JSON.stringify({
      id: qrCodeData.id,
      maTkb: qrCodeData.maTkb,
      ngayHoc: qrCodeData.ngayHoc,
      expiry: qrCodeData.thoiGianKt
    });
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(generateQRValue());
    message.success('Đã sao chép dữ liệu QR Code');
  };

  const getUnattendedCount = () => {
    return selectedStudents.filter(maSv =>
      danhSachSinhVien.find(sv => sv.maSv === maSv)?.ghiChu !== 'Đã điểm danh lần 1'
    ).length;
  };

  const getAttendedCount = () => {
    return selectedStudents.filter(maSv =>
      danhSachSinhVien.find(sv => sv.maSv === maSv));
  };

  // Table columns
  const studentColumns = [
    {
      title: (
        <Checkbox
          onChange={(e) => handleSelectAllStudents(e.target.checked)}
          checked={selectedStudents.length > 0 && selectedStudents.length === danhSachSinhVien.length}
          indeterminate={selectedStudents.length > 0 && selectedStudents.length < danhSachSinhVien.length}
        >
          Chọn
        </Checkbox>
      ),
      dataIndex: 'select',
      width: 80,
      render: (_, record) => (
        <Checkbox
          checked={selectedStudents.includes(record.maSv)}
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
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      width: 200,
      render: (ghiChu, record) => {
        const maSv = record.maSv;
        const isSelected = selectedStudents.includes(maSv);
        const currentValue = typeof ghiChuThuCong[maSv] === 'string'
          ? ghiChuThuCong[maSv]
          : (typeof ghiChu === 'string' ? ghiChu : '');

        return (
          <div
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              padding: '4px 6px',
              border: isSelected ? '1px solid #d9d9d9' : 'none',
              borderRadius: 4,
              backgroundColor: isSelected ? '#fefefe' : 'transparent',
              cursor: isSelected ? 'text' : 'default',
              minHeight: 30
            }}
            onBlur={(e) => {
              const value = e.target.innerText.trim();
              setGhiChuThuCong(prev => ({
                ...prev,
                [maSv]: value // ✅ chỉ lưu chuỗi vào đúng sinh viên
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          >
            {currentValue}
          </div>
        );
      }
    }


  ];


  // Validation
  if (!isAuthenticated || !maGv) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Vui lòng đăng nhập để sử dụng chức năng này</p>
      </div>
    );
  }

  return (
    <Spin spinning={Object.values(loading).some(Boolean)}>
      <Form layout="vertical" style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>

        {/* Form Controls */}
        <Form.Item label="Chọn học kỳ">
          <Select
            onChange={handleHocKyChange}
            placeholder="Chọn học kỳ"
            loading={loading.hocKy}
          >
            {hocKyList.map((hk) => (
              <Option
                key={`${hk.hocKy}-${hk.namHoc}`}
                value={`${hk.hocKy}-${hk.namHoc}`}
              >
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
            <Radio.Button onClick={() => {
              setShowScanner(true);
              setStartCamera(false);
            }} value="svqr">Quét mã</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {mode === 'svqr' && (
          <>
            <Modal
              title="Quét mã QR sinh viên"
              open={showScanner}
              onCancel={stopScanning}
              footer={null}
              width={400}
            >
              <div className="text-center">
                {!startCamera ? (
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    onClick={() => setStartCamera(true)}
                    onCancel={() => {
                      setShowScanner(false);
                      setStartCamera(false);
                    }}
                    disabled={isScanning || loading.diemDanh}
                    className="mb-3"
                  >
                    {isScanning ? 'Đang quét...' : 'Bắt đầu quét mã QR sinh viên'}
                  </Button>
                ) : (
                  <>
                    <Scanner
                      onScan={handleScan}
                      onError={handleError}
                      constraints={{
                        video: {
                          facingMode: 'user' // Camera trước
                        }
                      }}
                      components={{
                        audio: false,
                        finder: true
                      }}
                      styles={{
                        container: { width: '100%', height: '300px' }
                      }}
                    />
                    <p className="mt-3 text-gray-600">
                      Đưa QR code vào khung để scan
                    </p>
                  </>
                )}
              </div>
            </Modal>
          </>
        )}

        {/* Manual Attendance Mode */}
        {mode === 'thuCong' && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
              <Button
                type="primary"
                onClick={handleDiemDanhThuCong}
                loading={loading.diemDanh}
                disabled={getUnattendedCount() === 0}
              >
                Điểm danh
              </Button>

              <Popconfirm
                title={`Bạn có chắc muốn xóa điểm danh của ${getAttendedCount()} sinh viên đã chọn?`}
                onConfirm={handleDeleteMultipleAttendance}
                okText="Xóa"
                cancelText="Hủy"
                disabled={getAttendedCount() === 0}
              >
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  loading={loading.xoaDiemDanhThuCong}
                  disabled={getAttendedCount() === 0}
                >
                  Xóa điểm danh ({getAttendedCount()})
                </Button>
              </Popconfirm>
            </div>
          </>
        )}

        {/* QR Code Mode */}
        {mode === 'qr' && (
          <>
            <Form.Item label="Thời gian hết hạn QR Code (phút)" required>
              <InputNumber
                min={1}
                max={120}
                value={thoiGianHetHan}
                onChange={setThoiGianHetHan}
                placeholder="Nhập số phút (1-120)"
                style={{ width: '100%' }}
                addonAfter="phút"
              />
            </Form.Item>

            <Form.Item>
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
            </Form.Item>

            {/* QR Code Display */}
            {qrCodeData && (
              <Card title="QR Code điểm danh" style={{ marginTop: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <Text strong>ID:</Text> {qrCodeData.id}
                  </div>
                  <div>
                    <Text strong>Mã TKB:</Text> {qrCodeData.maTkb}
                  </div>
                  <div>
                    <Text strong>Ngày học:</Text> {moment(qrCodeData.ngayHoc).format('DD/MM/YYYY')}
                  </div>
                  <div>
                    <Text strong>Phòng học:</Text> {qrCodeData.phongHoc}
                  </div>
                  <div>
                    <Text strong>Hết hạn:</Text> {moment(qrCodeData.thoiGianKt).format('DD/MM/YYYY HH:mm:ss')}
                  </div>
                  <div>
                    <Text strong>Còn lại:</Text>
                    <span style={{
                      color: qrCodeExpired ? 'red' : 'green',
                      fontWeight: 'bold'
                    }}>
                      {remainingTime || 'Đang tính...'}
                    </span>
                  </div>
                </div>


                <Divider />


                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    padding: 20,
                    border: qrCodeExpired ? '2px dashed #ff4d4f' : '2px dashed #1890ff',
                    borderRadius: 8,
                    display: 'inline-block',
                    position: 'relative'
                  }}>
                    <QRCodeSVG
                      value={generateQRValue()}
                      size={200}
                      level="M"
                      includeMargin={true}
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
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#ff4d4f'
                      }}>
                        ĐÃ HẾT HẠN
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Button
                      icon={<CopyOutlined />}
                      onClick={copyQRData}
                      disabled={qrCodeExpired}
                    >
                      Sao chép dữ liệu QR
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
        {danhSachSinhVien.length > 0 && (
          <Table
            dataSource={danhSachSinhVien}
            columns={studentColumns}
            rowKey="maSv"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
          />
        )}
      </Form>
    </Spin>
  );
};