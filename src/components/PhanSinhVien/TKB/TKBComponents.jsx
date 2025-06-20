import React, { useState } from "react";

// DỮ LIỆU MẪU (giữ nguyên)
const sampleTKB = {
  "Học kỳ 3 - Năm học 2024-2025": {
    "Tuần 43": {
      "Thứ 2": [
        {
          maMH: "CS03036",
          tenMon: "Toán cao cấp",
          nmh: "3",
          stc: "3.0",
          maLop: "x",
          stchp: "x",
          kdk: "Năm",
          th: "1",
          thu: "Thứ 2",
          tietBd: 1,
          tietKt: 3,
          st: "5",
          phong: "A101",
          cbgd: "TVHưng",
          tuan: "23/06/2025 - 29/06/2025",
          ngay: "2025-06-23",
        },
      ],
      "Thứ 3": [
        {
          maMH: "CS03036",
          tenMon: "Lập trình Web",
          nmh: "3",
          stc: "3.0",
          maLop: "x",
          stchp: "x",
          kdk: "Năm",
          th: "1",
          thu: "Thứ 3",
          tietBd: 2,
          tietKt: 5,
          st: "5",
          phong: "B202",
          cbgd: "TVHưng",
          tuan: "23/06/2025 - 29/06/2025",
          ngay: "2025-06-24",
        },
      ],
      "Thứ 5": [
        {
          maMH: "CS03036",
          tenMon: "CSDL",
          nmh: "3",
          stc: "3.0",
          maLop: "x",
          stchp: "x",
          kdk: "Năm",
          th: "1",
          thu: "Thứ 5",
          tietBd: 1,
          tietKt: 3,
          st: "5",
          phong: "C606",
          cbgd: "TVHưng",
          tuan: "23/06/2025 - 29/06/2025",
          ngay: "2025-06-26",
        },
      ],
    },
  },
};

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const tietMax = 15;

