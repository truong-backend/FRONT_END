import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { tkbService } from '../../../services/SinhVien/TKB/tkbService';

// ===== UTILITIES =====
const extractSemesterNumber = (semester) => {
  if (semester.includes("Học kỳ 1")) return 1;
  if (semester.includes("Học kỳ 2")) return 2;
  if (semester.includes("Học kỳ 3")) return 3;
  return 1;
};

const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  return currentMonth >= 9 ? currentYear : currentYear - 1;
};

const getCurrentSemester = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const academicYear = getCurrentAcademicYear();
  const nextYear = academicYear + 1;

  if (month >= 9 && month <= 12) {
    return `Học kỳ 1 - Năm học ${academicYear}-${nextYear}`;
  } else if (month >= 2 && month <= 6) {
    return `Học kỳ 2 - Năm học ${academicYear}-${nextYear}`;
  } else if (month >= 6 && month <= 7) {
    return `Học kỳ 3 - Năm học ${academicYear}-${nextYear}`;
  }
  return `Học kỳ 1 - Năm học ${academicYear}-${nextYear}`;
};

const createWeekList = (startDate, endDate) => {
  const weeks = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let currentWeekStart = new Date(start);
  let weekNumber = 1;

  while (currentWeekStart <= end) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekEnd > end) weekEnd.setTime(end.getTime());

    weeks.push({
      key: `Tuần ${weekNumber}`,
      label: `Tuần ${weekNumber} [${currentWeekStart.toLocaleDateString('vi-VN')} -- ${weekEnd.toLocaleDateString('vi-VN')}]`,
      startDate: new Date(currentWeekStart),
      endDate: new Date(weekEnd)
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  return weeks;
};

const createSemesterData = (baseYear) => {
  const nextYear = baseYear + 1;
  return {
    [`Học kỳ 1 - Năm học ${baseYear}-${nextYear}`]: {
      startDate: `${baseYear}-09-02`,
      endDate: `${baseYear}-12-22`,
      weeks: createWeekList(`${baseYear}-09-02`, `${baseYear}-12-22`)
    },
    [`Học kỳ 2 - Năm học ${baseYear}-${nextYear}`]: {
      startDate: `${nextYear}-02-10`,
      endDate: `${nextYear}-06-29`,
      weeks: createWeekList(`${nextYear}-02-10`, `${nextYear}-06-29`)
    },
    [`Học kỳ 3 - Năm học ${baseYear}-${nextYear}`]: {
      startDate: `${nextYear}-06-23`,
      endDate: `${nextYear}-07-13`,
      weeks: createWeekList(`${nextYear}-06-23`, `${nextYear}-07-13`)
    }
  };
};

const convertApiDataToTimetable = (apiData) => {
  const timetableData = {};
  const dayMap = {
    0: "Chủ nhật", 1: "Thứ 2", 2: "Thứ 3", 
    3: "Thứ 4", 4: "Thứ 5", 5: "Thứ 6", 6: "Thứ 7"
  };

  if (Array.isArray(apiData)) {
    apiData.forEach(subject => {
      const dayOfWeek = dayMap[new Date(subject.ngayHoc).getDay()] || "Thứ 2";
      
      if (!timetableData[dayOfWeek]) {
        timetableData[dayOfWeek] = [];
      }

      timetableData[dayOfWeek].push({
        maMH: subject.maMH,
        tenMon: subject.tenMon,
        nmh: subject.nmh?.toString() || "N/A",
        thu: dayOfWeek,
        tietBd: subject.tietBd,
        tietKt: subject.tietKt,
        st: ((subject.tietKt - subject.tietBd + 1)?.toString()) || "N/A",
        phong: subject.phong,
        cbgd: subject.cbgd,
        tuan: "N/A",
        ngay: subject.ngayHoc,
        ghiChu: subject.ghiChu
      });
    });
  }

  return timetableData;
};

// ===== API SERVICE =====
const fetchStudentTimetable = async ({ studentId, semester, weekStart, weekEnd }) => {
  try {
    const semesterNumber = extractSemesterNumber(semester);
    const data = await tkbService.fetchTkbSinhVien({ 
      maSv: studentId, 
      hocKy: semesterNumber,
      startOfWeek: weekStart, 
      endOfWeek: weekEnd 
    });
    return data;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi lấy thời khóa biểu sinh viên");
  }
};

// ===== COMPONENTS =====
const LoadingSpinner = () => (
  <div style={{ textAlign: "center", padding: "20px" }}>
    <div style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "24px" }}>⟳</div>
    <p>Đang tải thời khóa biểu...</p>
  </div>
);

