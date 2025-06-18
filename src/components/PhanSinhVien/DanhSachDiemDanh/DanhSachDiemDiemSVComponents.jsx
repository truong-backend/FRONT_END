import React, { useEffect, useState } from "react";
import {
  getMonHocBySinhVien,
  getDiemDanhByMonHoc
} from "../../../services/PhanSinhVien/DanhSachDiemDanh/diemdanhSVService";

export const DanhSachDiemDiemSVComponents = () => {
  const [monHocs, setMonHocs] = useState([]);
  const [selectedMaMh, setSelectedMaMh] = useState(null);
  const [dsDiemDanh, setDsDiemDanh] = useState([]);

  useEffect(() => {
    getMonHocBySinhVien("SV001").then(setMonHocs);
  }, []);

  useEffect(() => {
    if (selectedMaMh) {
      getDiemDanhByMonHoc("SV001", selectedMaMh).then(setDsDiemDanh);
    }
  }, [selectedMaMh]);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2 style={{ marginBottom: "20px" }}>🎓 Kết quả điểm danh của sinh viên</h2>

      <div style={{ display: "flex", gap: "30px" }}>
        {/* Cột trái - Danh sách môn học */}
        <div style={{ flex: "1", borderRight: "2px solid #ddd" }}>
          <h3>📘 Danh sách môn học</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {monHocs.map((mh) => (
              <li
                key={mh.maMh}
                onClick={() => setSelectedMaMh(mh.maMh)}
                style={{
                  cursor: "pointer",
                  padding: "12px",
                  marginBottom: "10px",
                  backgroundColor: mh.maMh === selectedMaMh ? "#bae6fd" : "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  transition: "background-color 0.3s"
                }}
              >
                <strong>{mh.tenMh}</strong>
                <div style={{ fontSize: "13px", color: "#555" }}>
                  Phòng: {mh.phongHoc} | Học kỳ: {mh.hocKy}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột phải - Danh sách điểm danh */}
        <div style={{ flex: "2" }}>
          {selectedMaMh ? (
            <>
              <h3>📅 Điểm danh môn: <span style={{ color: "#1d4ed8" }}>{selectedMaMh}</span></h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "15px",
                  boxShadow: "0 0 8px rgba(0,0,0,0.1)"
                }}
              >
                <thead style={{ background: "#f1f5f9" }}>
                  <tr>
                    <th style={thStyle}>Ngày học</th>
                    <th style={thStyle}>Điểm danh 1</th>
                    <th style={thStyle}>Điểm danh 2</th>
                    <th style={thStyle}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {dsDiemDanh.map((dd) => (
                    <tr key={dd.maDd} style={{ textAlign: "center" }}>
                      <td style={tdStyle}>{formatDate(dd.ngayHoc)}</td>
                      <td style={tdStyle}>{formatTime(dd.diemDanh1)}</td>
                      <td style={tdStyle}>{formatTime(dd.diemDanh2)}</td>
                      <td style={tdStyle}>{dd.ghiChu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p style={{ color: "#888", marginTop: "20px" }}>
              ← Chọn một môn học để xem thông tin điểm danh
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Định dạng ngày
const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN");
};

// Định dạng giờ phút
const formatTime = (dateTime) => {
  if (!dateTime) return "—";
  const d = new Date(dateTime);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

// Style table
const thStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  backgroundColor: "#e2e8f0"
};
const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};
