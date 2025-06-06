import React, { useState, useEffect } from 'react';  
import { TkbList } from '../../../components/PhanAdmin/tkb/TkbList.jsx';
import { DashboardLayout } from '../../../components/layout/DashboardLayout.jsx';
import { tkbService } from '../../../services/PhanAdmin/tkbService.js';
import { message } from 'antd';

export const TkbPage = () => {
  const [tkbData, setTkbData] = useState([]);
  const [lichGdData, setLichGdData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch TKB data
        const tkbResponse = await tkbService.getAllTkb(
          0, // page
          100, // size
          'ngayHoc', // sortBy
          'asc' // sortDir
        );
        setTkbData(tkbResponse.content || []);

        // Fetch Lich GD data (assuming it's from the same endpoint with different dates)
        const today = new Date();
        const threeMonthsLater = new Date(today.setMonth(today.getMonth() + 3));
        
        const lichGdResponse = await tkbService.getAllTkb(
          0, // page
          100, // size
          'ngayHoc', // sortBy
          'asc', // sortDir
          null, // maGd
          null, // ngayHoc
          today.toISOString().split('T')[0], // startDate
          threeMonthsLater.toISOString().split('T')[0] // endDate
        );
        setLichGdData(lichGdResponse.content || []);
      } catch (error) {
        message.error(error.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thời Khóa Biểu</h1>
          <div className="flex gap-2 text-sm">
            <span className="inline-block w-4 h-4 bg-green-50 border rounded"></span>
            <span className="text-gray-600 mr-4">Thời khóa biểu</span>
            <span className="inline-block w-4 h-4 bg-blue-50 border rounded"></span>
            <span className="text-gray-600">Lịch giảng dạy</span>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <span className="text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <TkbList
            tkbData={tkbData} 
            lichGdData={lichGdData} 
          />
        )}
      </div>
    </DashboardLayout>
  );
};