import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Select,
  Table,
  Modal,
  message,
  Divider,
} from "antd";

const { Option } = Select;

export const LichHocComponents = () => {
  const [form] = Form.useForm();
  const [lichHocList, setLichHocList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLichHoc, setSelectedLichHoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHocKy, setFilterHocKy] = useState(null);
  const [filterThu, setFilterThu] = useState(null);

  useEffect(() => {
    setStudentList([
      { ma_sv: 1, ho_ten: "Nguyễn Văn A", email: "a@gmail.com" },
      { ma_sv: 2, ho_ten: "Trần Thị B", email: "b@gmail.com" },
      { ma_sv: 3, ho_ten: "Lê Văn C", email: "c@gmail.com" },
    ]);

    setLichHocList([
      {
        id: 1,
        ma_gv: "GV001",
        ten_gv: "Phạm Văn Dũng",
        ma_mh: "MH001",
        nmh: 1,
        phong_hoc: "P101",
        ngay_bd: "2025-07-01",
        ngay_kt: "2025-07-31",
        st_bd: 1,
        st_kt: 3,
        hoc_ky: "HK1",
        ten_mon: "Toán rời rạc",
        ngay_hoc: "2025-07-15",
        thu_trong_tuan: "3",
        sinh_vien_ids: [1],
      },
      {
        id: 2,
        ma_gv: "GV002",
        ten_gv: "Lê Thị Hương",
        ma_mh: "MH002",
        nmh: 2,
        phong_hoc: "P102",
        ngay_bd: "2025-08-01",
        ngay_kt: "2025-08-31",
        st_bd: 4,
        st_kt: 6,
        hoc_ky: "HK2",
        ten_mon: "Lập trình Java",
        ngay_hoc: "2025-07-20",
        thu_trong_tuan: "2",
        sinh_vien_ids: [2],
      },
    ]);
  }, []);

  const handleShowDetail = (record) => {
    setSelectedLichHoc(record);
    setSelectedStudentIds([]);
    setIsDetailModalOpen(true);
  };

  const handleRemoveStudentFromLichHoc = (ma_sv) => {
    const updatedLichHocList = lichHocList.map((lh) => {
      if (lh.id === selectedLichHoc.id) {
        return {
          ...lh,
          sinh_vien_ids: lh.sinh_vien_ids.filter((id) => id !== ma_sv),
        };
      }
      return lh;
    });

    setLichHocList(updatedLichHocList);
    setSelectedLichHoc((prev) => ({
      ...prev,
      sinh_vien_ids: prev.sinh_vien_ids.filter((id) => id !== ma_sv),
    }));
    message.success("Đã xóa sinh viên khỏi môn học.");
  };

  const handleAddStudentsToExistingLichHoc = () => {
    if (!selectedStudentIds.length) {
      message.warning("Vui lòng chọn sinh viên cần thêm.");
      return;
    }

    const updatedLichHocList = lichHocList.map((lh) => {
      if (lh.id === selectedLichHoc.id) {
        const uniqueIds = Array.from(new Set([...lh.sinh_vien_ids, ...selectedStudentIds]));
        return { ...lh, sinh_vien_ids: uniqueIds };
      }
      return lh;
    });

    setLichHocList(updatedLichHocList);

    setSelectedLichHoc((prev) => ({
      ...prev,
      sinh_vien_ids: Array.from(new Set([...prev.sinh_vien_ids, ...selectedStudentIds])),
    }));

    setSelectedStudentIds([]);
    message.success("Đã thêm sinh viên vào môn học.");
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
    },
    { title: "Môn học", dataIndex: "ten_mon", key: "ten_mon" },
    { title: "Nhóm MH", dataIndex: "nmh", key: "nmh" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleShowDetail(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  const filteredData = lichHocList.filter((item) => {
    const matchTenMon = item.ten_mon
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchHocKy = filterHocKy ? item.hoc_ky === filterHocKy : true;
    const matchThu = filterThu ? item.thu_trong_tuan === filterThu : true;
    return matchTenMon && matchHocKy && matchThu;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📅 Quản lý lịch học</h2>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        bordered
        pagination={{ pageSize: 5 }}
      />

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết lịch học"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedLichHoc && (
          <>
            <div className="mb-2 space-y-1">
              <p><strong>📘 Môn học:</strong> {selectedLichHoc.ten_mon}</p>
              <p><strong>👩‍🏫 Giảng viên:</strong> {selectedLichHoc.ten_gv}</p>
              <p><strong>📚 Nhóm MH:</strong> {selectedLichHoc.nmh}</p>
              <p><strong>🏫 Phòng học:</strong> {selectedLichHoc.phong_hoc}</p>
              <p><strong>📅 Ngày:</strong> {selectedLichHoc.ngay_bd} → {selectedLichHoc.ngay_kt}</p>
              <p><strong>⏰ Tiết học:</strong> {selectedLichHoc.st_bd} - {selectedLichHoc.st_kt}</p>
              <p><strong>📖 Học kỳ:</strong> {selectedLichHoc.hoc_ky}</p>
              <p><strong>📌 Thứ:</strong> {selectedLichHoc.thu_trong_tuan}</p>
            </div>

            <Divider orientation="left">👨‍🎓 Sinh viên đã thêm</Divider>

            {selectedLichHoc.sinh_vien_ids?.length > 0 ? (
              <ul className="pl-2 space-y-2">
                {selectedLichHoc.sinh_vien_ids.map((id) => {
                  const sv = studentList.find((s) => s.ma_sv === id);
                  return (
                    <li
                      key={id}
                      className="flex justify-between items-center border-b pb-1"
                    >
                      <span>
                        {sv?.ho_ten || "Không rõ tên"} – {sv?.email || "Không rõ email"}
                      </span>
                      <Button
                        danger
                        size="small"
                        onClick={() => handleRemoveStudentFromLichHoc(id)}
                      >
                        Xóa
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>Chưa có sinh viên nào được thêm.</p>
            )}

            <Divider orientation="left">➕ Thêm sinh viên</Divider>

            <Form layout="vertical">
              <Form.Item label="Chọn sinh viên để thêm">
                <Select
                  mode="multiple"
                  placeholder="Chọn thêm sinh viên"
                  value={selectedStudentIds}
                  onChange={setSelectedStudentIds}
                >
                  {studentList
                    .filter(
                      (sv) => !selectedLichHoc?.sinh_vien_ids?.includes(sv.ma_sv)
                    )
                    .map((sv) => (
                      <Option key={sv.ma_sv} value={sv.ma_sv}>
                        {sv.ho_ten} - {sv.email}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleAddStudentsToExistingLichHoc} block>
                  Thêm sinh viên vào môn học
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};