const ErrorMessage = ({ error, onRetry }) => (
  <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
    <p>❌ Lỗi: {error}</p>
    <button 
      onClick={onRetry}
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

const SubjectDetailModal = ({ subject, isOpen, onClose }) => {
  if (!isOpen || !subject) return null;

  return (
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
      onClick={onClose}
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
            onClick={onClose}
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
          <p><strong>Mã môn học:</strong> {subject.maMH}</p>
          <p><strong>Tên môn học:</strong> {subject.tenMon}</p>
          <p><strong>Thứ:</strong> {subject.thu} - <strong>Tiết:</strong> {subject.tietBd} đến {subject.tietKt}</p>
          <p><strong>Phòng học:</strong> {subject.phong}</p>
          <p><strong>Giảng viên:</strong> {subject.cbgd}</p>
          <p><strong>Tuần học:</strong> {subject.tuan}</p>
        </div>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button 
            onClick={onClose}
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
  );
};

const PersonalTimetable = ({ data, loading }) => {
  const allSubjects = Object.keys(data).reduce((acc, day) => [...acc, ...data[day]], []);
  const tableStyle = { borderCollapse: "collapse", width: "100%" };
  const cellStyle = { border: "1px solid black", padding: "4px", textAlign: "center" };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Thời Khóa Biểu Cá Nhân</h2>
      {allSubjects.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              {["Mã MH", "Tên MH", "NMH", "Tiết BD", "ST", "Phòng", "CBGD", "Tuần"].map((header) => (
                <th key={header} style={cellStyle}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allSubjects.map((subject, index) => (
              <tr key={index}>
                <td style={cellStyle}>{subject.maMH}</td>
                <td style={cellStyle}>{subject.tenMon}</td>
                <td style={cellStyle}>{subject.nmh || "N/A"}</td>
                <td style={cellStyle}>{subject.tietBd}</td>
                <td style={cellStyle}>{subject.st || "N/A"}</td>
                <td style={cellStyle}>{subject.phong}</td>
                <td style={cellStyle}>{subject.cbgd || "N/A"}</td>
                <td style={cellStyle}>{subject.tuan || "N/A"}</td>
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

const WeeklyTimetable = ({
  data, selectedWeek, selectedSemester, 
  onSemesterChange, onWeekChange, onRefresh,
  semesterData, loading, error
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const maxPeriods = 15;
  const tableStyle = { borderCollapse: "collapse", width: "100%" };
  const cellStyle = { border: "1px solid black", padding: "4px", textAlign: "center" };

  const getSubjectForPeriod = (day, period) => {
    const daySubjects = data[day] || [];
    return daySubjects.find(subject => period >= subject.tietBd && period <= subject.tietKt);
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setShowDetail(true);
  };

  const availableWeeks = semesterData[selectedSemester]?.weeks || [];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={onRefresh} />;

  return (
    <div>
      {/* Controls */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div>
          <label>Học kỳ: </label>
          <select 
            value={selectedSemester} 
            onChange={(e) => onSemesterChange(e.target.value)}
            style={{ padding: "5px", minWidth: "200px" }}
          >
            {Object.keys(semesterData).map((semester) => (
              <option key={semester} value={semester}>{semester}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Tuần: </label>
          <select 
            value={selectedWeek} 
            onChange={(e) => onWeekChange(e.target.value)}
            style={{ padding: "5px", minWidth: "250px" }}
          >
            {availableWeeks.map((week) => (
              <option key={week.key} value={week.key}>{week.label}</option>
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

      {/* Timetable */}
      <h1 style={{ textAlign: "center" }}>Thời Khóa Biểu Tuần: {selectedWeek}</h1>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Tiết</th>
            {days.map((day) => (
              <th key={day} style={cellStyle}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxPeriods }, (_, i) => i + 1).map((period) => (
            <tr key={period}>
              <td style={cellStyle}>
                Tiết {period}
                <br />
                <small style={{ color: "#666" }}>
                  {period <= 5 ? "Sáng" : period <= 10 ? "Chiều" : "Tối"}
                </small>
              </td>
              {days.map((day) => {
                const subject = getSubjectForPeriod(day, period);

                if (subject && subject.tietBd === period) {
                  const rowSpan = subject.tietKt - subject.tietBd + 1;
                  return (
                    <td
                      key={day + period}
                      rowSpan={rowSpan}
                      style={{ 
                        ...cellStyle, 
                        cursor: "pointer", 
                        textAlign: "left", 
                        verticalAlign: "top",
                        backgroundColor: "#f8f9fa",
                        transition: "background-color 0.2s"
                      }}
                      onClick={() => handleSubjectClick(subject)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#e9ecef"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{subject.tenMon}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>📍 {subject.phong}</div>
                      <div style={{ fontSize: "12px", color: "#666" }}>👨‍🏫 {subject.cbgd}</div>
                    </td>
                  );
                } else if (subject && subject.tietBd < period && period <= subject.tietKt) {
                  return null;
                } else {
                  return <td key={day + period} style={cellStyle}></td>;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <SubjectDetailModal 
        subject={selectedSubject}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {/* Instructions */}
      <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#666" }}>
        <p>💡 <strong>Hướng dẫn:</strong></p>
        <p>• Nhấp vào ô môn học để xem chi tiết</p>
        <p>• Sáng: Tiết 1-5, Chiều: Tiết 6-10, Tối: Tiết 11-15</p>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export const TKBComponents = () => {
  const { user } = useAuth();
  const studentId = user?.maSv || user?.id || user?.username;
  
  const currentAcademicYear = getCurrentAcademicYear();
  const currentSemester = getCurrentSemester();
  
  const [viewMode, setViewMode] = useState("theoTuan");
  const [selectedSemester, setSelectedSemester] = useState(currentSemester);
  const [selectedWeek, setSelectedWeek] = useState("Tuần 1");
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastApiCall, setLastApiCall] = useState(null);

  const semesterData = createSemesterData(currentAcademicYear);

  const getCurrentWeekInfo = useCallback(() => {
    const semester = semesterData[selectedSemester];
    return semester?.weeks.find(week => week.key === selectedWeek);
  }, [selectedSemester, selectedWeek, semesterData]);

  const loadTimetableData = useCallback(async (semester, week, forceRefresh = false) => {
    if (!studentId) {
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

      const weekStart = weekInfo.startDate.toISOString().split('T')[0];
      const weekEnd = weekInfo.endDate.toISOString().split('T')[0];
      const apiKey = `${studentId}-${semester}-${week}-${weekStart}-${weekEnd}`;
      
      if (lastApiCall === apiKey && !forceRefresh) {
        setLoading(false);
        return;
      }

      const apiData = await fetchStudentTimetable({
        studentId,
        semester,
        weekStart,
        weekEnd,
      });

      const convertedData = convertApiDataToTimetable(apiData);
      setTimetableData(convertedData);
      setLastApiCall(apiKey);

    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu TKB:", err);
      setError(err.message);
      setTimetableData({});
    } finally {
      setLoading(false);
    }
  }, [studentId, getCurrentWeekInfo, lastApiCall]);

  useEffect(() => {
    loadTimetableData(selectedSemester, selectedWeek);
  }, [selectedSemester, selectedWeek, loadTimetableData]);

  const handleSemesterChange = (newSemester) => {
    setSelectedSemester(newSemester);
    const firstWeek = semesterData[newSemester]?.weeks[0]?.key || "Tuần 1";
    setSelectedWeek(firstWeek);
  };

  const handleWeekChange = (newWeek) => {
    setSelectedWeek(newWeek);
  };

  const handleRefresh = () => {
    loadTimetableData(selectedSemester, selectedWeek, true);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div>
          <label><strong>Mã sinh viên:</strong> </label>
          <span style={{ 
            padding: "5px 10px", 
            backgroundColor: "#e9ecef", 
            borderRadius: "4px",
            fontWeight: "bold"
          }}>
            {studentId || "Chưa có"}
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
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            style={{ padding: "5px", minWidth: "200px" }}
          >
            <option value="theoTuan">📅 Thời khóa biểu theo tuần</option>
            <option value="caNhan">📋 Thời khóa biểu cá nhân</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === "theoTuan" ? (
        <WeeklyTimetable
          data={timetableData}
          selectedWeek={selectedWeek}
          selectedSemester={selectedSemester}
          onSemesterChange={handleSemesterChange}
          onWeekChange={handleWeekChange}
          onRefresh={handleRefresh}
          semesterData={semesterData}
          loading={loading}
          error={error}
        />
      ) : (
        <PersonalTimetable
          data={timetableData}
          loading={loading}
        />
      )}
    </div>
  );
};