import React, { useState, useEffect } from "react";
import { TkbByTabel } from "./layout/TkbByTabel.jsx";
import { TkbByList } from "./layout/TkbByList.jsx";
import { tkbService } from "../../../services/PhanAdmin/tkbService.js";
import { message } from "antd";
import moment from 'moment';

export const TkbList = () => {
  const [selectedScheduleType, setSelectedScheduleType] = useState("TKB theo tuần");
  const [loading, setLoading] = useState(false);
  const [tkbData, setTkbData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await tkbService.getAllTkb();
      setTkbData(data);
      
      // Extract academic years from data
      const years = extractAcademicYears(data);
      setAcademicYears(years);
      
      if (years.length > 0) {
        const mostRecentYear = years[0];
        setSelectedAcademicYear(mostRecentYear);
        setWeeks(generateWeeks(mostRecentYear));
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get academic years from data
  const extractAcademicYears = (data) => {
    const years = new Set();
    data.forEach(item => {
      const date = moment(item.ngayHoc); // Changed from ngay_hoc to ngayHoc
      const month = date.month() + 1;
      const year = date.year();
      
      if (month >= 9) {
        years.add(`${year}-${year + 1}`);
      } else {
        years.add(`${year - 1}-${year}`);
      }
    });
    return Array.from(years).sort().reverse();
  };

  // Helper function to generate week options
  const generateWeeks = (academicYear) => {
    if (!academicYear) return [];
    
    const [startYear] = academicYear.split('-');
    const weeks = [];
    let currentDate = moment(`${startYear}-09-01`);
    const endDate = moment(`${parseInt(startYear) + 1}-08-31`);
    let weekNum = 1;

    while (currentDate.isSameOrBefore(endDate)) {
      const weekStart = currentDate.clone();
      const weekEnd = currentDate.clone().add(6, 'days');
      
      weeks.push({
        weekNum,
        label: `Tuần ${weekNum} [Từ ${weekStart.format('DD/MM/YYYY')} -- Đến ${weekEnd.format('DD/MM/YYYY')}]`,
        startDate: weekStart.format('YYYY-MM-DD'),
        endDate: weekEnd.format('YYYY-MM-DD')
      });
      
      currentDate.add(7, 'days');
      weekNum++;
    }
    
    return weeks;
  };

  // Function to check if a week is valid for a semester
  const isWeekValidForSemester = (weekNum, semester) => {
    if (!semester) return true;
    
    const semesterRanges = {
      1: { start: 1, end: 15 },    // Học kỳ 1: tuần 1-15
      2: { start: 16, end: 30 },   // Học kỳ 2: tuần 16-30
      3: { start: 31, end: 45 }    // Học kỳ 3: tuần 31-45
    };

    const range = semesterRanges[semester];
    return weekNum >= range.start && weekNum <= range.end;
  };

  // Filter data based on selected week and academic year
  useEffect(() => {
    if (!tkbData.length) return;

    let filtered = [...tkbData];

    if (selectedAcademicYear) {
      const [startYear] = selectedAcademicYear.split('-');
      const yearStart = moment(`${startYear}-09-01`);
      const yearEnd = moment(`${parseInt(startYear) + 1}-08-31`);
      
      filtered = filtered.filter(item => {
        const itemDate = moment(item.ngayHoc);
        return itemDate.isBetween(yearStart, yearEnd, 'day', '[]');
      });
    }

    if (selectedWeek) {
      const weekStart = moment(selectedWeek.startDate);
      const weekEnd = moment(selectedWeek.endDate);
      
      filtered = filtered.filter(item => {
        const itemDate = moment(item.ngayHoc);
        return itemDate.isBetween(weekStart, weekEnd, 'day', '[]');
      });
    }

    setFilteredData(filtered);
  }, [selectedWeek, selectedAcademicYear, tkbData]);

  const handleCreate = async (newData) => {
    try {
      setLoading(true);
      const formattedData = {
        maGd: newData.maGd,
        ngayHoc: moment(newData.ngayHoc).format('YYYY-MM-DD'),
        phongHoc: newData.phongHoc,
        stBd: parseInt(newData.stBd),
        stKt: parseInt(newData.stKt),
        ghiChu: newData.ghiChu || null
      };
      
      const response = await tkbService.createTkb(formattedData);
      message.success('Thêm thời khóa biểu thành công');
      await fetchData(); // Refresh data
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      setLoading(true);
      const formattedData = {
        maGd: updatedData.maGd,
        ngayHoc: moment(updatedData.ngayHoc).format('YYYY-MM-DD'),
        phongHoc: updatedData.phongHoc,
        stBd: parseInt(updatedData.stBd),
        stKt: parseInt(updatedData.stKt),
        ghiChu: updatedData.ghiChu || null
      };
      
      await tkbService.updateTkb(id, formattedData);
      message.success('Cập nhật thời khóa biểu thành công');
      await fetchData(); // Refresh data
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await tkbService.deleteTkb(id);
      message.success('Xóa thời khóa biểu thành công');
      await fetchData(); // Refresh data
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (e) => {
    const semester = e.target.value;
    setSelectedSemester(semester);
    setSelectedWeek(null);
  };

  const handleWeekChange = (e) => {
    const weekNum = e.target.value;
    if (weekNum) {
      const week = weeks.find(w => w.weekNum === parseInt(weekNum));
      if (selectedSemester && !isWeekValidForSemester(week.weekNum, selectedSemester)) {
        message.warning(`Tuần ${week.weekNum} không nằm trong học kỳ ${selectedSemester}`);
        return;
      }
      setSelectedWeek(week);
    } else {
      setSelectedWeek(null);
    }
  };

  const handleAcademicYearChange = (e) => {
    const year = e.target.value;
    setSelectedAcademicYear(year);
    setSelectedWeek(null);
    setSelectedSemester(null);
    if (year) {
      setWeeks(generateWeeks(year));
    } else {
      setWeeks([]);
    }
  };

  // Add new functions for week navigation
  const goToFirstWeek = () => {
    if (weeks.length > 0) {
      const firstWeek = weeks[0];
      if (selectedSemester && !isWeekValidForSemester(firstWeek.weekNum, selectedSemester)) {
        message.warning(`Tuần ${firstWeek.weekNum} không nằm trong học kỳ ${selectedSemester}`);
        return;
      }
      setSelectedWeek(firstWeek);
    }
  };

  const goToLastWeek = () => {
    if (weeks.length > 0) {
      const lastWeek = weeks[weeks.length - 1];
      if (selectedSemester && !isWeekValidForSemester(lastWeek.weekNum, selectedSemester)) {
        message.warning(`Tuần ${lastWeek.weekNum} không nằm trong học kỳ ${selectedSemester}`);
        return;
      }
      setSelectedWeek(lastWeek);
    }
  };

  const goToPreviousWeek = () => {
    if (selectedWeek && weeks.length > 0) {
      const currentIndex = weeks.findIndex(w => w.weekNum === selectedWeek.weekNum);
      if (currentIndex > 0) {
        const previousWeek = weeks[currentIndex - 1];
        if (selectedSemester && !isWeekValidForSemester(previousWeek.weekNum, selectedSemester)) {
          message.warning(`Tuần ${previousWeek.weekNum} không nằm trong học kỳ ${selectedSemester}`);
          return;
        }
        setSelectedWeek(previousWeek);
      }
    }
  };

  const goToNextWeek = () => {
    if (selectedWeek && weeks.length > 0) {
      const currentIndex = weeks.findIndex(w => w.weekNum === selectedWeek.weekNum);
      if (currentIndex < weeks.length - 1) {
        const nextWeek = weeks[currentIndex + 1];
        if (selectedSemester && !isWeekValidForSemester(nextWeek.weekNum, selectedSemester)) {
          message.warning(`Tuần ${nextWeek.weekNum} không nằm trong học kỳ ${selectedSemester}`);
          return;
        }
        setSelectedWeek(nextWeek);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Thời khóa biểu</h1>

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <select
              id="select-schedule-type"
              value={selectedScheduleType}
              onChange={(e) => setSelectedScheduleType(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="TKB theo tuần">TKB theo tuần</option>
              <option value="TKB Toàn Trường">TKB Theo Danh Sách</option>
            </select>

            <select 
              id="academic-year" 
              className="border px-2 py-1 rounded text-sm"
              onChange={handleAcademicYearChange}
              value={selectedAcademicYear || ''}
            >
              <option value="">Chọn năm học</option>
              {academicYears.map(year => (
                <option key={year} value={year}>
                  {`Năm học ${year}`}
                </option>
              ))}
            </select>
                        <select 
              id="week" 
              className="border px-2 py-1 rounded text-sm"
              onChange={handleWeekChange}
              value={selectedWeek?.weekNum || ''}
              disabled={!selectedAcademicYear}
            >
              <option value="">Chọn tuần</option>
              {weeks
                .filter(week => !selectedSemester || isWeekValidForSemester(week.weekNum, selectedSemester))
                .map(week => (
                  <option key={week.weekNum} value={week.weekNum}>
                    {week.label}
                  </option>
                ))
              }
            </select>
            
            <select 
              id="semester" 
              className="border px-2 py-1 rounded text-sm"
              onChange={handleSemesterChange}
              value={selectedSemester || ''}
              disabled={!selectedAcademicYear}
            >
              <option value="">Chọn học kỳ</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
              <option value="3">Học kỳ 3</option>
            </select>
          </div>


        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <span className="text-gray-600">Đang xử lý...</span>
        </div>
      )}

      {selectedScheduleType === "TKB Toàn Trường" ? (
        <TkbByList
          tkbList={filteredData}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ) : (
        <TkbByTabel
          tkbList={filteredData}
        />
      )}
                <div className="flex items-center gap-2">
            <button
              onClick={goToFirstWeek}
              disabled={!selectedAcademicYear || !weeks.length}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Tuần Đầu
            </button>
            <button
              onClick={goToPreviousWeek}
              disabled={!selectedWeek || !weeks.length}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Tuần Trước
            </button>

            <button
              onClick={goToNextWeek}
              disabled={!selectedWeek || !weeks.length}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Tuần Kế
            </button>
            <button
              onClick={goToLastWeek}
              disabled={!selectedAcademicYear || !weeks.length}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Tuần Cuối
            </button>
          </div>
    </div>
  );
};
