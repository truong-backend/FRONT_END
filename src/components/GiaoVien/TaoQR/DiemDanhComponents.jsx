import React, { useEffect, useState, useRef } from 'react';
import { Select, Button, Radio, InputNumber, Table, Form, message, Spin, Checkbox, Card, Typography, Divider, Popconfirm } from 'antd';
import { QrcodeOutlined, DeleteOutlined, CopyOutlined, CameraOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Modal, Input } from 'antd';
import moment from 'moment';
import * as faceapi from 'face-api.js';

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
import Webcam from 'react-webcam';
import { use } from 'react';

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
  const [selectedStudents2, setSelectedStudents2] = useState([]);
  const [isCheckedDiemDanh, setIsCheckedDiemDanh] = useState(false);
  const [isCheckedDiemDanh2, setIsCheckedDiemDanh2] = useState(false);

  const [thoiGianHetHan, setThoiGianHetHan] = useState(5);
  const [ghiChuThuCong, setGhiChuThuCong] = useState({});
  const [soLanDiemDanh, setSoLanDiemDanh] = useState(0);
  // QR Code state
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrCodeExpired, setQrCodeExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [openQRModal, setOpenQRModal] = useState(true);

  //Dùng cho quét QR sinh viên
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [startCamera, setStartCamera] = useState(false);

  //Điểm danh khuôn mặt
  const webcamRef = useRef(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasDetectedSuccess, setHasDetectedSuccess] = useState(false);

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
  const soLuongDaDiemDanh = () => {
    let count = 0;
    danhSachSinhVien?.forEach(sv => {
      if (sv.ghiChu && sv.ghiChu.trim() !== '') {
        count += 1;
      }
    });
    return count;
  };

  //hook dùng face api
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      ]);
      console.log("Face-api.js models đã load xong");
    };

    loadModels();
  }, []);

  //hook xử lý điểm danh nhận diện khuôn mặt
  useEffect(() => {
    let interval;

    if (
      mode === 'detectFace' &&
      startCamera &&
      cameraReady &&
      !isDetecting &&
      !hasDetectedSuccess
    ) {
      interval = setInterval(async () => {
        if (webcamRef.current?.video) {
          const video = webcamRef.current.video;

          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          );

          if (detections.length > 0) {
            const canvas = faceapi.createCanvasFromMedia(video);
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
              if (!blob) return;
              const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });

              const selectedNgayData = ngayList.find(
                (ngay) => ngay.maTkb === selectedNgay
              );
              const requestData = {
                maTkb: selectedNgayData.maTkb,
                ngayHoc: selectedNgayData.ngayHoc,
                ghiChu: 'Điểm danh bằng khuôn mặt',
              };

              try {
                setIsDetecting(true);
                const result = await GiaoVienService.diemDanhFace(file, requestData);
                if (result === 'Điểm danh thành công') {
                  setHasDetectedSuccess(true);
                  message.success('Điểm danh thành công');
                  await handleThuCong();
                } else {
                  message.warning(result || 'Không xác định được khuôn mặt');
                }
              } catch (error) {
                console.error('Lỗi điểm danh khuôn mặt:', error);
                const backendMessage = error?.response?.data?.message ||
                  error?.response?.data || 'Điểm danh nhận diện khuôn mặt thất bại';
                message.error(backendMessage);
              } finally {
                setIsDetecting(false);
              }
            }, 'image/jpeg');
          }
        }
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, startCamera, cameraReady, isDetecting, hasDetectedSuccess, webcamRef]);

  useEffect(() => {
    setIsCheckedDiemDanh(true);
    setIsCheckedDiemDanh2(false);
    const ghiChuTrim = danhSachSinhVien.map(sv => sv.ghiChu?.trim());
    const disableDiemdanh1 = ghiChuTrim.every(ghiChu => ghiChu === 'Điểm danh lần 1' || ghiChu === 'Điểm danh lần 2');
    const disableDiemDanh2 = ghiChuTrim.every(ghiChu => ghiChu === 'Điểm danh lần 2');

    setIsCheckedDiemDanh(disableDiemdanh1);
    setIsCheckedDiemDanh2(disableDiemDanh2);
  }, [selectedNgay, danhSachSinhVien]);

  //load lại lần điểm danh
  useEffect(() => {
    if (selectedNgay) {
      setSoLanDiemDanh(0);
    }
  }, [selectedNgay]);

  // //reaload sau khi sinh viên quét qr buổi học (dành cho pp tạo qr)
  useEffect(() => {
    let intervalId;
    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (mode === 'qr' && qrCodeData && !qrCodeExpired && selectedNgayData) {
      intervalId = setInterval(() => {
        handleThuCong();
      }, 2000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    }
  }, [mode, qrCodeData, qrCodeExpired]);

  //reload dssv sau đổi mode và chọn lại ngày giảng dạy
  useEffect(() => {
    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (mode && selectedNgayData) {
      handleThuCong();
    }
  }, [mode, selectedNgay]);
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
        //ngayHoc: new Date().toISOString().split('T')[0],
        ngayHoc: selectedNgayData.ngayHoc
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

  const maGvAu = user?.maGv || user?.id || user?.username;

  useEffect(() => {
    if (!isAuthenticated || !maGvAu) {
      message.error('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }
    console.log('Gọi API học kỳ với maGv:', maGvAu);
    loadHocKyList(maGvAu);
  }, [isAuthenticated, maGvAu]);


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

  const loadHocKyList = async (maGvAu) => {
    setLoading(prev => ({ ...prev, hocKy: true }));
    try {
      const data = await fetchHocKyList(maGvAu);
      console.log('Danh sách học kỳ:', data);
      setHocKyList(data);
    } catch (error) {
      console.error('Lỗi tải học kỳ:', error);
      
    } finally {
      setLoading(prev => ({ ...prev, hocKy: false }));
    }
  };

  const handleSelectAllDiemDanh1 = (checked) => {
    if (checked) {
      const allIds = danhSachSinhVien.map(sv => sv.maSv);
      setSelectedStudents(allIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectAllDiemDanh2 = (checked) => {
    if (checked) {
      const allIds = danhSachSinhVien.map(sv => sv.maSv);
      setSelectedStudents2(allIds);
    } else {
      setSelectedStudents2([]);
    }
  };


  const handleHocKyChange = async (value) => {
    if (!maGvAu) return;

    const selectedHocKyData = hocKyList.find(hk => hk.hocKy === value);
    if (!selectedHocKyData) return;

    resetSelections();
    setSelectedHocKy(value);

    setLoading(prev => ({ ...prev, monHoc: true }));
    try {
      const data = await fetchMonHocByGiaoVien(maGvAu, selectedHocKyData.hocKy, selectedHocKyData.namHoc);
      setMonHocList(data);
    } catch (error) {
      message.error('Không thể tải danh sách môn học');
    } finally {
      setLoading(prev => ({ ...prev, monHoc: false }));
    }
  };

  const handleMonHocChange = async (value) => {
    if (!maGvAu) return;

    const selectedMonHocData = monHocList.find(mh => mh.maMh === value);
    const selectedHocKyData = hocKyList.find(hk => hk.hocKy === selectedHocKy);


    if (!selectedMonHocData || !selectedHocKyData) return;

    setSelectedMonHoc(value);
    resetSubSelections();

    setLoading(prev => ({ ...prev, nhom: true }));
    try {
      const data = await fetchNhomMonHoc(
        maGvAu,
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
        const fisrtTime = new Date(a.diemDanh1 || 0);
        const secondTime = new Date(b.diemDanh1 || 0);
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
    const allSelected = [...new Set([...selectedStudents, ...selectedStudents2])];

    if (allSelected.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sinh viên để điểm danh');
      return;
    }

    const selectedNgayData = ngayList.find(ngay => ngay.maTkb === selectedNgay);
    if (!selectedNgayData) return;

    setLoading(prev => ({ ...prev, diemDanh: true }));
    try {
      const allSelected = [...new Set([...selectedStudents, ...selectedStudents2])];
      const promises = allSelected.map(maSv =>
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
      setOpenQRModal(true);
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
    const selectedAll = [...new Set([...selectedStudents, ...selectedStudents2])];
    return selectedAll.filter(maSv =>
      danhSachSinhVien.find(sv => sv.maSv === maSv)
    ).length;
  };


  const getAttendedCount = () => {
    return selectedStudents.filter(maSv =>
      danhSachSinhVien.find(sv => sv.maSv === maSv).ghiChu === 'Đã điểm danh');
  };

  // Table columns
  const studentColumns = [
    {
      title: (
        <Checkbox
          onChange={(e) => handleSelectAllDiemDanh1(e.target.checked)}
          checked={selectedStudents.length > 0 && selectedStudents.length === danhSachSinhVien.length}
          indeterminate={selectedStudents.length > 0 && selectedStudents.length < danhSachSinhVien.length}
          disabled={isCheckedDiemDanh}
        >
          Điểm danh 1
        </Checkbox>
      ),
      dataIndex: 'diemDanh1',
      width: 130,
      render: (_, record) => {
        return (
          <Checkbox
            checked={selectedStudents.includes(record.maSv)}
            disabled={isCheckedDiemDanh}
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedStudents(prev =>
                checked
                  ? [...prev, record.maSv]
                  : prev.filter(id => id !== record.maSv)
              );
            }}
          />
        );
      }
    },
    {
      title: (
        <Checkbox
          onChange={(e) => handleSelectAllDiemDanh2(e.target.checked)}
          checked={selectedStudents2.length > 0 && selectedStudents2.length === danhSachSinhVien.length}
          indeterminate={selectedStudents2.length > 0 && selectedStudents2.length < danhSachSinhVien.length}
          disabled={isCheckedDiemDanh2}
        >
          Điểm danh 2
        </Checkbox>
      ),
      dataIndex: 'diemDanh2',
      width: 130,
      render: (_, record) => {

        return (
          <Checkbox
            checked={selectedStudents2.includes(record.maSv)}
            disabled={isCheckedDiemDanh2}
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectedStudents2(prev =>
                checked
                  ? [...prev, record.maSv]
                  : prev.filter(id => id !== record.maSv)
              );
            }}
          />
        );
      }
    },
    { title: 'MSSV', dataIndex: 'maSv', width: 120 },
    { title: 'Họ tên', dataIndex: 'tenSv' },
    { title: 'Lớp', dataIndex: 'tenLop', width: 100 },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      width: 200,
    }
  ];



  // Validation
  if (!isAuthenticated || !maGvAu) {
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
            placeholder="Chọn học kỳ  "
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
          <Radio.Group className='flex gap-4' value={mode} onChange={(e) => setMode(e.target.value)}>
            <Radio.Button className='bg-transparent hover:bg-blue-400 text-blue-700 hover:!text-white rounded hover:font-bold' value="thuCong">Thủ công</Radio.Button>
            <Radio.Button className='bg-transparent hover:bg-blue-400 text-blue-700 hover:!text-white rounded hover:font-bold' value="qr">Tạo QR</Radio.Button>
            <Radio.Button className='bg-transparent hover:bg-blue-400 text-blue-700 hover:!text-white rounded hover:font-bold'
              onClick={() => {
              setShowScanner(true);
              setSoLanDiemDanh(prev => prev + 1);
              setStartCamera(false);
            }} value="svqr">Quét mã</Radio.Button>
            <Radio.Button className='bg-transparent hover:bg-blue-400 text-blue-700 hover:!text-white rounded hover:font-bold'
                onClick={() => {
                setMode("detectFace");
                setShowFaceModal(true);
                setShowScanner(false);
                setStartCamera(false);
                setHasDetectedSuccess(false);
              }}
              value="detectFace"
            >Nhận diện khuôn mặt</Radio.Button>
          </Radio.Group>
          <div className="mt-8">
            Đã điểm danh: <strong>{soLuongDaDiemDanh()}</strong> / <strong>{danhSachSinhVien.length}</strong> sinh viên<strong></strong>
          </div>
        </Form.Item>
        {mode == 'detectFace' && (
          <Modal
            title="Điểm danh bằng nhận diện khuôn mặt"
            open={showFaceModal}
            onCancel={() => {
              setShowFaceModal(false);
              setStartCamera(false);
            }}
            footer={null}
            width={1000}
            height={1000}
          >
            <div className="text-center">
              {!startCamera ? (
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={() => setStartCamera(true)}
                  className="mb-3"
                >
                  Bật camera
                </Button>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    width={400}
                    videoConstraints={{ facingMode: "user" }}
                    onUserMedia={() => setCameraReady(true)}
                  />
                  <p className="mt-3 text-gray-600">Đang nhận diện khuôn mặt...</p>
                </>
              )}
            </div>
          </Modal>
        )}
        {mode === 'svqr' && (
          <>
            <Modal
              title={`Quét mã QR sinh viên`}
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
                    onClick={() => {
                      setStartCamera(true);
                    }}
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
                          facingMode: 'user'
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

              {/* <Popconfirm
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
                  Xóa điểm danh
                </Button>
              </Popconfirm> */}
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
              <Modal
                title="QR Code điểm danh"
                open={openQRModal}
                onCancel={() => setOpenQRModal(false)}
                footer={null}
                centered
                width={600}
              >
                {qrCodeData && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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
                          size={500}
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
                    </div>
                  </>
                )}
              </Modal>
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