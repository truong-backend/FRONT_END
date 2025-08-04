import React, { useState, useEffect } from "react";
import LichHocSinhVienService from "../../../services/SinhVien/LICHHOC/LichHocSinhVienService";

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-CA"); // yyyy-mm-dd
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-CA");
};

const getTenThu = (thuNumber) => {
  const danhSachThu = {
    1: "Thứ 2",
    2: "Thứ 3", 
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    7: "Chủ nhật"
  };
  return danhSachThu[thuNumber] || "";
};

export const LichHocSVComponents = () => {
  const [danhSachHomNay, setDanhSachHomNay] = useState([]);
  const [thuHomNay, setThuHomNay] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayStr = getCurrentDate();
  useEffect(() => {
      document.title = 'Lịch Học Hôm Nay';
    }, []);
  useEffect(() => {
    const fetchLichHoc = async () => {
      try {
        setLoading(true);
        const lichHocData = await LichHocSinhVienService.getLichHocToanTuan();
        
        // Tìm thông tin hôm nay
        const homNay = lichHocData.find(item =>
          item.danhSachMon.some(mon => formatDate(mon.ngayHoc) === todayStr)
        );

        if (homNay) {
          const monHomNay = homNay.danhSachMon.filter(
            (mon) => formatDate(mon.ngayHoc) === todayStr
          );

          setThuHomNay(getTenThu(homNay.thu));
          setDanhSachHomNay(monHomNay);
        } else {
          setThuHomNay(getTenThu(new Date().getDay() === 0 ? 7 : new Date().getDay()));
          setDanhSachHomNay([]);
        }
      } catch (err) {
        setError("Không thể tải lịch học. Vui lòng thử lại sau.");
        console.error("Lỗi khi tải lịch học:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLichHoc();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải lịch học...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Có lỗi xảy ra</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
          Lịch Học Hôm Nay ({thuHomNay} - {todayStr})
        </h2>

        {danhSachHomNay.length > 0 ? (
          <ul className="ml-4 mt-2 list-disc text-gray-700">
            {danhSachHomNay.map((mon, i) => (
              <li key={i}>
                <span className="font-medium">{mon.tenMonHoc}</span>
                {mon.tenGiaoVien && (
                  <span className="text-gray-600"> - GV: {mon.tenGiaoVien}</span>
                )}
                <span> - Tiết {mon.tietBatDau} đến {mon.tietKetThuc}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ml-4 text-gray-400 italic">Hôm nay không có lịch học.</p>
        )}
      </div>
    </div>
  );
};
