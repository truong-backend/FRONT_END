// pages/SchedulePage.jsx
import React, { useState } from "react";
import { TkbLayout } from "../../components/layout/TkbLayout";
import { ScheduleFullTable } from "../../components/layout/ScheduleFullTable";

export const TkbList = ({ tkbData = [], lichGdData = [] }) => {
  // Dữ liệu mẫu cho TkbDto
  const tkbDataSets = {
    tkbData: tkbData.length > 0 ? tkbData : [
      {
        id: 1,
        maGd: 101,
        maGv: "GV001",
        tenGv: "Nguyễn Văn A",
        maMh: "MH001",
        tenMh: "Lập trình Web (HK24.3 - ĐOT 01)",
        ngayHoc: "2025-06-02",
        phongHoc: "C606",
        stBd: 1,
        stKt: 3,
        ghiChu: "Nhóm 01",
      },
      {
        id: 2,
        maGd: 102,
        maGv: "GV001",
        tenGv: "Nguyễn Văn A",
        maMh: "MH001",
        tenMh: "Lập trình Web (HK24.3 - ĐOT 01)",
        ngayHoc: "2025-06-04",
        phongHoc: "C606",
        stBd: 2,
        stKt: 3,
        ghiChu: "Nhóm 01",
      },
      {
        id: 3,
        maGd: 103,
        maGv: "GV002",
        tenGv: "Trần Thị B",
        maMh: "MH002",
        tenMh: "Cơ sở dữ liệu",
        ngayHoc: "2025-06-06",
        phongHoc: "B201",
        stBd: 2,
        stKt: 3,
        ghiChu: "Nhóm 02",
      },
    ],
    lichGdData: lichGdData.length > 0 ? lichGdData : [
      {
        id: 4,
        maGv: "GV003",
        tenGv: "Lê Văn C",
        maMh: "MH003", 
        tenMh: "Trí tuệ nhân tạo",
        nmh: 3,
        phongHoc: "C301",
        ngayBd: "2025-06-03",
        ngayKt: "2025-08-30",
        stBd: 1,
        stKt: 2,
        hocKy: 1,
      },
    ],
  };

  const [selectedDataKey, setSelectedDataKey] = useState("tkbData");
  const [selectedScheduleType, setSelectedScheduleType] = useState("TKB theo tuần");

  const currentData = tkbDataSets[selectedDataKey];
  const allDataSets = Object.values(tkbDataSets);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Thời khóa biểu</h1>

      {/* Schedule type dropdown */}
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
              id="data-type"
              value={selectedDataKey}
              onChange={(e) => setSelectedDataKey(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="tkbData">Thời khóa biểu (TKB)</option>
              <option value="lichGdData">Lịch giảng dạy (LGD)</option>
            </select>
         
            <select id="semester" className="border px-2 py-1 rounded text-sm">
              <option>Học kỳ 1 - Năm học 2024-2025</option>
              <option>Học kỳ 2 - Năm học 2024-2025</option>
              <option>Học kỳ 3 - Năm học 2025-2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select id="week" className="border px-2 py-1 rounded text-sm">
              <option>Tuần 44 [Từ 30/06/2025 -- Đến 06/07/2025]</option>
              <option>Tuần 45 [Từ 07/07/2025 -- Đến 13/07/2025]</option>
              <option>Tuần 46 [Từ 14/07/2025 -- Đến 20/07/2025]</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table display */}
      {selectedScheduleType === "TKB Toàn Trường" ? (
        <ScheduleFullTable 
          tkbLists={allDataSets} 
          dataType={selectedDataKey}
        />
      ) : (
        <TkbLayout 
          tkbList={currentData} 
          dataType={selectedDataKey}
        />
      )}
    </div>
  );
};