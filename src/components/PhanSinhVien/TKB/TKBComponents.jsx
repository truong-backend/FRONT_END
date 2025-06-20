import React, { useState } from "react";

// =================== DỮ LIỆU MẪU ===================
const sampleTKB = {
  "Học kỳ 3 - Năm học 2024-2025": {
    "Tuần 43": {
      "Thứ 2": [
        {
          maMH: "CS03036",
          tenMon: "Toán cao cấp",
          nmh: "3",
          stc: "3.0",
          maLop: "x",
          stchp: "x",
          kdk: "Năm",
          th: "1",
          thu: "Thứ 2",
          tietBd: 1,
          tietKt: 3,
          st: "5",
          phong: "A101",
          cbgd: "TVHưng",
          tuan: "23/06/2025 - 29/06/2025",
          ngay: "2025-06-23"
        }
      ],
      "Thứ 3": [
        {
          maMH: "CS03036",
          tenMon: "Lập trình Web",
          nmh: "3",
          stc: "3.0",
          maLop: "x",
          stchp: "x",
          kdk: "Năm",
          th: "1",
          thu: "Thứ 3",
          tietBd: 2,
          tietKt: 5,
          st: "5",
          phong: "B202",
          cbgd: "TVHưng",
          tuan: "23/06/2025 - 29/06/2025",
          ngay: "2025-06-24"
        }
      ],
      "Thứ 5": [
        {
          maMH: "CS03036",
          tenMon: "CSDL",
          nmh: "3",
          stc: "3.0",
          maLop: "x",
          stchp: "x",
          kdk: "Năm",
          th: "1",
          thu: "Thứ 5",
          tietBd: 1,
          tietKt: 3,
          st: "5",
          phong: "C606",
          cbgd: "TVHưng",
          tuan: "23/06/2025 - 29/06/2025",
          ngay: "2025-06-26"
        }
      ]
    }
  }
};

// =================== CONSTANTS ===================
const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const tietMax = 15;

