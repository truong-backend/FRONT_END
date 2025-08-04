

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
    <div>
      <h2>
        🎓 Kết quả điểm danh của sinh viên
      </h2>
      <div>
        <div>
          <div>
            <h3>
              📘 Danh sách môn học
            </h3>

            {loading && !selectedMaMh ? (
              <div>
                <div ></div>
              </div>
            ) : (
              <div>
                {monHocs.map((mh) => (
                  <div
                    key={`${mh.maMh}-${mh.nmh}`}
                    onClick={() => handleSelectMonHoc(mh.maMh, mh.tenMh, mh.nmh)}
                    className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${mh.maMh === selectedMaMh
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    <div>
                      {mh.tenMh}
                    </div>
                    <div>
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
        <div>
          <div>
            {selectedMaMh ? (
              <>
                <h3 >
                  📅 Điểm danh môn:
                  <span >{selectedTenMh}</span>
                </h3>
                <div >
                  <strong>🔎 Chú thích cột điểm danh:</strong><br />
                  <b>Số lần sinh viên đã điểm danh</b> / <b>Tổng số lần điểm danh trong buổi học.</b><br />
                  Nếu số lần sinh viên điểm danh &lt; tổng số lần điểm danh trong buổi học sẽ được xem là <span className="text-red-500 font-semibold">vắng</span>.
                </div>
                {loading ? (
                  <div >
                    <div ></div>
                  </div>
                ) : (
                  <div >
                    <table >
                      <thead>
                        <tr >
                          <th >
                            Buổi học
                          </th> 
                          <th >
                            Ngày học
                          </th>
                          <th >
                            Tiết học
                          </th>
                          <th >
                            Điểm danh
                          </th>
                          <th >
                            Trạng thái
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {dsDiemDanh.length > 0 ? (
                          dsDiemDanh.map((dd, index) => (
                            <tr key={dd.maDd} >
                              <td >{index + 1}</td>
                              <td >
                                {formatDate(dd.ngayHoc)}
                              </td>
                               <td >
                                  {dd.stBd} - {dd.stKt}
                              </td>
                              <td >
                                {dd.svSolanDD}/{dd.gvSoLanDD} Lần
                              </td>     
                              <td >
                                {dd.trangThai || "—"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" >
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
              <div >
                <div >📚</div>
                <p >Chọn một môn học để xem thông tin điểm danh</p>
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


