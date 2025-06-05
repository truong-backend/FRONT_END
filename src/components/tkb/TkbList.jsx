import React, { useState, useEffect } from "react";
import { TkbByTabel } from "./layout/TkbByTabel.jsx";
import { TkbByList } from "./layout/TkbByList.jsx";
import { tkbService } from "../../services/tkbService.js";
import { message } from "antd";

export const TkbList = ({ tkbData = [], lichGdData = [] }) => {
  const [selectedDataKey, setSelectedDataKey] = useState("tkbData");
  const [selectedScheduleType, setSelectedScheduleType] = useState("TKB theo tuần");
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(tkbData);
  const [currentLichGdData, setCurrentLichGdData] = useState(lichGdData);

  useEffect(() => {
    setCurrentData(tkbData);
    setCurrentLichGdData(lichGdData);
  }, [tkbData, lichGdData]);

  const handleCreate = async (newData) => {
    try {
      setLoading(true);
      const response = await tkbService.createTkb(newData);
      message.success('Thêm thời khóa biểu thành công');
      // Refresh data after creation
      const updatedData = [...currentData, response];
      setCurrentData(updatedData);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      setLoading(true);
      const response = await tkbService.updateTkb(id, updatedData);
      message.success('Cập nhật thời khóa biểu thành công');
      // Update local data
      const updatedList = currentData.map(item => 
        item.id === id ? response : item
      );
      setCurrentData(updatedList);
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
      // Remove from local data
      const updatedList = currentData.filter(item => item.id !== id);
      setCurrentData(updatedList);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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

      {loading && (
        <div className="text-center py-4">
          <span className="text-gray-600">Đang xử lý...</span>
        </div>
      )}

      {/* Table display */}
      {selectedScheduleType === "TKB Toàn Trường" ? (
        <TkbByList
          tkbLists={[currentData, currentLichGdData]} 
          dataType={selectedDataKey}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ) : (
        <TkbByTabel
          tkbList={selectedDataKey === 'tkbData' ? currentData : []} 
          lichGdList={selectedDataKey === 'lichGdData' ? currentLichGdData : []}
        />
      )}
    </div>
  );
};