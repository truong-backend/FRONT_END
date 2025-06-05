import React from "react";

const days = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];
const periods = Array.from({ length: 15 }, (_, i) => `Tiết ${i + 1}`);

// Thời gian cho từng tiết
const periodTimes = [
  "07:00-07:50", "07:50-08:40", "08:50-09:40", "09:40-10:30", "10:40-11:30",
  "11:30-12:20", "12:30-13:20", "13:20-14:10", "14:20-15:10", "15:10-16:00",
  "16:10-17:00", "17:00-17:50", "18:00-18:50", "18:50-19:40", "19:50-20:40"
];

export const TkbByTabel = ({ tkbList = [], lichGdList = [] }) => {
  const getDayIndex = (dateStr) => {
    if (!dateStr) return -1;
    const day = new Date(dateStr).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getDateForDay = (dayIdx) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() + (dayIdx + 1));
    return startDate.toLocaleDateString("vi-VN");
  };

  const scheduleData = Array.from({ length: 15 }, () => Array(7).fill(null));

  // Xử lý dữ liệu TkbDto
  tkbList.forEach((item) => {
    const { 
      id,
      maGd,
      maGv,
      tenGv,
      maMh,
      tenMh, 
      ngayHoc, 
      phongHoc, 
      stBd, 
      stKt, 
      ghiChu 
    } = item;
    
    if (!ngayHoc || !stBd || !stKt) return;
    
    const dayIdx = getDayIndex(ngayHoc);
    if (dayIdx === -1) return;

    const span = stKt - stBd + 1;
    const timeRange = `${periodTimes[stBd - 1]?.split("-")[0]}-${periodTimes[stKt - 1]?.split("-")[1]}`;
    
    for (let period = stBd; period <= stKt; period++) {
      if (period >= 1 && period <= 15) {
        if (period === stBd) {
          scheduleData[period - 1][dayIdx] = {
            id,
            subject: tenMh || "Chưa có tên môn",
            room: phongHoc || "Chưa xác định",
            teacher: tenGv || "Chưa xác định",
            teacherCode: maGv,
            subjectCode: maMh,
            date: getDateForDay(dayIdx),
            time: timeRange,
            note: ghiChu,
            rowSpan: span,
            type: 'tkb'
          };
        } else {
          scheduleData[period - 1][dayIdx] = { skip: true };
        }
      }
    }
  });

  // Xử lý dữ liệu LichGdDto
  lichGdList.forEach((item) => {
    const { 
      id,
      maGv,
      tenGv,
      maMh,
      tenMh,
      nmh,
      phongHoc,
      ngayBd,
      ngayKt,
      stBd,
      stKt,
      hocKy
    } = item;
    
    if (!ngayBd || !stBd || !stKt) return;
    
    // Xử lý từ ngayBd đến ngayKt (có thể là nhiều ngày)
    const startDate = new Date(ngayBd);
    const endDate = new Date(ngayKt);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayIdx = getDayIndex(d.toISOString().split('T')[0]);
      if (dayIdx === -1) continue;

      const span = stKt - stBd + 1;
      const timeRange = `${periodTimes[stBd - 1]?.split("-")[0]}-${periodTimes[stKt - 1]?.split("-")[1]}`;
      
      for (let period = stBd; period <= stKt; period++) {
        if (period >= 1 && period <= 15) {
          if (period === stBd && !scheduleData[period - 1][dayIdx]) {
            scheduleData[period - 1][dayIdx] = {
              id,
              subject: tenMh || "Chưa có tên môn",
              room: phongHoc || "Chưa xác định",
              teacher: tenGv || "Chưa xác định",
              teacherCode: maGv,
              subjectCode: maMh,
              credits: nmh,
              semester: hocKy,
              date: getDateForDay(dayIdx),
              time: timeRange,
              rowSpan: span,
              type: 'lichgd'
            };
          } else if (period !== stBd && !scheduleData[period - 1][dayIdx]) {
            scheduleData[period - 1][dayIdx] = { skip: true };
          }
        }
      }
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm leading-relaxed">
        <p><strong>Chú thích:</strong></p>
        <ul className="list-disc list-inside">
          <li>Tiết 01 (07h00 - 07h50); Tiết 02 (07h50 - 08h40); Tiết 03 (08h50 - 09h40);</li>
          <li>Tiết 04 (09h40 - 10h30); Tiết 05 (10h40 - 11h30); Tiết 06 (11h30 - 12h20);</li>
          <li>Tiết 07 (12h30 - 13h20); Tiết 08 (13h20 - 14h10); Tiết 09 (14h20 - 15h10);</li>
          <li>Tiết 10 (15h10 - 16h00); Tiết 11 (16h10 - 17h00); Tiết 12 (17h00 - 17h50);</li>
          <li>Tiết 13 (18h00 - 18h50); Tiết 14 (18h50 - 19h40); Tiết 15 (19h50 - 20h40);</li>
        </ul>
      </div>

      <table className="min-w-full border border-collapse text-sm">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="border w-12 text-center">Tiết</th>
            {days.map((day, idx) => (
              <th key={idx} className="border text-center w-28">{day}</th>
            ))}
            <th className="border w-12 text-center">Tiết</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period, rowIdx) => (
            <tr key={rowIdx}>
              {/* Cột tiết bên trái */}
              <td className="border text-center font-semibold bg-blue-100">{period}</td>

              {/* Các cột môn học */}
              {scheduleData[rowIdx].map((cell, colIdx) => {
                if (cell?.skip) return null;
                return (
                  <td
                    key={colIdx}
                    className={`border align-top text-[12px] leading-tight px-1 py-1 ${
                      cell ? (cell.type === 'tkb' ? "bg-green-50" : "bg-blue-50") : ""
                    }`}
                    rowSpan={cell?.rowSpan || 1}
                  >
                    {cell && !cell.skip ? (
                      <div className="flex flex-col items-center text-center">
                        <p className={`font-semibold ${
                          cell.type === 'tkb' ? 'text-green-700' : 'text-blue-700'
                        }`}>
                          {cell.subject}
                        </p>
                        {cell.subjectCode && (
                          <p className="text-gray-500 text-[10px]">({cell.subjectCode})</p>
                        )}
                        <p className="italic text-gray-600">{cell.teacher}</p>
                        {cell.teacherCode && (
                          <p className="text-gray-500 text-[10px]">({cell.teacherCode})</p>
                        )}
                        <p className="text-gray-700">Phòng: {cell.room}</p>
                        {cell.credits && (
                          <p className="text-gray-600 text-[10px]">TC: {cell.credits}</p>
                        )}
                        {cell.semester && (
                          <p className="text-gray-600 text-[10px]">HK: {cell.semester}</p>
                        )}
                        {cell.note && (
                          <p className="text-orange-600 text-[10px] italic">{cell.note}</p>
                        )}
                      </div>
                    ) : null}
                  </td>
                );
              })}

              {/* Cột tiết bên phải */}
              <td className="border text-center font-semibold bg-blue-100">{period}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};