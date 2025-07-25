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

    const semesterNumber = extractSemesterNumber(semester);
    const data = await tkbService.fetchTkbSinhVien({ 
      maSv: studentId, 
      hocKy: semesterNumber,
      startOfWeek: weekStart, 
      endOfWeek: weekEnd 
    });
    return data;

};
const SubjectDetailModal = ({ subject, isOpen, onClose }) => {
  if (!isOpen || !subject) return null;

  return (
    <div

      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
      >
        <div >
          <h3>Chi tiết môn học</h3>
          <button 
            onClick={onClose}

          >
            ×
          </button>
        </div>
        <div>
          <p><strong>Mã môn học:</strong> {subject.maMH}</p>
          <p><strong>Tên môn học:</strong> {subject.tenMon}</p>
          <p><strong>Thứ:</strong> {subject.thu} - <strong>Tiết:</strong> {subject.tietBd} đến {subject.tietKt}</p>
          <p><strong>Phòng học:</strong> {subject.phong}</p>
          <p><strong>Giảng viên:</strong> {subject.cbgd}</p>
          {/* <p><strong>Tuần học:</strong> {subject.tuan}</p> */}
        </div>
        <div >
          <button 
            onClick={onClose}
            
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
const PersonalTimetable = ({ data }) => {
  const allSubjects = Object.keys(data).reduce((acc, day) => [...acc, ...data[day]], []);
  return (
    <div>
      <h2 >Thời Khóa Biểu Cá Nhân</h2>
      {allSubjects.length > 0 ? (
        <table >
          <thead>
            <tr>
              {["Mã MH", "Tên MH", "NMH", "Tiết BD", "ST", "Phòng", "CBGD", "Tuần"].map((header) => (
                <th key={header} >{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allSubjects.map((subject, index) => (
              <tr key={index}>
                <td >{subject.maMH}</td>
                <td >{subject.tenMon}</td>
                <td >{subject.nmh || "N/A"}</td>
                <td >{subject.tietBd}</td>
                <td >{subject.st || "N/A"}</td>
                <td >{subject.phong}</td>
                <td >{subject.cbgd || "N/A"}</td>
                <td >{subject.tuan || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p >Không có dữ liệu thời khóa biểu.</p>
      )}
    </div>
  );
};
const WeeklyTimetable = ({
  data, selectedWeek, selectedSemester, 
  onSemesterChange, onWeekChange,
  semesterData,
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const maxPeriods = 15;
  const getSubjectForPeriod = (day, period) => {
    const daySubjects = data[day] || [];
    return daySubjects.find(subject => period >= subject.tietBd && period <= subject.tietKt);
  };
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setShowDetail(true);
  };
  const availableWeeks = semesterData[selectedSemester]?.weeks || [];
  return (
    <div>
      {/* Controls */}
      <div >
        <div>
          <label>Học kỳ: </label>
          <select 
            value={selectedSemester} 
            onChange={(e) => onSemesterChange(e.target.value)}
            
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
          >
            {availableWeeks.map((week) => (
              <option key={week.key} value={week.key}>{week.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Timetable */}
      <h1 >Thời Khóa Biểu Tuần: {selectedWeek}</h1>
      <table >
        <thead>
          <tr>
            <th >Tiết</th>
            {days.map((day) => (
              <th key={day} >{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxPeriods }, (_, i) => i + 1).map((period) => (
            <tr key={period}>
              <td >
                Tiết {period}
                <br />
               
              </td>
              {days.map((day) => {
                const subject = getSubjectForPeriod(day, period);
                if (subject && subject.tietBd === period) {
                  const rowSpan = subject.tietKt - subject.tietBd + 1;
                  return (
                    <td
                      key={day + period}
                      rowSpan={rowSpan}
                      onClick={() => handleSubjectClick(subject)}
                      
                    >
                      <div >{subject.tenMon}</div>
                      <div >{subject.phong}</div>
                      <div >{subject.cbgd}</div>
                    </td>
                  );
                } else if (subject && subject.tietBd < period && period <= subject.tietKt) {
                  return null;
                } else {
                  return <td key={day + period} ></td>;
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
    </div>
  );
};
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
  const [lastApiCall, setLastApiCall] = useState(null);

  const semesterData = createSemesterData(currentAcademicYear);

  const getCurrentWeekInfo = useCallback(() => {
    const semester = semesterData[selectedSemester];
    return semester?.weeks.find(week => week.key === selectedWeek);
  }, [selectedSemester, selectedWeek, semesterData]);

  const loadTimetableData = useCallback(async (semester, week, forceRefresh = false) => {
    setLoading(true);

    try {
      const weekInfo = getCurrentWeekInfo();

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

  return (
    <div>
      {/* Header */}
      <div >
        <div>
          <label><strong>Chế độ hiển thị:</strong> </label>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
            
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
          semesterData={semesterData}
          loading={loading}
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