// =================== COMPONENT: THỜI KHÓA BIỂU CÁ NHÂN ===================
const TKBCaNhan = ({ data }) => {
  // Lấy tất cả môn học từ tất cả các ngày
  const allSubjects = Object.keys(data).reduce((acc, day) => {
    return [...acc, ...data[day]];
  }, []);

  return (
    <div className="space-y-4">
      {/* Tiêu đề */}
      <h2 className="text-xl font-bold text-blue-600 mb-2 text-center">
        Thời Khóa Biểu Cá Nhân
      </h2>
      
      {/* Nội dung bảng */}
      {allSubjects.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-400 w-full text-sm">
            {/* Header bảng */}
            <thead>
              <tr className="bg-blue-100 text-center">
                <th className="border border-gray-400 px-2 py-1">Mã MH</th>
                <th className="border border-gray-400 px-2 py-1">Tên MH</th>
                <th className="border border-gray-400 px-2 py-1">NMH</th>
                <th className="border border-gray-400 px-2 py-1">STC</th>
                <th className="border border-gray-400 px-2 py-1">Mã lớp</th>
                <th className="border border-gray-400 px-2 py-1">STCHP</th>
                <th className="border border-gray-400 px-2 py-1">KDK</th>
                <th className="border border-gray-400 px-2 py-1">TH</th>
                <th className="border border-gray-400 px-2 py-1">Tiết BD</th>
                <th className="border border-gray-400 px-2 py-1">ST</th>
                <th className="border border-gray-400 px-2 py-1">Phòng</th>
                <th className="border border-gray-400 px-2 py-1">CBGD</th>
                <th className="border border-gray-400 px-2 py-1">Tuần</th>
              </tr>
            </thead>
            
            {/* Body bảng */}
            <tbody>
              {allSubjects.map((mon, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 px-2 py-1">{mon.maMH}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.tenMon}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.nmh || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.stc || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.maLop || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.stchp || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.kdk || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.th || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.tietBd}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.st || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.phong}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.cbgd || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{mon.tuan || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-red-600">Không có dữ liệu thời khóa biểu.</p>
      )}
    </div>
  );
};

// =================== COMPONENT: THỜI KHÓA BIỂU THEO TUẦN ===================
const TKBTheoTuan = ({ data, selectedTuan }) => {
  // States cho modal chi tiết
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Hàm tìm môn học theo ngày và tiết
  const getMonHoc = (day, tiet) => {
    const list = data[day] || [];
    for (let mon of list) {
      if (tiet >= mon.tietBd && tiet <= mon.tietKt) {
        return mon;
      }
    }
    return null;
  };

  // Xử lý click vào môn học
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setShowDetails(true);
  };

  return (
    <div className="p-4 overflow-x-auto">
      {/* Controls - Chọn học kỳ và tuần */}
      <div className="mb-4 space-x-4">
        <label className="text-sm font-medium text-gray-700">Học kỳ </label>
        <select className="border border-gray-300 px-3 py-1 rounded">
          <option value="HK1">Học kỳ 1 năm 2022-2023</option>
          <option value="HK2">Học kỳ 2 năm 2022-2023</option>
          <option value="HK3">Học kỳ 3 năm 2022-2023</option>
        </select>

        <label className="text-sm font-medium text-gray-700 colors red"> Tuần  </label>
        <select className="border border-gray-300 px-3 py-1 rounded">
          <option value="Tuần 1">Tuần 1 [Từ 23/06/2025 -- Đến 29/06/2025]</option>
          <option value="Tuần 2">Tuần 2 [Từ 23/06/2025 -- Đến 29/06/2025]</option>
          <option value="Tuần 3">Tuần 3 [Từ 23/06/2025 -- Đến 29/06/2025]</option>
          <option value="Tuần ...">...</option>
        </select>
      </div>

      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Thời Khóa Biểu Tuần: {selectedTuan}
      </h1>

      {/* Bảng thời khóa biểu chính */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="table-auto border-collapse w-full text-sm">
          {/* Header bảng */}
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center">
              <th className="border border-blue-400 px-3 py-2 font-semibold">Tiết</th>
              {days.map((day) => (
                <th key={day} className="border border-blue-400 px-3 py-2 font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body bảng */}
          <tbody>
            {Array.from({ length: tietMax }, (_, i) => i + 1).map((tiet) => (
              <tr key={tiet} className="text-center hover:bg-gray-50">
                {/* Cột tiết học */}
                <td className="border border-gray-300 font-semibold px-3 py-2 bg-gray-100">
                  <div className="text-blue-700">Tiết {tiet}</div>
                  <div className="text-xs text-gray-500">
                    {tiet <= 5 ? 'Sáng' : tiet <= 10 ? 'Chiều' : 'Tối'}
                  </div>
                </td>
                
                {/* Các cột ngày trong tuần */}
                {days.map((day) => {
                  const mon = getMonHoc(day, tiet);
                  
                  // Nếu có môn học và là tiết bắt đầu
                  if (mon && mon.tietBd === tiet) {
                    const rowSpan = mon.tietKt - mon.tietBd + 1;
                    return (
                      <td
                        key={day + tiet}
                        rowSpan={rowSpan}
                        className="border border-gray-300 bg-gradient-to-br from-green-50 to-green-100 text-left px-3 py-2 align-top cursor-pointer hover:from-green-100 hover:to-green-200 transition-colors"
                        onClick={() => handleSubjectClick(mon)}
                      >
                        <div className="font-bold text-blue-700 text-sm mb-1">{mon.tenMon}</div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <span className="font-medium">📍</span>
                            <span className="ml-1">{mon.phong}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">👨‍🏫</span>
                            <span className="ml-1">{mon.cbgd}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">🎯</span>
                            <span className="ml-1">{mon.stc} TC</span>
                          </div>
                        </div>
                      </td>
                    );
                  } 
                  // Nếu đang trong khoảng tiết của môn học
                  else if (mon && mon.tietBd < tiet && tiet <= mon.tietKt) {
                    return null;
                  } 
                  // Ô trống
                  else {
                    return (
                      <td key={day + tiet} className="border border-gray-300 px-3 py-2 bg-gray-50"></td>
                    );
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết môn học */}
      {showDetails && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {/* Header modal */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-blue-700">Chi tiết môn học</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            {/* Nội dung modal */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Mã môn học:</span>
                  <div className="font-semibold text-blue-700">{selectedSubject.maMH}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Số tín chỉ:</span>
                  <div className="font-semibold text-green-700">{selectedSubject.stc}</div>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Tên môn học:</span>
                <div className="font-semibold text-gray-800">{selectedSubject.tenMon}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Thứ:</span>
                  <div className="font-semibold">{selectedSubject.thu}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Tiết:</span>
                  <div className="font-semibold">{selectedSubject.tietBd} - {selectedSubject.tietKt}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Phòng học:</span>
                  <div className="font-semibold text-orange-700">{selectedSubject.phong}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Giảng viên:</span>
                  <div className="font-semibold text-purple-700">{selectedSubject.cbgd}</div>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Tuần học:</span>
                <div className="font-semibold text-gray-700">{selectedSubject.tuan}</div>
              </div>
            </div>
            
            {/* Footer modal */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowDetails(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chú thích */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Chú thích:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• Nhấp vào ô môn học để xem chi tiết</div>
          <div>• Màu xanh: Có lịch học</div>
          <div>• Sáng: Tiết 1-5, Chiều: Tiết 6-10, Tối: Tiết 11-15</div>
          <div>• TC: Tín chỉ</div>
        </div>
      </div>

      {/* Nút điều hướng tuần */}
      <div className="flex space-x-4 justify-center mt-4">
        <div
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded select-none"
          onClick={() => alert("Đi tới tuần đầu")}
        >
          Tuần đầu
        </div>
        <div
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded select-none"
          onClick={() => alert("Tuần trước")}
        >
          Tuần trước
        </div>
        <div
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded select-none"
          onClick={() => alert("Tuần sau")}
        >
          Tuần sau
        </div>
        <div
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded select-none"
          onClick={() => alert("Tuần cuối")}
        >
          Tuần cuối
        </div>
      </div>
    </div>
  );
};

// =================== COMPONENT CHÍNH ===================
export const TKBComponents = () => {
  // States chính
  const [selectedView, setSelectedView] = useState("theoTuan");
  const [selectedHk, setSelectedHk] = useState("Học kỳ 3 - Năm học 2024-2025");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  // Logic xử lý dữ liệu
  const weeks = Object.keys(sampleTKB[selectedHk] || []);
  const selectedTuan = weeks[selectedWeekIndex];
  const tkbData = sampleTKB[selectedHk]?.[selectedTuan] || {};

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Control chọn chế độ hiển thị */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <label className="text-sm font-medium text-gray-700">Chọn chế độ hiển thị:</label>
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
          className="border border-gray-300 px-3 py-1 rounded"
        >
          <option value="theoTuan">Thời khóa biểu theo tuần</option>
          <option value="caNhan">Thời khóa biểu cá nhân</option>
        </select>
      </div>

      {/* Render component tương ứng */}
      {selectedView === "theoTuan" ? (
        <TKBTheoTuan data={tkbData} selectedTuan={selectedTuan} />
      ) : (
        <TKBCaNhan data={tkbData} />
      )}
    </div>
  );
};