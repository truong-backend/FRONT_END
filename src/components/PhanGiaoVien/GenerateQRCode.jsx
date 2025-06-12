import React, { useEffect, useState } from 'react';
import { Select, Button, Radio, InputNumber, Table, Form, message } from 'antd';
import moment from 'moment';

const { Option } = Select;

// MOCK DATA
const mockNgayBatDauHocKy = [
  '2025-09-02',
  '2025-02-10',
  '2026-06-23',
  '2024-09-02',
  '2024-02-10',
];

const mockMonHoc = {
  'hk-2025-1': [
    { id: 'mh1', tenMonHoc: 'Lập trình Java' },
    { id: 'mh2', tenMonHoc: 'Cơ sở dữ liệu' },
  ],
  'hk-2025-2': [
    { id: 'mh3', tenMonHoc: 'Mạng máy tính' },
  ],
};

const mockNhom = {
  mh1: [{ id: 'nhom1', tenNhom: 'Nhóm 1' }, { id: 'nhom2', tenNhom: 'Nhóm 2' }],
  mh2: [{ id: 'nhom3', tenNhom: 'Nhóm A' }],
};

const mockNgayGiangDay = {
  nhom1: ['2025-09-10', '2025-09-17'],
  nhom2: ['2025-09-11'],
  nhom3: ['2025-09-15'],
};

const mockSinhVien = {
  nhom1: [
    { maSv: 'SV001', hoTen: 'Nguyễn Văn A' },
    { maSv: 'SV002', hoTen: 'Trần Thị B' },
  ],
  nhom2: [
    { maSv: 'SV003', hoTen: 'Phạm Văn C' },
  ],
  nhom3: [
    { maSv: 'SV004', hoTen: 'Lê Thị D' },
  ],
};

// Helper xác định học kỳ
const getHocKy = (dateStr) => {
  const date = moment(dateStr);
  const year = date.year();
  if (date.isSameOrAfter(moment(`${year}-09-02`))) return { hocKy: 1, nam: year };
  if (date.isSameOrAfter(moment(`${year}-06-23`))) return { hocKy: 3, nam: year };
  if (date.isSameOrAfter(moment(`${year}-02-10`))) return { hocKy: 2, nam: year };
  return null;
};

export const GenerateQRCode = () => {
  const [hocKyList, setHocKyList] = useState([]);
  const [selectedHocKy, setSelectedHocKy] = useState(null);
  const [monHocList, setMonHocList] = useState([]);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);
  const [nhomList, setNhomList] = useState([]);
  const [selectedNhom, setSelectedNhom] = useState(null);
  const [ngayList, setNgayList] = useState([]);
  const [selectedNgay, setSelectedNgay] = useState(null);

  const [mode, setMode] = useState('thuCong');
  const [danhSachSinhVien, setDanhSachSinhVien] = useState([]);
  const [thoiGianHetHan, setThoiGianHetHan] = useState(5);

  useEffect(() => {
    // Chuyển ngày sang học kỳ
    const result = mockNgayBatDauHocKy.map((ngay) => {
      const { hocKy, nam } = getHocKy(ngay);
      return {
        id: `hk-${nam}-${hocKy}`,
        label: `Học kỳ ${hocKy} năm ${nam}-${nam + 1}`,
      };
    });
    setHocKyList(result);
  }, []);

  const handleHocKyChange = (value) => {
    setSelectedHocKy(value);
    setMonHocList(mockMonHoc[value] || []);
    setSelectedMonHoc(null);
    setNhomList([]);
    setNgayList([]);
    setDanhSachSinhVien([]);
  };

  const handleMonHocChange = (value) => {
    setSelectedMonHoc(value);
    setNhomList(mockNhom[value] || []);
    setSelectedNhom(null);
    setNgayList([]);
    setDanhSachSinhVien([]);
  };

  const handleNhomChange = (value) => {
    setSelectedNhom(value);
    setNgayList(mockNgayGiangDay[value] || []);
    setSelectedNgay(null);
    setDanhSachSinhVien([]);
  };

  const handleNgayChange = (value) => {
    setSelectedNgay(value);
  };

  const handleThuCong = () => {
    setDanhSachSinhVien(mockSinhVien[selectedNhom] || []);
  };

  const handleTaoQR = () => {
    message.success(`QR được tạo thành công (giả lập) - Hết hạn sau ${thoiGianHetHan} phút`);
  };

  return (
    <Form layout="vertical" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Form.Item label="Chọn học kỳ">
        <Select onChange={handleHocKyChange} placeholder="Chọn học kỳ">
          {hocKyList.map((hk) => (
            <Option key={hk.id} value={hk.id}>{hk.label}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Chọn môn học">
        <Select onChange={handleMonHocChange} value={selectedMonHoc} placeholder="Chọn môn học">
          {monHocList.map((mh) => (
            <Option key={mh.id} value={mh.id}>{mh.tenMonHoc}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Chọn nhóm học">
        <Select onChange={handleNhomChange} value={selectedNhom} placeholder="Chọn nhóm">
          {nhomList.map((nhom) => (
            <Option key={nhom.id} value={nhom.id}>{nhom.tenNhom}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Chọn ngày giảng dạy">
        <Select onChange={handleNgayChange} value={selectedNgay} placeholder="Chọn ngày">
          {ngayList.map((ngay) => (
            <Option key={ngay} value={ngay}>{moment(ngay).format('DD/MM/YYYY')}</Option>
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
          <Button type="primary" onClick={handleThuCong}>Hiển thị danh sách sinh viên</Button>
          <Table
            dataSource={danhSachSinhVien}
            columns={[
              { title: 'MSSV', dataIndex: 'maSv' },
              { title: 'Họ tên', dataIndex: 'hoTen' },
              { title: 'Trạng thái', render: () => 'Chưa điểm danh' }
            ]}
            rowKey="maSv"
            style={{ marginTop: 16 }}
          />
        </>
      )}

      {mode === 'qr' && (
        <>
          <Form.Item label="Thời gian hết hiệu lực (phút)">
            <InputNumber min={1} max={60} value={thoiGianHetHan} onChange={setThoiGianHetHan} />
          </Form.Item>
          <Button type="primary" onClick={handleTaoQR}>Tạo mã QR điểm danh (mock)</Button>
        </>
      )}
    </Form>
  );
};
