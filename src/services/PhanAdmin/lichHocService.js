import api from "../api.js";

const LICH_HOC_API = '/lichhoc';

// Service methods for LichHoc API
export const lichHocService = {
  // Create a new LichHoc (register a student for a teaching schedule)
  createLichHoc: (lichHocData) =>
    api.post(LICH_HOC_API, lichHocData).then(res => res.data),

  // Get paginated list of LichHoc with optional filters
  getLichHocList: (params = {}) =>
    api.get(LICH_HOC_API, { params }).then(res => res.data),

  // Get all LichHoc without pagination
  getAllLichHoc: () =>
    api.get(`${LICH_HOC_API}/all`).then(res => res.data),

  // Update a LichHoc (change teaching schedule for a student)
  updateLichHoc: (maSv, maGd, lichHocData) =>
    api.put(`${LICH_HOC_API}/${maSv}/${maGd}`, lichHocData).then(res => res.data),

  // Delete a LichHoc (cancel a student's registration)
  deleteLichHoc: (maSv, maGd) =>
    api.delete(`${LICH_HOC_API}/${maSv}/${maGd}`).then(res => res.data),
};