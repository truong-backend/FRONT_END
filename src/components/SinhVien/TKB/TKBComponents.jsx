import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { tkbService } from '../../../services/SinhVien/TKB/tkbService'

// FUNCTION TO EXTRACT SEMESTER NUMBER FROM hocKy STRING
const extractSemesterNumber = (hocKy) => {
  if (hocKy.includes("Học kỳ 1")) return 1;
  if (hocKy.includes("Học kỳ 2")) return 2;
  if (hocKy.includes("Học kỳ 3")) return 3;
  return 1; // Default fallback
};

// API FUNCTIONS
const fetchTkbSinhVien = async ({ maSv, hocKy, startOfWeek, endOfWeek }) => {
  try {
    // Extract semester number from hocKy string
    const semesterNumber = extractSemesterNumber(hocKy);
    
    const data = await tkbService.fetchTkbSinhVien({ 
      maSv, 
      hocKy: semesterNumber, // Pass the number instead of the full string
      startOfWeek, 
      endOfWeek 
    });
    return data;
  } catch (error) {
    throw new Error(
      error.message || "Lỗi khi lấy thời khóa biểu sinh viên"
    );
  }
};

// FUNCTION TẠO DANH SÁCH TUẦN THEO HỌC KỲ
const generateWeeks = (startDate, endDate) => {
  const weeks = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentWeekStart = new Date(start);
  let weekNumber = 1;

  while (currentWeekStart <= end) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }

    const weekStartStr = currentWeekStart.toLocaleDateString('vi-VN');
    const weekEndStr = weekEnd.toLocaleDateString('vi-VN');

    weeks.push({
      key: `Tuần ${weekNumber}`,
      label: `Tuần ${weekNumber} [Từ ${weekStartStr} -- Đến ${weekEndStr}]`,
      startDate: new Date(currentWeekStart),
      endDate: new Date(weekEnd)
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  return weeks;
};

// DỮ LIỆU HỌC KỲ - CẬP NHẬT ĐỂ SỬ DỤNG NĂM HIỆN TẠI
const generateSemesterData = (baseYear) => {
  const currentYear = baseYear;
  const nextYear = baseYear + 1;

  return {
    [`Học kỳ 1 - Năm học ${currentYear}-${nextYear}`]: {
      startDate: `${currentYear}-09-02`,
      endDate: `${currentYear}-12-22`,
      weeks: generateWeeks(`${currentYear}-09-02`, `${currentYear}-12-22`)
    },
    [`Học kỳ 2 - Năm học ${currentYear}-${nextYear}`]: {
      startDate: `${nextYear}-02-10`,
      endDate: `${nextYear}-06-29`,
      weeks: generateWeeks(`${nextYear}-02-10`, `${nextYear}-06-29`)
    },
    [`Học kỳ 3 - Năm học ${currentYear}-${nextYear}`]: {
      startDate: `${nextYear}-06-23`,
      endDate: `${nextYear}-07-13`,
      weeks: generateWeeks(`${nextYear}-06-23`, `${nextYear}-07-13`)
    }
  };
};

// FUNCTION LẤY NĂM HỌC HIỆN TẠI DỰA TRÊN THÁNG HIỆN TẠI
const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11, nên +1
  const currentYear = now.getFullYear();

  // Năm học bắt đầu từ tháng 9
  // Nếu tháng hiện tại >= 9, năm học bắt đầu từ năm hiện tại
  // Nếu tháng hiện tại < 9, năm học bắt đầu từ năm trước
  if (currentMonth >= 9) {
    return currentYear;
  } else {
    return currentYear - 1;
  }
};

// FUNCTION XÁC ĐỊNH HỌC KỲ HIỆN TẠI
const getCurrentSemester = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const academicYear = getCurrentAcademicYear();
  const nextYear = academicYear + 1;

  if (currentMonth >= 9 && currentMonth <= 12) {
    return `Học kỳ 1 - Năm học ${academicYear}-${nextYear}`;
  } else if (currentMonth >= 2 && currentMonth <= 6) {
    return `Học kỳ 2 - Năm học ${academicYear}-${nextYear}`;
  } else if (currentMonth >= 6 && currentMonth <= 7) {
    return `Học kỳ 3 - Năm học ${academicYear}-${nextYear}`;
  } else {
    // Mặc định về học kỳ 1
    return `Học kỳ 1 - Năm học ${academicYear}-${nextYear}`;
  }
};

