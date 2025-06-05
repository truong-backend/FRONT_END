import React, { useState } from "react";

const days = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];
const periodTimes = [
  "07:00-07:50", // Tiết 01
  "07:50-08:40", // Tiết 02
  "08:40-09:30", // Tiết 03
  "09:35-10:25", // Tiết 04
  "10:25-11:15", // Tiết 05
  "11:15-12:05", // Tiết 06
  "12:35-13:25", // Tiết 07
  "13:25-14:15", // Tiết 08
  "14:15-15:05", // Tiết 09
  "15:10-16:00", // Tiết 10
  "16:00-16:50", // Tiết 11
  "16:50-17:40", // Tiết 12
  "17:45-18:35", // Tiết 13
  "18:35-19:25", // Tiết 14
  "19:25-20:15", // Tiết 15
];

// Dữ liệu mẫu cho TkbDto
const testTkbData = [
  {
    id: 1,
    maGd: 101,
    maGv: "GV001",
    tenGv: "Nguyễn Văn B",
    maMh: "MH001",
    tenMh: "Cơ sở dữ liệu (HK24.3 - DBMS 01)",
    ngayHoc: "2025-06-30",
    phongHoc: "A101",
    stBd: 2,
    stKt: 6,
    ghiChu: "Nhóm 02",
  },
  {
    id: 2,
    maGd: 102,
    maGv: "GV002",
    tenGv: "Trần Thị B",
    maMh: "MH002",
    tenMh: "Thực hành Lập trình Java (HK24.3 - JAVA 01)",
    ngayHoc: "2025-07-01",
    phongHoc: "B205",
    stBd: 7,
    stKt: 11,
    ghiChu: "Nhóm 04",
  },
];

// Dữ liệu mẫu cho LichGdDto
const testLichGdData = [
  {
    id: 3,
    maGv: "GV003",
    tenGv: "Lê Văn C",
    maMh: "MH003",
    tenMh: "Trí tuệ nhân tạo",
    nmh: 3,
    phongHoc: "C301",
    ngayBd: "2025-06-03",
    ngayKt: "2025-08-30",
    stBd: 1,
    stKt: 3,
    hocKy: 1,
  },
];

