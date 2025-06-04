import api from './api';

export const studentService = {
    // Get students with pagination, sorting, and search
    getStudents: async (page = 0, size = 10, sortBy = 'maSv', sortDir = 'asc', search = '') => {
        const params = {
            page,
            size,
            sort: `${sortBy},${sortDir}`,
            ...(search && { search })
        };
        const response = await api.get('/sinh-vien', { params });
        return response.data;
    },

    // Get student by ID
    getStudent: async (maSv) => {
        const response = await api.get(`/sinh-vien/${maSv}`);
        return response.data;
    },

    // Create new student
    createStudent: async (studentData) => {
        const formData = new FormData();
        
        // Append all fields except avatar
        Object.keys(studentData).forEach(key => {
            if (key !== 'avatar') {
                formData.append(key, studentData[key]);
            }
        });

        // Append avatar if exists
        if (studentData.avatar?.[0]?.originFileObj) {
            formData.append('avatar', studentData.avatar[0].originFileObj);
        }

        const response = await api.post('/sinh-vien', formData);
        return response.data;
    },

    // Update student
    updateStudent: async (maSv, studentData) => {
        console.log('Service updating student:', maSv, studentData);
        const formData = new FormData();
        
        // Append all fields except avatar
        Object.keys(studentData).forEach(key => {
            if (key !== 'avatar') {
                formData.append(key, studentData[key]);
            }
        });

        // Append avatar if exists
        if (studentData.avatar?.[0]?.originFileObj) {
            formData.append('avatar', studentData.avatar[0].originFileObj);
        }

        try {
            const response = await api.put(`/sinh-vien/${maSv}`, formData);
            return response.data;
        } catch (error) {
            console.error('Error in updateStudent:', error);
            throw error;
        }
    },

    // Delete student
    deleteStudent: async (maSv) => {
        await api.delete(`/sinh-vien/${maSv}`);
    }
}; 