// FUNCTION CONVERT API DATA TO SAMPLE TKB FORMAT
const convertApiDataToTKB = (apiData) => {
  const tkbData = {};

  // Giả sử API trả về array các môn học
  if (Array.isArray(apiData)) {
    apiData.forEach(subject => {
      // Tạo cấu trúc theo ngày
      const dayKey = subject.thu || subject.day;
      if (!tkbData[dayKey]) {
        tkbData[dayKey] = [];
      }

      // Convert format để match với sampleTKB
      const convertedSubject = {
        maMH: subject.maMH || subject.subjectCode,
        tenMon: subject.tenMon || subject.subjectName,
        nmh: subject.nmh || subject.credits,
        kdk: subject.kdk || subject.semester,
        th: subject.th || subject.type,
        thu: subject.thu || subject.day,
        tietBd: subject.tietBd || subject.startPeriod,
        tietKt: subject.tietKt || subject.endPeriod,
        st: subject.st || subject.periods,
        phong: subject.phong || subject.room,
        cbgd: subject.cbgd || subject.teacher,
        tuan: subject.tuan || subject.week,
        ngay: subject.ngay || subject.date,
      };

      tkbData[dayKey].push(convertedSubject);
    });
  }

  return tkbData;
};

// FALLBACK DATA - CẬP NHẬT VỚI NĂM HIỆN TẠI
const getSampleTKB = () => {
  const academicYear = getCurrentAcademicYear();
  const nextYear = academicYear + 1;
  
  return {
    [`Học kỳ 3 - Năm học ${academicYear}-${nextYear}`]: {
      "Tuần 1": {
        "Thứ 2": [
          {
            maMH: "CS03036",
            tenMon: "Toán cao cấp",
            nmh: "3",
            kdk: "Năm",
            th: "X",
            thu: "Thứ 2",
            tietBd: 1,
            tietKt: 3,
            st: "5",
            phong: "A101",
            cbgd: "TVHưng",
            tuan: "07/07/2025 - 13/07/2025",
            ngay: "2025-07-07",
          },
        ],
        "Thứ 3": [
          {
            maMH: "CS03037",
            tenMon: "Lập trình Web",
            nmh: "3",
            kdk: "Năm",
            th: "X",
            thu: "Thứ 3",
            tietBd: 2,
            tietKt: 5,
            st: "5",
            phong: "B202",
            cbgd: "TVHưng",
            tuan: "07/07/2025 - 13/07/2025",
            ngay: "2025-07-08",
          },
        ],
      },
    },
  };
};

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const tietMax = 15;

