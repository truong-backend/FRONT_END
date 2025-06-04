import api from './api';

export const userService = {
  // Get users with pagination, sorting, and search
  getUsers: async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc', search = '') => {
    const params = {
      page,
      size,
      sortBy,
      sortDir,
      ...(search && { search })
    };
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get users by role with pagination, sorting, and search
  getUsersByRole: async (role, page = 0, size = 10, sortBy = 'id', sortDir = 'asc', search = '') => {
    const params = {
      page,
      size,
      sortBy,
      sortDir,
      ...(search && { search })
    };
    const response = await api.get(`/users/role/${role}`, { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    await api.delete(`/users/${id}`);
  }
};
