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

export const ThoiKhoaBieuTheoDanhSach = ({ tkbList = [], lichGdList = [] }) => {
  const getDayIndex = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.warn(`Invalid date format: ${dateStr}, skipping...`);
      return -1;
    }
    const day = new Date(dateStr).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getDateForDay = (dayIdx, referenceDate = null) => {
    // If we have a reference date from tkbList, use it
    let startDate;
    if (referenceDate) {
      startDate = new Date(referenceDate);
      const currentDayIndex = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
      const diff = dayIdx - currentDayIndex;
      startDate.setDate(startDate.getDate() + diff);
    } else {
      // Fallback to current week if no reference date
      startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay() + dayIdx + 1);
    }
    return startDate.toLocaleDateString("vi-VN");
  };

  // Find the first valid date from tkbList to use as reference
  const referenceDate = tkbList.find(item => item.ngayHoc)?.ngayHoc;

  const groupedByDay = Array.from({ length: 7 }, (_, i) => ({
    day: days[i],
    date: getDateForDay(i, referenceDate),
    classes: [],
  }));

  // Xử lý dữ liệu TKB
  tkbList.forEach((classItem) => {
    const { id, maGd, maGv, tenGv, maMh, tenMh, ngayHoc, phongHoc, stBd, stKt, ghiChu } = classItem;
    const dayIndex = getDayIndex(ngayHoc);
    if (dayIndex === -1) return;
    
    const startTime = periodTimes[stBd - 1]?.split("-")[0] || "N/A";
    const endTime = periodTimes[stKt - 1]?.split("-")[1] || "N/A";
    
    const displayData = {
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
      type: 'tkb'
    };
    
    if (!groupedByDay[dayIndex].classes.some(cls => cls.id === displayData.id)) {
      groupedByDay[dayIndex].classes.push(displayData);
    }
  });

  // Xử lý dữ liệu Lịch giảng dạy
  lichGdList.forEach((classItem) => {
    const { id, maGv, tenGv, maMh, tenMh, nmh, phongHoc, ngayBd, ngayKt, stBd, stKt, hocKy } = classItem;
    const dayIndex = getDayIndex(ngayBd);
    if (dayIndex === -1) return;
    
    const startTime = periodTimes[stBd - 1]?.split("-")[0] || "N/A";
    const endTime = periodTimes[stKt - 1]?.split("-")[1] || "N/A";
    
    const displayData = {
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
      type: 'lichgd'
    };
    
    if (!groupedByDay[dayIndex].classes.some(cls => cls.id === displayData.id)) {
      groupedByDay[dayIndex].classes.push(displayData);
    }
  });

  return (
    <div className="space-y-6">
      {groupedByDay.map((dayGroup, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg">
            <h3 className="text-lg font-semibold">{dayGroup.day} ({dayGroup.date})</h3>
          </div>
          
          <div className="p-4">
            {dayGroup.classes.length === 0 ? (
              <p className="text-gray-500 italic">Không có lịch học</p>
            ) : (
              <div className="space-y-4">
                {dayGroup.classes.map((cls, classIdx) => (
                  <div 
                    key={classIdx} 
                    className={`p-4 rounded-lg ${
                      cls.type === 'tkb' ? 'bg-green-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-lg">{cls.subject}</h4>
                        <p className="text-gray-600">
                          <span className="font-medium">Giảng viên:</span> {cls.teacher} ({cls.maGv})
                        </p>
                        {cls.type === 'lichgd' && (
                          <>
                            <p className="text-gray-600">
                              <span className="font-medium">Số tín chỉ:</span> {cls.nmh}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Học kỳ:</span> {cls.semester}
                            </p>
                          </>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Phòng:</span> {cls.room}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Thời gian:</span> {cls.time}
                        </p>
                        {cls.type === 'tkb' ? (
                          <p className="text-gray-600">
                            <span className="font-medium">Ghi chú:</span> {cls.group}
                          </p>
                        ) : (
                          <p className="text-gray-600">
                            <span className="font-medium">Thời gian:</span> {cls.dateRange}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
