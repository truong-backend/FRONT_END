import axios from './api';

export const LichGdService = {
  // Get all teaching schedules with pagination and filters
  getAllLichGd: async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc', maGv, maMh, hocKy) => {
    let url = `/api/lichgd?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (maGv) url += `&maGv=${maGv}`;
    if (maMh) url += `&maMh=${maMh}`;
    if (hocKy) url += `&hocKy=${hocKy}`;
    
    const response = await axios.get(url);
    return response.data;
  },

  // Get a single teaching schedule by ID
  getLichGdById: async (id) => {
    const response = await axios.get(`/api/lichgd/${id}`);
    return response.data;
  },

  // Create a new teaching schedule
  createLichGd: async (lichGdData) => {
    const response = await axios.post('/api/lichgd', lichGdData);
    return response.data;
  },

  // Update an existing teaching schedule
  updateLichGd: async (id, lichGdData) => {
    const response = await axios.put(`/api/lichgd/${id}`, lichGdData);
    return response.data;
  },

  // Delete a teaching schedule
  deleteLichGd: async (id) => {
    const response = await axios.delete(`/api/lichgd/${id}`);
    return response.data;
  }
};