import React, { useState, useEffect } from 'react';
import {
  Table, Input, Space, Button, Popconfirm, message, Modal, Form,
  DatePicker, Radio, Upload, Avatar
} from 'antd';
import { teacherService } from '../../../services/PhanAdmin/teacherService.js';
import moment from 'moment';
export const DsachDdanhComponents = () => {
  const [loading, setLoading] = useState(false);
  const [diemdanh, setDiemDanh] = useState([]);

  // Data fetching
  const fetchDiemDanh = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getListGiaoVien();
      setDiemDanh(data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };
  // Table configuration
  const columns = [
    {
      title: 'Mã SV',
      dataIndex: 'maSv',
      width: '10%'
    },
    {
      title: 'Ngày học',
      dataIndex: 'ngayHoc',
      width: '8%',
      render: (ngayHoc) => moment(ngayHoc).format('DD/MM/YYYY')
    },
    {
      title: 'Họ và tên',
      dataIndex: 'tenSv',
      width: '18%'
    },
    {
      title: 'Điểm danh',
      dataIndex: 'diemDanh1',
      width: '10%'
    }
  ];
  useEffect(() => {
    fetchDiemDanh();
  }, []);
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Danh sách Điểm danh</h2>
        <h3>Bộ lọc</h3>

      {/* Học kỳ */}
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="hocKy">Học kỳ:</label><br />
        <select>
          <option value="">-- Chọn học kỳ --</option>
        </select>
      </div>

      {/* Môn học */}
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="monHoc">Môn học:</label><br />
        <select>
          <option value="">-- Chọn môn học --</option>
        </select>
      </div>

      {/* Nhóm học/Lớp */}
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="nhomLop">Giáo viên:</label><br />
        <select >
          <option value="">-- Chọn giáo viên --</option>
        </select>
      </div>

      {/* Ngày học
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="ngayHoc">Ngày học:</label><br />
        <select>
          <option value="">-- Chọn ngày học --</option>
        </select>
      </div> */}

      {/* Buổi học */}
      {/* <div style={{ marginBottom: 12 }}>
        <label htmlFor="buoiHoc">Buổi học:</label><br />
        <select>
          <option value="">-- Chọn buổi học --</option>

        </select>
      </div> */}
        <Space>
          <Button 

          >
            xuất Excel
          </Button>
        </Space>
      </div>

      <Table
              columns={columns}
              // dataSource={filteredData}
              // rowKey="maGv"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              loading={loading}
              scroll={{ x: 1200 }}
            />
    </div>
  );
};
