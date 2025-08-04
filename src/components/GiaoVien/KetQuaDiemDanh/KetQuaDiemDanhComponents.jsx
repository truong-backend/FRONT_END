import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, message } from 'antd';
import { GiaoVienService } from '../../../services/GiaoVien/HoSo/GiaoVienService';

export default function KetQuaDiemDanhComponents() {
  const [dataMonHoc, setDataMonHoc] = useState([]);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);
  const [dataThongKe, setDataThongKe] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const fetchMonHocDiemDanh = async () => {
    try {
      const res = await GiaoVienService.getMonHocForDiemDanh();
      setDataMonHoc(res);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách môn học:', error);
    }
  };

  const fetchThongKeDiemDanh = async (monhoc) => {
    try {
      const res = await GiaoVienService.thongKeDiemDanh(monhoc.maMh, monhoc.nmh, monhoc.maGd);
      setDataThongKe(res);
      setPagination((prev) => ({ ...prev, total: res.length }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thống kê điểm danh:', error);
    }
  };

  const exportThongKeDiemDanh = async (monhoc) => {
    try {
      const res = await GiaoVienService.ExportThongKe(monhoc.maMh, monhoc.nmh, monhoc.maGd);
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thong_ke_diem_danh.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi export thống kê điểm danh', error);
    }
  };

  useEffect(() => {
    fetchMonHocDiemDanh();
  }, []);

  const handleOpenModal = async (monhoc) => {
    setSelectedMonHoc(monhoc);
    setOpenModal(true);
    await fetchThongKeDiemDanh(monhoc);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMonHoc(null);
    setDataThongKe([]);
  };

  // Cột cho bảng môn học
  const columnsMonHoc = [
    { title: 'Mã môn học', dataIndex: 'maMh', key: 'maMh' },
    { title: 'Tên môn học', dataIndex: 'tenMh', key: 'tenMh' },
    { title: 'Phòng học', dataIndex: 'phongHoc', key: 'phongHoc' },
    { title: 'Nhóm', dataIndex: 'nmh', key: 'nmh' },
    {
      title: 'Kết quả điểm danh',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleOpenModal(record)}>
          Xem kết quả
        </Button>
      ),
    },
  ];

  const columnsThongKe = [
    { title: 'MSSV', dataIndex: 'maSv', key: 'maSv' },
    { title: 'Họ và tên', dataIndex: 'tenSv', key: 'tenSv' },
    { title: 'Lớp', dataIndex: 'tenLop', key: 'tenLop' },
    { title: 'Số buổi học', dataIndex: 'so_buoi_hoc', key: 'so_buoi_hoc' },
    { title: 'Số buổi điểm danh', dataIndex: 'so_buoi_diem_danh', key: 'so_buoi_diem_danh' },
    { title: 'Số buổi vắng', dataIndex: 'so_buoi_chua_diem_danh', key: 'so_buoi_chua_diem_danh' },
  ];

  return (
    <div className="flex justify-center mt-10">
      <div className="shadow-2xl rounded-lg w-full max-w-[1000px]">
        <Table
          dataSource={dataMonHoc}
          columns={columnsMonHoc}
          rowKey={(record) => `${record.maMh}-${record.nmh}`}
          pagination={false}
        />
      </div>

      <Modal
        title="Kết quả điểm danh"
        open={openModal}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={900}
      >
        <Table
          dataSource={dataThongKe}
          columns={columnsThongKe}
          rowKey="maSv"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
          scroll={{ x: 'max-content' }}
        />
        <div className="mt-4 text-left">
          <Button
            type="primary"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => exportThongKeDiemDanh(selectedMonHoc)}
          >
            Xuất Excel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
