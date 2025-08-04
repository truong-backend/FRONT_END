

import React, { useEffect, useState } from "react";
import {
  getMonHocBySinhVien,
  getDiemDanhByMonHoc
} from "../../../services/SinhVien/DanhSachDiemDanh/diemdanhSVService";
import { useAuth } from '../../../contexts/AuthContext';

export const DanhSachDiemDiemSVComponents = () => {
  const { user } = useAuth();
  const [monHocs, setMonHocs] = useState([]);
  const [selectedMaMh, setSelectedMaMh] = useState(null);
  const [selectedTenMh, setSelectedTenMh] = useState("");
  const [selectedNhomMh, setSelectedNhomMh] = useState(null);
  const [dsDiemDanh, setDsDiemDanh] = useState([]);
  const [loading, setLoading] = useState(false);

  const maSv = user?.maSv || user?.id || user?.username;
  useEffect(() => {
      document.title = 'Lịch sử điểm danh';
    }, []);
  useEffect(() => {
    setLoading(true);
    getMonHocBySinhVien(maSv)
      .then(setMonHocs)
      .catch(error => console.error("Lỗi khi tải môn học:", error))
      .finally(() => setLoading(false));
  }, []);

 useEffect(() => {
  if (selectedMaMh && selectedNhomMh !== null) {
    setLoading(true);
    getDiemDanhByMonHoc(selectedMaMh, selectedNhomMh)
      .then((data) => {
        setDsDiemDanh(data);
      })
      .catch(error => {
      })
      .finally(() => setLoading(false));
  } else {
    console.log("selectedMaMh hoặc selectedNhomMh   null", selectedMaMh, selectedNhomMh);
  }
}, [selectedMaMh, selectedNhomMh]);


  const handleSelectMonHoc = (maMh, tenMh,nhm) => {
    setSelectedMaMh(maMh);
    setSelectedTenMh(tenMh);
    setSelectedNhomMh(nhm);
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
                    key={`${mh.maMh}-${mh.nmh}`}
                    onClick={() => handleSelectMonHoc(mh.maMh, mh.tenMh, mh.nmh)}
                    className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${mh.maMh === selectedMaMh
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
                <div className="mb-6 text-sm text-gray-600">
                  <strong>🔎 Chú thích cột điểm danh:</strong><br />
                  <b>Số lần sinh viên đã điểm danh</b> / <b>Tổng số lần điểm danh trong buổi học.</b><br />
                  Nếu số lần sinh viên điểm danh &lt; tổng số lần điểm danh trong buổi học sẽ được xem là <span className="text-red-500 font-semibold">vắng</span>.
                </div>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                            Buổi học
                          </th> 
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                            Ngày học
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                            Tiết học
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                            Điểm danh
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {dsDiemDanh.length > 0 ? (
                          dsDiemDanh.map((dd, index) => (
                            <tr key={dd.maDd} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center border-b border-gray-100">{index + 1}</td>
                              <td className="px-4 py-3 border-b border-gray-100">
                                {formatDate(dd.ngayHoc)}
                              </td>
                               <td className="px-4 py-3 border-b border-gray-100 text-center">
                                  {dd.stBd} - {dd.stKt}
                              </td>
                              <td className="px-4 py-3 text-center border-b border-gray-100">
                                {dd.svSolanDD}/{dd.gvSoLanDD} Lần
                              </td>     
                              <td className="px-4 py-3 border-b border-gray-100">
                                {dd.trangThai || "—"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
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