// THỜI KHÓA BIỂU CÁ NHÂN
const TKBCaNhan = ({ data, loading }) => {
  const allSubjects = Object.keys(data).reduce((acc, day) => {
    return [...acc, ...data[day]];
  }, []);

  const tableStyle = { borderCollapse: "collapse", width: "100%" };
  const thtdStyle = { border: "1px solid black", padding: "4px", textAlign: "center" };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p>Đang tải thời khóa biểu...</p>
      </div>
    );
  }

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
const TKBTheoTuan = ({
  data,
  selectedTuan,
  selectedHk,
  onHkChange,
  onWeekChange,
  semesterData,
  loading,
  error,
  onRefresh
}) => {
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

  const availableWeeks = semesterData[selectedHk]?.weeks || [];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "24px" }}>⟳</div>
        <p>Đang tải thời khóa biểu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        <p>❌ Lỗi: {error}</p>
        <button 
          onClick={onRefresh}
          style={{ 
            padding: "8px 16px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div>
          <label>Học kỳ: </label>
          <select 
            value={selectedHk} 
            onChange={(e) => onHkChange(e.target.value)}
            style={{ padding: "5px", minWidth: "200px" }}
          >
            {Object.keys(semesterData).map((hk) => (
              <option key={hk} value={hk}>
                {hk}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Tuần: </label>
          <select 
            value={selectedTuan} 
            onChange={(e) => onWeekChange(e.target.value)}
            style={{ padding: "5px", minWidth: "250px" }}
          >
            {availableWeeks.map((week) => (
              <option key={week.key} value={week.key}>
                {week.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={onRefresh}
          style={{ 
            padding: "5px 10px", 
            backgroundColor: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔄 Làm mới
        </button>
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
                <small style={{ color: "#666" }}>
                  {tiet <= 5 ? "Sáng" : tiet <= 10 ? "Chiều" : "Tối"}
                </small>
              </td>
              {days.map((day) => {
                const mon = getMonHoc(day, tiet);

                if (mon && mon.tietBd === tiet) {
                  const rowSpan = mon.tietKt - mon.tietBd + 1;
                  return (
                    <td
                      key={day + tiet}
                      rowSpan={rowSpan}
                      style={{ 
                        ...thtdStyle, 
                        cursor: "pointer", 
                        textAlign: "left", 
                        verticalAlign: "top",
                        backgroundColor: "#f8f9fa",
                        transition: "background-color 0.2s"
                      }}
                      onClick={() => handleSubjectClick(mon)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#e9ecef"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{mon.tenMon}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>📍 {mon.phong}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>👨‍🏫 {mon.cbgd}</div>
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
            style={{ 
              backgroundColor: "white", 
              padding: "20px", 
              maxWidth: "400px", 
              width: "90%",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Chi tiết môn học</h3>
              <button 
                onClick={() => setShowDetails(false)}
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "20px", 
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            <div style={{ lineHeight: "1.6" }}>
              <p><strong>Mã môn học:</strong> {selectedSubject.maMH}</p>
              <p><strong>Tên môn học:</strong> {selectedSubject.tenMon}</p>
              <p><strong>Thứ:</strong> {selectedSubject.thu} - <strong>Tiết:</strong> {selectedSubject.tietBd} đến {selectedSubject.tietKt}</p>
              <p><strong>Phòng học:</strong> {selectedSubject.phong}</p>
              <p><strong>Giảng viên:</strong> {selectedSubject.cbgd}</p>
              <p><strong>Tuần học:</strong> {selectedSubject.tuan}</p>
            </div>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button 
                onClick={() => setShowDetails(false)}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: "#007bff", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#666" }}>
        <p>💡 <strong>Hướng dẫn:</strong></p>
        <p>• Nhấp vào ô môn học để xem chi tiết</p>
        <p>• Sáng: Tiết 1-5, Chiều: Tiết 6-10, Tối: Tiết 11-15</p>
      </div>
    </div>
  );
};

// COMPONENT CHÍNH
export const TKBComponents = () => {
  const { user, } = useAuth();
  const maSvFE = user?.maSv || user?.id || user?.username;
  
  // Sử dụng năm học hiện tại
  const currentAcademicYear = getCurrentAcademicYear();
  const currentSemester = getCurrentSemester();
  
  const [selectedView, setSelectedView] = useState("theoTuan");
  const [selectedHk, setSelectedHk] = useState(currentSemester); // Mặc định là học kỳ hiện tại
  const [selectedTuan, setSelectedTuan] = useState("Tuần 1");
  const [tkbData, setTkbData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastApiCall, setLastApiCall] = useState(null);

  // Tạo dữ liệu học kỳ cho năm hiện tại
  const semesterData = generateSemesterData(currentAcademicYear);

  // Lấy thông tin tuần hiện tại
  const getCurrentWeekInfo = useCallback(() => {
    const currentSemester = semesterData[selectedHk];
    const currentWeek = currentSemester?.weeks.find(week => week.key === selectedTuan);
    return currentWeek;
  }, [selectedHk, selectedTuan, semesterData]);

  // Load dữ liệu từ API với cache prevention
  const loadTKBData = useCallback(async (hocKy, tuan, forceRefresh = false) => {
    if (!maSvFE) {
      setError("Không tìm thấy mã sinh viên");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weekInfo = getCurrentWeekInfo();
      if (!weekInfo) {
        throw new Error("Không tìm thấy thông tin tuần");
      }

      // Format dates for API
      const startOfWeek = weekInfo.startDate.toISOString().split('T')[0];
      const endOfWeek = weekInfo.endDate.toISOString().split('T')[0];

      // Tạo unique key để check cache
      const apiCallKey = `${maSvFE}-${hocKy}-${tuan}-${startOfWeek}-${endOfWeek}`;
      
      // Skip API call nếu đã gọi cùng data gần đây (trừ khi force refresh)
      if (lastApiCall === apiCallKey && !forceRefresh) {
        setLoading(false);
        return;
      }

      // Extract semester number for API call
      const semesterNumber = extractSemesterNumber(hocKy);

      console.log("🔄 Đang gọi API TKB với tham số:", {
        maSv: maSvFE,
        hocKy: semesterNumber, // Now sending number instead of string
        tuan,
        startOfWeek,
        endOfWeek
      });

      // Call API
      const apiData = await fetchTkbSinhVien({
        maSv: maSvFE,
        hocKy: hocKy, // This will be converted to number inside fetchTkbSinhVien
        startOfWeek: startOfWeek,
        endOfWeek: endOfWeek,
      });

      console.log("✅ API TKB trả về data:", apiData);

      // Convert API data to TKB format
      const convertedData = convertApiDataToTKB(apiData);
      setTkbData(convertedData);
      setLastApiCall(apiCallKey);

    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu TKB:", err);
      setError(err.message);

      // Fallback to sample data với năm hiện tại
      const sampleTKB = getSampleTKB();
      const fallbackData = sampleTKB[hocKy]?.[tuan] || {};
      setTkbData(fallbackData);
      console.log("🔄 Sử dụng dữ liệu mẫu:", fallbackData);
    } finally {
      setLoading(false);
    }
  }, [maSvFE, getCurrentWeekInfo, lastApiCall]);

  // Load dữ liệu khi component mount hoặc khi thay đổi học kỳ/tuần
  useEffect(() => {
    loadTKBData(selectedHk, selectedTuan);
  }, [selectedHk, selectedTuan, loadTKBData]);

  const handleHkChange = (newHk) => {
    setSelectedHk(newHk);
    // Reset về tuần đầu tiên khi đổi học kỳ
    const firstWeek = semesterData[newHk]?.weeks[0]?.key || "Tuần 1";
    setSelectedTuan(firstWeek);
  };

  const handleWeekChange = (newWeek) => {
    setSelectedTuan(newWeek);
  };

  const handleRefresh = () => {
    loadTKBData(selectedHk, selectedTuan, true);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div>
          <label><strong>Mã sinh viên:</strong> </label>
          <span style={{ 
            padding: "5px 10px", 
            backgroundColor: "#e9ecef", 
            borderRadius: "4px",
            fontWeight: "bold"
          }}>
            {maSvFE || "Chưa có"}
          </span>
        </div>

        <div>
          <label><strong>Năm học hiện tại:</strong> </label>
          <span style={{ 
            padding: "5px 10px", 
            backgroundColor: "#d4edda", 
            borderRadius: "4px",
            fontWeight: "bold",
            color: "#155724"
          }}>
            {currentAcademicYear}-{currentAcademicYear + 1}
          </span>
        </div>

        <div>
          <label><strong>Chế độ hiển thị:</strong> </label>
          <select 
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
            style={{ padding: "5px", minWidth: "200px" }}
          >
            <option value="theoTuan">📅 Thời khóa biểu theo tuần</option>
            <option value="caNhan">📋 Thời khóa biểu cá nhân</option>
          </select>
        </div>
      </div>

      {selectedView === "theoTuan" ? (
        <TKBTheoTuan
          data={tkbData}
          selectedTuan={selectedTuan}
          selectedHk={selectedHk}
          onHkChange={handleHkChange}
          onWeekChange={handleWeekChange}
          onRefresh={handleRefresh}
          semesterData={semesterData}
          loading={loading}
          error={error}
        />
      ) : (
        <TKBCaNhan
          data={tkbData}
          loading={loading}
        />
      )}
    </div>
  );
};