export const ScheduleFullTable = ({ tkbLists = [testTkbData], dataType = "tkbData" }) => {
  const [scheduleData, setScheduleData] = useState(tkbLists);
  const [isAdding, setIsAdding] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  
  // Template cho TkbDto
  const tkbTemplate = {
    id: null,
    maGd: null,
    maGv: "",
    tenGv: "",
    maMh: "",
    tenMh: "",
    ngayHoc: "",
    phongHoc: "",
    stBd: 1,
    stKt: 1,
    ghiChu: "",
  };

  // Template cho LichGdDto
  const lichGdTemplate = {
    id: null,
    maGv: "",
    tenGv: "",
    maMh: "",
    tenMh: "",
    nmh: 1,
    phongHoc: "",
    ngayBd: "",
    ngayKt: "",
    stBd: 1,
    stKt: 1,
    hocKy: 1,
  };

  const [newClass, setNewClass] = useState(dataType === "tkbData" ? tkbTemplate : lichGdTemplate);

  const getDayIndex = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.warn(`Invalid date format: ${dateStr}, skipping...`);
      return -1;
    }
    const day = new Date(dateStr).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getDateForDay = (dayIdx) => {
    const startDate = new Date("2025-06-23");
    const diff = dayIdx - getDayIndex("2025-06-23");
    startDate.setDate(startDate.getDate() + diff);
    return startDate.toLocaleDateString("vi-VN");
  };

  const groupedByDay = Array.from({ length: 7 }, (_, i) => ({
    day: days[i],
    date: getDateForDay(i),
    classes: [],
  }));

  // Xử lý dữ liệu theo loại
  scheduleData.forEach((dayClasses) => {
    dayClasses.forEach((classItem, index) => {
      let dayIndex, startTime, endTime, displayData;
      
      if (dataType === "tkbData") {
        // Xử lý TkbDto
        const { id, maGd, maGv, tenGv, maMh, tenMh, ngayHoc, phongHoc, stBd, stKt, ghiChu } = classItem;
        dayIndex = getDayIndex(ngayHoc);
        if (dayIndex === -1) return;
        
        startTime = periodTimes[stBd - 1]?.split("-")[0] || "N/A";
        endTime = periodTimes[stKt - 1]?.split("-")[1] || "N/A";
        
        displayData = {
          id,
          maGd,
          maGv,
          teacher: tenGv,
          subject: tenMh,
          maMh,
          room: phongHoc,
          time: `${startTime}-${endTime} (Tiết ${stBd}-${stKt})`,
          group: ghiChu || "Chưa xác định",
          date: ngayHoc,
          index,
        };
      } else {
        // Xử lý LichGdDto
        const { id, maGv, tenGv, maMh, tenMh, nmh, phongHoc, ngayBd, ngayKt, stBd, stKt, hocKy } = classItem;
        dayIndex = getDayIndex(ngayBd);
        if (dayIndex === -1) return;
        
        startTime = periodTimes[stBd - 1]?.split("-")[0] || "N/A";
        endTime = periodTimes[stKt - 1]?.split("-")[1] || "N/A";
        
        displayData = {
          id,
          maGv,
          teacher: tenGv,
          subject: tenMh,
          maMh,
          nmh,
          room: phongHoc,
          time: `${startTime}-${endTime} (Tiết ${stBd}-${stKt})`,
          dateRange: `${ngayBd} - ${ngayKt}`,
          semester: `HK${hocKy}`,
          index,
        };
      }
      
      if (!groupedByDay[dayIndex].classes.some(cls => cls.id === displayData.id)) {
        groupedByDay[dayIndex].classes.push(displayData);
      }
    });
  });

  const handleAdd = () => {
    const newId = Math.max(...scheduleData.flat().map(cls => cls.id || 0), 0) + 1;
    setScheduleData([...scheduleData, [{ ...newClass, id: newId }]]);
    setNewClass(dataType === "tkbData" ? tkbTemplate : lichGdTemplate);
    setIsAdding(false);
  };

  const handleEdit = (index) => {
    const classToEdit = scheduleData.flat()[index];
    setNewClass(classToEdit);
    setEditIndex(index);
    setIsAdding(true);
  };

  const handleSave = () => {
    const updatedScheduleData = [...scheduleData];
    updatedScheduleData.flat()[editIndex] = newClass;
    setScheduleData(updatedScheduleData);
    setNewClass(dataType === "tkbData" ? tkbTemplate : lichGdTemplate);
    setEditIndex(null);
    setIsAdding(false);
  };

  const handleDelete = (index) => {
    const updatedScheduleData = [...scheduleData];
    const flatIndex = updatedScheduleData.flat().findIndex((_, i) => i === index);
    updatedScheduleData.flat().splice(flatIndex, 1);
    setScheduleData(updatedScheduleData);
  };

  const renderForm = () => {
    if (dataType === "tkbData") {
      return (
        <>
          <input
            type="number"
            placeholder="Mã GD"
            value={newClass.maGd || ""}
            onChange={(e) => setNewClass({ ...newClass, maGd: parseInt(e.target.value) || null })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Mã giảng viên"
            value={newClass.maGv}
            onChange={(e) => setNewClass({ ...newClass, maGv: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Tên giảng viên"
            value={newClass.tenGv}
            onChange={(e) => setNewClass({ ...newClass, tenGv: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Mã môn học"
            value={newClass.maMh}
            onChange={(e) => setNewClass({ ...newClass, maMh: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Tên môn học"
            value={newClass.tenMh}
            onChange={(e) => setNewClass({ ...newClass, tenMh: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="date"
            placeholder="Ngày học"
            value={newClass.ngayHoc}
            onChange={(e) => setNewClass({ ...newClass, ngayHoc: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Phòng học"
            value={newClass.phongHoc}
            onChange={(e) => setNewClass({ ...newClass, phongHoc: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="number"
            placeholder="Tiết bắt đầu"
            value={newClass.stBd}
            onChange={(e) => setNewClass({ ...newClass, stBd: parseInt(e.target.value) })}
            className="border p-2 mb-2 w-full rounded"
            min="1"
            max="15"
          />
          <input
            type="number"
            placeholder="Tiết kết thúc"
            value={newClass.stKt}
            onChange={(e) => setNewClass({ ...newClass, stKt: parseInt(e.target.value) })}
            className="border p-2 mb-2 w-full rounded"
            min="1"
            max="15"
          />
          <input
            type="text"
            placeholder="Ghi chú"
            value={newClass.ghiChu}
            onChange={(e) => setNewClass({ ...newClass, ghiChu: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
        </>
      );
    } else {
      return (
        <>
          <input
            type="text"
            placeholder="Mã giảng viên"
            value={newClass.maGv}
            onChange={(e) => setNewClass({ ...newClass, maGv: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Tên giảng viên"
            value={newClass.tenGv}
            onChange={(e) => setNewClass({ ...newClass, tenGv: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Mã môn học"
            value={newClass.maMh}
            onChange={(e) => setNewClass({ ...newClass, maMh: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Tên môn học"
            value={newClass.tenMh}
            onChange={(e) => setNewClass({ ...newClass, tenMh: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="number"
            placeholder="Số môn học"
            value={newClass.nmh}
            onChange={(e) => setNewClass({ ...newClass, nmh: parseInt(e.target.value) })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Phòng học"
            value={newClass.phongHoc}
            onChange={(e) => setNewClass({ ...newClass, phongHoc: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="date"
            placeholder="Ngày bắt đầu"
            value={newClass.ngayBd}
            onChange={(e) => setNewClass({ ...newClass, ngayBd: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="date"
            placeholder="Ngày kết thúc"
            value={newClass.ngayKt}
            onChange={(e) => setNewClass({ ...newClass, ngayKt: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="number"
            placeholder="Tiết bắt đầu"
            value={newClass.stBd}
            onChange={(e) => setNewClass({ ...newClass, stBd: parseInt(e.target.value) })}
            className="border p-2 mb-2 w-full rounded"
            min="1"
            max="15"
          />
          <input
            type="number"
            placeholder="Tiết kết thúc"
            value={newClass.stKt}
            onChange={(e) => setNewClass({ ...newClass, stKt: parseInt(e.target.value) })}
            className="border p-2 mb-2 w-full rounded"
            min="1"
            max="15"
          />
          <input
            type="number"
            placeholder="Học kỳ"
            value={newClass.hocKy}
            onChange={(e) => setNewClass({ ...newClass, hocKy: parseInt(e.target.value) })}
            className="border p-2 mb-2 w-full rounded"
          />
        </>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {dataType === "tkbData" ? "Thời khóa biểu (TKB)" : "Lịch giảng dạy (LGD)"}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm {dataType === "tkbData" ? "lịch học" : "lịch giảng dạy"}
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-96 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editIndex !== null ? "Sửa" : "Thêm"} {dataType === "tkbData" ? "lịch học" : "lịch giảng dạy"}
            </h2>
            {renderForm()}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditIndex(null);
                  setNewClass(dataType === "tkbData" ? tkbTemplate : lichGdTemplate);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
              >
                Hủy
              </button>
              <button
                onClick={editIndex !== null ? handleSave : handleAdd}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {editIndex !== null ? "Lưu" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {groupedByDay.map(({ day, date, classes }, idx) => (
        <div key={idx}>
          <h2 className="text-lg font-bold mb-2">
            📅 {day} ({date})
          </h2>
          {classes.length > 0 ? (
            <ul className="space-y-2">
              {classes.map((cls, i) => (
                <li
                  key={i}
                  className="border border-gray-300 rounded p-3 bg-yellow-50 shadow-sm flex justify-between"
                >
                  <div>
                    <p className="font-semibold text-green-800">{cls.subject} ({cls.maMh})</p>
                    <p className="text-sm text-gray-600">Phòng: {cls.room}</p>
                    <p className="text-sm text-blue-700">GV: {cls.teacher} ({cls.maGv})</p>
                    <p className="text-sm text-gray-600">Thời gian: {cls.time}</p>
                    {dataType === "tkbData" ? (
                      <>
                        <p className="text-sm text-gray-600">Nhóm: {cls.group}</p>
                        <p className="text-sm text-gray-600">Mã GD: {cls.maGd}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Thời gian: {cls.dateRange}</p>
                        <p className="text-sm text-gray-600">Học kỳ: {cls.semester}</p>
                        <p className="text-sm text-gray-600">Số môn học: {cls.nmh}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => handleEdit(cls.index)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cls.index)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">Không có lớp học</p>
          )}
        </div>
      ))}
    </div>
  );
};