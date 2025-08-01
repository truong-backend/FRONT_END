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
      <div>
        <div >
          <div >
            <p >Đang tải lịch học...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <div>
            <p>Có lỗi xảy ra</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div >
      <div >
        <h2 >
          Lịch Học Hôm Nay ({thuHomNay} - {todayStr})
        </h2>

        {danhSachHomNay.length > 0 ? (
          <ul >
            {danhSachHomNay.map((mon, i) => (
              <li key={i}>
                <span >{mon.tenMonHoc}</span>
                {mon.tenGiaoVien && (
                  <span > - GV: {mon.tenGiaoVien}</span>
                )}
                <span> - Tiết {mon.tietBatDau} đến {mon.tietKetThuc}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p >Hôm nay không có lịch học.</p>
        )}
      </div>
    </div>
  );
};