// THỜI KHÓA BIỂU CÁ NHÂN
const TKBCaNhan = ({ data }) => {
  const allSubjects = Object.keys(data).reduce((acc, day) => {
    return [...acc, ...data[day]];
  }, []);

  const tableStyle = { borderCollapse: "collapse", width: "100%" };
  const thtdStyle = { border: "1px solid black", padding: "4px", textAlign: "center" };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Thời Khóa Biểu Cá Nhân</h2>
      {allSubjects.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                "Mã MH",
                "Tên MH",
                "NMH",
                "STC",
                "Mã lớp",
                "STCHP",
                "KDK",
                "TH",
                "Tiết BD",
                "ST",
                "Phòng",
                "CBGD",
                "Tuần",
              ].map((header) => (
                <th key={header} style={thtdStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allSubjects.map((mon, idx) => (
              <tr key={idx}>
                <td style={thtdStyle}>{mon.maMH}</td>
                <td style={thtdStyle}>{mon.tenMon}</td>
                <td style={thtdStyle}>{mon.nmh || "N/A"}</td>
                <td style={thtdStyle}>{mon.stc || "N/A"}</td>
                <td style={thtdStyle}>{mon.maLop || "N/A"}</td>
                <td style={thtdStyle}>{mon.stchp || "N/A"}</td>
                <td style={thtdStyle}>{mon.kdk || "N/A"}</td>
                <td style={thtdStyle}>{mon.th || "N/A"}</td>
                <td style={thtdStyle}>{mon.tietBd}</td>
                <td style={thtdStyle}>{mon.st || "N/A"}</td>
                <td style={thtdStyle}>{mon.phong}</td>
                <td style={thtdStyle}>{mon.cbgd || "N/A"}</td>
                <td style={thtdStyle}>{mon.tuan || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: "center", color: "red" }}>Không có dữ liệu thời khóa biểu.</p>
      )}
    </div>
  );
};

// THỜI KHÓA BIỂU THEO TUẦN
const TKBTheoTuan = ({ data, selectedTuan }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const getMonHoc = (day, tiet) => {
    const list = data[day] || [];
    for (let mon of list) {
      if (tiet >= mon.tietBd && tiet <= mon.tietKt) {
        return mon;
      }
    }
    return null;
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setShowDetails(true);
  };

  const tableStyle = { borderCollapse: "collapse", width: "100%" };
  const thtdStyle = { border: "1px solid black", padding: "4px", textAlign: "center" };

  return (
    <div>
      <div>
        <label>Học kỳ </label>
        <select>
          <option value="HK1">Học kỳ 1 năm 2022-2023</option>
          <option value="HK2">Học kỳ 2 năm 2022-2023</option>
          <option value="HK3">Học kỳ 3 năm 2022-2023</option>
        </select>

        <label> Tuần  </label>
        <select>
          <option value="Tuần 1">Tuần 1 [Từ 23/06/2025 -- Đến 29/06/2025]</option>
          <option value="Tuần 2">Tuần 2 [Từ 23/06/2025 -- Đến 29/06/2025]</option>
          <option value="Tuần 3">Tuần 3 [Từ 23/06/2025 -- Đến 29/06/2025]</option>
          <option value="Tuần ...">...</option>
        </select>
      </div>

      <h1 style={{ textAlign: "center" }}>Thời Khóa Biểu Tuần: {selectedTuan}</h1>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thtdStyle}>Tiết</th>
            {days.map((day) => (
              <th key={day} style={thtdStyle}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: tietMax }, (_, i) => i + 1).map((tiet) => (
            <tr key={tiet}>
              <td style={thtdStyle}>
                Tiết {tiet}
                <br />
                {tiet <= 5 ? "Sáng" : tiet <= 10 ? "Chiều" : "Tối"}
              </td>
              {days.map((day) => {
                const mon = getMonHoc(day, tiet);

                if (mon && mon.tietBd === tiet) {
                  const rowSpan = mon.tietKt - mon.tietBd + 1;
                  return (
                    <td
                      key={day + tiet}
                      rowSpan={rowSpan}
                      style={{ ...thtdStyle, cursor: "pointer", textAlign: "left", verticalAlign: "top" }}
                      onClick={() => handleSubjectClick(mon)}
                    >
                      <div>{mon.tenMon}</div>
                      <div>Phòng: {mon.phong}</div>
                      <div>Giảng viên: {mon.cbgd}</div>
                      <div>Tín chỉ: {mon.stc} TC</div>
                    </td>
                  );
                } else if (mon && mon.tietBd < tiet && tiet <= mon.tietKt) {
                  return null;
                } else {
                  return <td key={day + tiet} style={thtdStyle}></td>;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {showDetails && selectedSubject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setShowDetails(false)}
        >
          <div
            style={{ backgroundColor: "white", padding: 20, maxWidth: 400, width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3>Chi tiết môn học</h3>
              <button onClick={() => setShowDetails(false)}>×</button>
            </div>
            <div>
              <p>Mã môn học: {selectedSubject.maMH}</p>
              <p>Số tín chỉ: {selectedSubject.stc}</p>
              <p>Tên môn học: {selectedSubject.tenMon}</p>
              <p>
                Thứ: {selectedSubject.thu} - Tiết: {selectedSubject.tietBd} đến {selectedSubject.tietKt}
              </p>
              <p>Phòng học: {selectedSubject.phong}</p>
              <p>Giảng viên: {selectedSubject.cbgd}</p>
              <p>Tuần học: {selectedSubject.tuan}</p>
            </div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button onClick={() => setShowDetails(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <p>• Nhấp vào ô môn học để xem chi tiết</p>
        <p>• Sáng: Tiết 1-5, Chiều: Tiết 6-10, Tối: Tiết 11-15</p>
        <p>• TC: Tín chỉ</p>
      </div>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button onClick={() => alert("Đi tới tuần đầu")}>Tuần đầu</button>
        <button onClick={() => alert("Tuần trước")}>Tuần trước</button>
        <button onClick={() => alert("Tuần sau")}>Tuần sau</button>
        <button onClick={() => alert("Tuần cuối")}>Tuần cuối</button>
      </div>
    </div>
  );
};

// COMPONENT CHÍNH
export const TKBComponents = () => {
  const [selectedView, setSelectedView] = useState("theoTuan");
  const [selectedHk, setSelectedHk] = useState("Học kỳ 3 - Năm học 2024-2025");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const weeks = Object.keys(sampleTKB[selectedHk] || []);
  const selectedTuan = weeks[selectedWeekIndex];
  const tkbData = sampleTKB[selectedHk]?.[selectedTuan] || {};

  return (
    <div>
      <div>
        <label>Chọn chế độ hiển thị: </label>
        <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
          <option value="theoTuan">Thời khóa biểu theo tuần</option>
          <option value="caNhan">Thời khóa biểu cá nhân</option>
        </select>
      </div>

      {selectedView === "theoTuan" ? (
        <TKBTheoTuan data={tkbData} selectedTuan={selectedTuan} />
      ) : (
        <TKBCaNhan data={tkbData} />
      )}
    </div>
  );
};
