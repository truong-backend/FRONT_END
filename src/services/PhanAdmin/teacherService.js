import api from '../api.js';

export const teacherService = {
    // Get teachers with pagination, sorting, and search
    getTeachersProfile: async (page = 0, size = 10, sortBy = 'maGv', sortDir = 'asc', search = '') => {
        const params = {
            page,
            size,
            sort: `${sortBy},${sortDir}`,
            ...(search && { search })
        };
        const response = await api.get('/giao-vien', { params });
        return response.data;
    },

    getListGiaoVien: async () => {
        const response = await api.get(`/giao-vien/all`);
        return response.data;
    },
    // Get teacher by ID
    getTeacher: async (maGv) => {
        const response = await api.get(`/giao-vien/${maGv}`);
        return response.data;
    },

    // Create new teacher
    createTeacher: async (teacherData) => {
        const formData = new FormData();
        
        // Append all fields except avatar
        Object.keys(teacherData).forEach(key => {
            if (key !== 'avatar') {
                formData.append(key, teacherData[key]);
            }
        });

        // Append avatar if exists
        if (teacherData.avatar?.[0]?.originFileObj) {
            formData.append('avatar', teacherData.avatar[0].originFileObj);
        }

        const response = await api.post('/giao-vien', formData);
        return response.data;
    },

    // Update teacher
    updateTeacher: async (maGv, teacherData) => {
        console.log('Service updating teacher:', maGv, teacherData); // For debugging
        const formData = new FormData();
        
        // Append all fields except avatar
        Object.keys(teacherData).forEach(key => {
            if (key !== 'avatar') {
                formData.append(key, teacherData[key]);
            }
        });

        // Append avatar if exists
        if (teacherData.avatar?.[0]?.originFileObj) {
            formData.append('avatar', teacherData.avatar[0].originFileObj);
        }

        try {
            const response = await api.put(`/giao-vien/${maGv}`, formData);
            return response.data;
        } catch (error) {
            console.error('Error in updateTeacher:', error); // For debugging
            throw error;
        }
    },

    // Delete teacher
    deleteTeacher: async (maGv) => {
        await api.delete(`/giao-vien/${maGv}`);
    }
}; 