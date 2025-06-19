import React, { useEffect, useState } from "react";
import {
  getMonHocBySinhVien,
  getDiemDanhByMonHoc
} from "../../../services/PhanSinhVien/DanhSachDiemDanh/diemdanhSVService";
import { useAuth } from '../../../contexts/AuthContext';

export const DanhSachDiemDiemSVComponents = () => {
  const { user, isAuthenticated } = useAuth();
  const [monHocs, setMonHocs] = useState([]);
  const [selectedMaMh, setSelectedMaMh] = useState(null);
  const [selectedTenMh, setSelectedTenMh] = useState("");
  const [dsDiemDanh, setDsDiemDanh] = useState([]);
  const [loading, setLoading] = useState(false);

  const maSv = user?.maSv || user?.id || user?.username;

  useEffect(() => {
    setLoading(true);
    getMonHocBySinhVien(maSv)
      .then(setMonHocs)
      .catch(error => console.error("Lỗi khi tải môn học:", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedMaMh) {
      setLoading(true);
      getDiemDanhByMonHoc("DH52108640", selectedMaMh)
        .then(setDsDiemDanh)
        .catch(error => console.error("Lỗi khi tải điểm danh:", error))
        .finally(() => setLoading(false));
    }
  }, [selectedMaMh]);

  const handleSelectMonHoc = (maMh, tenMh) => {
    setSelectedMaMh(maMh);
    setSelectedTenMh(tenMh);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        🎓 Kết quả điểm danh của sinh viên
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái - Danh sách môn học */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              📘 Danh sách môn học
            </h3>
            
            {loading && !selectedMaMh ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {monHocs.map((mh) => (
                  <div
                    key={mh.maMh}
                    onClick={() => handleSelectMonHoc(mh.maMh, mh.tenMh)}
                    className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      mh.maMh === selectedMaMh
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-semibold text-gray-800 mb-2">
                      {mh.tenMh}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Mã MH: {mh.maMh}</div>
                      <div>Phòng: {mh.phongHoc}</div>
                      <div>Học kỳ: {mh.hocKy}</div>
                      <div>Số tiết: {mh.soTiet}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cột phải - Danh sách điểm danh */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedMaMh ? (
              <>
                <h3 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                  📅 Điểm danh môn: 
                  <span className="text-blue-600 ml-2">{selectedTenMh}</span>
                </h3>
                
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                            Ngày học
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                            Điểm danh 1
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                            Điểm danh 2
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                            Ghi chú
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dsDiemDanh.length > 0 ? (
                          dsDiemDanh.map((dd) => (
                            <tr key={dd.maDd} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 border-b border-gray-100">
                                {formatDate(dd.ngayHoc)}
                              </td>
                              <td className="px-4 py-3 text-center border-b border-gray-100">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  dd.diemDanh1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {formatTime(dd.diemDanh2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border-b border-gray-100">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  dd.diemDanh2 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {formatTime(dd.diemDanh2)}
                                </span>
                              </td>
                              <td className="px-4 py-3 border-b border-gray-100">
                                {dd.ghiChu || "—"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                              Chưa có dữ liệu điểm danh cho môn học này
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg">Chọn một môn học để xem thông tin điểm danh</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Định dạng ngày
const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric"
  });
};

// Định dạng giờ phút
const formatTime = (dateTime) => {
  if (!dateTime) return "—";
  const d = new Date(dateTime);
  return d.toLocaleTimeString("vi-VN", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: false
  });
};