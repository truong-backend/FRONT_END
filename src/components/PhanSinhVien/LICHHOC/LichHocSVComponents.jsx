import React, { useState, useEffect } from "react";
import LichHocSinhVienService from "../../../services/PhanSinhVien/LICHHOC/LichHocSinhVienService";

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
  const [dataLichHoc, setDataLichHoc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayStr = getCurrentDate();

  useEffect(() => {
    const fetchLichHoc = async () => {
      try {
        setLoading(true);
        const lichHocData = await LichHocSinhVienService.getLichHocToanTuan();
        
        // Chuyển đổi dữ liệu từ API thành format phù hợp với component
        const formattedData = lichHocData.map(item => ({
          thu: getTenThu(item.thu),
          danhSachMon: item.danhSachMon.map(mon => ({
            tenMon: mon.tenMonHoc,
            tenGiaoVien: mon.tenGiaoVien,
            ngay: formatDate(mon.ngayHoc),
            tietBd: mon.tietBatDau,
            tietKt: mon.tietKetThuc
          }))
        }));

        setDataLichHoc(formattedData);
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
          Lịch Học Theo Thứ
        </h2>

        {dataLichHoc.map((ngay, idx) => {
          // Lọc theo ngày hiện tại
          const danhSachHomNay = ngay.danhSachMon.filter(
            (mon) => mon.ngay === todayStr
          );

          return (
            <div key={idx} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {ngay.thu}
              </h3>
              {danhSachHomNay.length > 0 ? (
                <ul className="ml-4 mt-2 list-disc text-gray-700">
                  {danhSachHomNay.map((mon, i) => (
                    <li key={i}>
                      <span className="font-medium">{mon.tenMon}</span>
                      {mon.tenGiaoVien && (
                        <span className="text-gray-600"> - GV: {mon.tenGiaoVien}</span>
                      )}
                      <span> - Ngày: {mon.ngay}, Tiết {mon.tietBd} đến {mon.tietKt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ml-4 text-gray-400 italic">Không có lịch học.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};