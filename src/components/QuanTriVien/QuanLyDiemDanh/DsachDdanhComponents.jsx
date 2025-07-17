import React, { useState, useEffect } from 'react';
import {
  Table, Input, Space, Button, Popconfirm, message, Modal, Form,
  DatePicker, Radio, Upload, Avatar, Select
} from 'antd';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { diemdanhService } from '../../../services/Admin/diemdanhService';

const { Option } = Select;

export const DsachDdanhComponents = () => {
  const [loading, setLoading] = useState(false);
  const [monhoc, setMonHoc] = useState([]);
  const [hocKy, setHocKy] = useState([]);
  const [giangVien, setGiangVien] = useState([]);
  const [diemDanhData, setDiemDanhData] = useState([]);

  // Filter states
  const [selectedHocKy, setSelectedHocKy] = useState(null);
  const [selectedNamHoc, setSelectedNamHoc] = useState(null);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);
  const [selectedGiangVien, setSelectedGiangVien] = useState(null);

  // Hàm xuất Excel
  const exportToExcel = () => {
    try {
      if (diemDanhData.length === 0) {
        message.warning('Không có dữ liệu để xuất');
        return;
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = diemDanhData.map((item, index) => {
        const tyLeVang = item.soBuoiHoc > 0 
          ? ((item.soBuoiVang / item.soBuoiHoc) * 100).toFixed(1)
          : 0;

        return {
          'STT': index + 1,
          'Mã SV': item.mssv,
          'Họ và tên': item.hoVaTen,
          'Tên lớp': item.tenLop,
          'Số buổi học': item.soBuoiHoc,
          'Số buổi điểm danh': item.soBuoiDiemDanh,
          'Số buổi vắng': item.soBuoiVang,
          'Tỷ lệ vắng (%)': `${tyLeVang}%`
        };
      });

      // Tạo workbook và worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Thiết lập độ rộng cột
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 12 },  // Mã SV
        { wch: 25 },  // Họ và tên
        { wch: 15 },  // Tên lớp
        { wch: 12 },  // Số buổi học
        { wch: 15 },  // Số buổi điểm danh
        { wch: 12 },  // Số buổi vắng
        { wch: 15 }   // Tỷ lệ vắng
      ];
      ws['!cols'] = colWidths;

      // Thêm thông tin header
      const headerInfo = [];
      
      // Thêm tiêu đề
      headerInfo.push(['DANH SÁCH ĐIỂM DANH SINH VIÊN']);
      headerInfo.push(['']); // Dòng trống
      
      // Thêm thông tin bộ lọc
      if (selectedHocKy && selectedNamHoc) {
        const hocKyInfo = hocKy.find(item => 
          item.hocKy === selectedHocKy && item.namHoc === selectedNamHoc
        );
        headerInfo.push([`Học kỳ: ${hocKyInfo?.hocKyDisplay || `${selectedHocKy} - ${selectedNamHoc}`}`]);
      }
      
      if (selectedMonHoc) {
        const monHocInfo = monhoc.find(item => item.maMh === selectedMonHoc);
        headerInfo.push([`Môn học: ${monHocInfo?.tenMh || selectedMonHoc}`]);
      }
      
      if (selectedGiangVien) {
        const giangVienInfo = giangVien.find(item => item.maGv === selectedGiangVien);
        headerInfo.push([`Giảng viên: ${giangVienInfo?.tenGv || selectedGiangVien}`]);
      }
      
      headerInfo.push([`Tổng số sinh viên: ${diemDanhData.length}`]);
      headerInfo.push([`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`]);
      headerInfo.push(['']); // Dòng trống

      // Tạo worksheet mới với header info
      const wsWithHeader = XLSX.utils.aoa_to_sheet(headerInfo);
      
      // Thêm dữ liệu vào worksheet
      XLSX.utils.sheet_add_json(wsWithHeader, excelData, { 
        origin: `A${headerInfo.length + 1}`,
        skipHeader: false 
      });

      // Thiết lập style cho tiêu đề
      if (wsWithHeader['A1']) {
        wsWithHeader['A1'].s = {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' }
        };
      }

      // Merge cell cho tiêu đề
      wsWithHeader['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } } // Merge tiêu đề
      ];

      // Thiết lập độ rộng cột cho worksheet mới
      wsWithHeader['!cols'] = colWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, wsWithHeader, 'Danh sách điểm danh');

      // Tạo tên file
      let fileName = 'DanhSach_DiemDanh';
      if (selectedHocKy && selectedNamHoc) {
        fileName += `_HK${selectedHocKy}_${selectedNamHoc}`;
      }
      if (selectedMonHoc) {
        const monHocInfo = monhoc.find(item => item.maMh === selectedMonHoc);
        fileName += `_${monHocInfo?.tenMh?.replace(/\s+/g, '_') || selectedMonHoc}`;
      }
      fileName += `_${new Date().toISOString().slice(0, 10)}.xlsx`;

      // Xuất file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileName);

      message.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      message.error('Có lỗi xảy ra khi xuất Excel');
    }
  };

  // Load danh sách học kỳ khi component mount
  const getDanhSachHocKy = async () => {
    try {
      setLoading(true);
      const data = await diemdanhService.getDanhSachHocKy();
      setHocKy(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách học kỳ');
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách môn học theo học kỳ
  const getDanhSachMonHoc = async (hocKy, namHoc) => {
    if (!hocKy || !namHoc) return;
    
    try {
      setLoading(true);
      const data = await diemdanhService.getDanhSachMonHoc(hocKy, namHoc);
      setMonHoc(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách giảng viên theo môn học
  const getDanhSachGiangVien = async (hocKy, namHoc, maMh) => {
    if (!hocKy || !namHoc || !maMh) return;
    
    try {
      setLoading(true);
      const data = await diemdanhService.getDanhSachGiangVien(hocKy, namHoc, maMh);
      setGiangVien(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu điểm danh
  const loadDiemDanhData = async () => {
    if (!selectedHocKy || !selectedNamHoc) {
      message.warning('Vui lòng chọn học kỳ');
      return;
    }

    try {
      setLoading(true);
      let data = [];

      if (selectedGiangVien && selectedMonHoc) {
        // Lấy điểm danh theo đầy đủ tham số
        data = await diemdanhService.getDanhSachDiemDanhTheoGiangVien(
          selectedHocKy, 
          selectedNamHoc, 
          selectedMonHoc, 
          selectedGiangVien
        );
      } else if (selectedMonHoc) {
        // Lấy điểm danh theo môn học
        data = await diemdanhService.getDanhSachDiemDanhTheoMonHoc(
          selectedHocKy, 
          selectedNamHoc, 
          selectedMonHoc
        );
      } else {
        // Lấy điểm danh theo học kỳ
        data = await diemdanhService.getDanhSachDiemDanhTheoHocKy(
          selectedHocKy, 
          selectedNamHoc
        );
      }

      setDiemDanhData(data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu điểm danh');
    } finally {
      setLoading(false);
    }
  };

  // Handle học kỳ change
  const handleHocKyChange = (value) => {
    if (!value) {
      setSelectedHocKy(null);
      setSelectedNamHoc(null);
      setSelectedMonHoc(null);
      setSelectedGiangVien(null);
      setMonHoc([]);
      setGiangVien([]);
      setDiemDanhData([]);
      return;
    }

    const selectedItem = hocKy.find(item => `${item.hocKy}-${item.namHoc}` === value);
    if (selectedItem) {
      setSelectedHocKy(selectedItem.hocKy);
      setSelectedNamHoc(selectedItem.namHoc);
      setSelectedMonHoc(null);
      setSelectedGiangVien(null);
      setMonHoc([]);
      setGiangVien([]);
      
      // Load môn học theo học kỳ đã chọn
      getDanhSachMonHoc(selectedItem.hocKy, selectedItem.namHoc);
    }
  };

  // Handle môn học change
  const handleMonHocChange = (value) => {
    setSelectedMonHoc(value);
    setSelectedGiangVien(null);
    setGiangVien([]);
    
    if (value && selectedHocKy && selectedNamHoc) {
      // Load giảng viên theo môn học đã chọn
      getDanhSachGiangVien(selectedHocKy, selectedNamHoc, value);
    }
  };

  // Handle giảng viên change
  const handleGiangVienChange = (value) => {
    setSelectedGiangVien(value);
  };

  // Handle tìm kiếm
  const handleSearch = () => {
    loadDiemDanhData();
  };

  // Handle reset
  const handleReset = () => {
    setSelectedHocKy(null);
    setSelectedNamHoc(null);
    setSelectedMonHoc(null);
    setSelectedGiangVien(null);
    setMonHoc([]);
    setGiangVien([]);
    setDiemDanhData([]);
  };

  // Table configuration
  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'mssv',
      width: '15%',
      sorter: (a, b) => a.mssv.localeCompare(b.mssv),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'hoVaTen',
      width: '20%',
      sorter: (a, b) => a.hoVaTen.localeCompare(b.hoVaTen),
    },
    {
      title: 'Tên lớp',
      dataIndex: 'tenLop',
      width: '15%',
      sorter: (a, b) => a.tenLop.localeCompare(b.tenLop),
    },
    {
      title: 'Số buổi học',
      dataIndex: 'soBuoiHoc',
      width: '12%',
      sorter: (a, b) => a.soBuoiHoc - b.soBuoiHoc,
    },
    {
      title: 'Số buổi điểm danh',
      dataIndex: 'soBuoiDiemDanh',
      width: '15%',
      sorter: (a, b) => a.soBuoiDiemDanh - b.soBuoiDiemDanh,
    },
    {
      title: 'Số buổi vắng',
      dataIndex: 'soBuoiVang',
      width: '12%',
      sorter: (a, b) => a.soBuoiVang - b.soBuoiVang,
      render: (value) => (
        <span style={{ color: value > 0 ? 'red' : 'green' }}>
          {value}
        </span>
      )
    },
    {
      title: 'Tỷ lệ vắng (%)',
      width: '11%',
      render: (_, record) => {
        const tyLeVang = record.soBuoiHoc > 0 
          ? ((record.soBuoiVang / record.soBuoiHoc) * 100).toFixed(1)
          : 0;
        return (
          <span style={{ color: tyLeVang > 20 ? 'red' : 'green' }}>
            {tyLeVang}%
          </span>
        );
      }
    }
  ];

  useEffect(() => {
    getDanhSachHocKy();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">Danh sách Điểm danh</h2>
        
        {/* Bộ lọc */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Bộ lọc</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Học kỳ */}
            <div>
              <label className="block text-sm font-medium mb-1">Học kỳ:</label>
              <Select
                style={{ width: '100%' }}
                placeholder="-- Chọn học kỳ --"
                value={selectedHocKy && selectedNamHoc ? `${selectedHocKy}-${selectedNamHoc}` : undefined}
                onChange={handleHocKyChange}
                allowClear
              >
                {hocKy.map(item => (
                  <Option key={`${item.hocKy}-${item.namHoc}`} value={`${item.hocKy}-${item.namHoc}`}>
                    {item.hocKyDisplay}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Môn học */}
            <div>
              <label className="block text-sm font-medium mb-1">Môn học:</label>
              <Select
                style={{ width: '100%' }}
                placeholder="-- Chọn môn học --"
                value={selectedMonHoc}
                onChange={handleMonHocChange}
                disabled={!selectedHocKy || !selectedNamHoc}
                allowClear
              >
                {monhoc.map(item => (
                  <Option key={item.maMh} value={item.maMh}>
                    {item.tenMh}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Giáo viên */}
            <div>
              <label className="block text-sm font-medium mb-1">Giáo viên:</label>
              <Select
                style={{ width: '100%' }}
                placeholder="-- Chọn giáo viên --"
                value={selectedGiangVien}
                onChange={handleGiangVienChange}
                disabled={!selectedMonHoc}
                allowClear
              >
                {giangVien.map(item => (
                  <Option key={item.maGv} value={item.maGv}>
                    {item.tenGv}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-2">
              <Button 
                type="primary" 
                onClick={handleSearch}
                disabled={!selectedHocKy || !selectedNamHoc}
              >
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mb-4">
          <div>
            {diemDanhData.length > 0 && (
              <span className="text-sm text-gray-600">
                Tổng cộng: {diemDanhData.length} sinh viên
              </span>
            )}
          </div>
          <Space>
            <Button 
              type="default"
              onClick={exportToExcel}
              disabled={diemDanhData.length === 0}
              loading={loading}
            >
              Xuất Excel
            </Button>
          </Space>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={diemDanhData}
        rowKey="mssv"
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} sinh viên`
        }}
        loading={loading}
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  );
};