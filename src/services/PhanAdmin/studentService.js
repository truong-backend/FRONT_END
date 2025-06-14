import api from '../api.js';

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
    },

    // Import students from Excel/CSV
    importStudents: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await api.post('/admin/importExcel-SinhVien', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // Kiểm tra và trả về response.data
            if (response.data) {
                return response.data;
            }
            return 'Import thành công. Tài khoản sinh viên đã được tạo tự động với mật khẩu là mã sinh viên.';
        } catch (error) {
            console.error('Error importing students:', error);
            if (error.response?.data) {
                throw new Error(error.response.data);
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error('Lỗi không xác định khi import sinh viên');
            }
        }
    },

    // Get all students without pagination
    getAllStudentsNoPagination: async () => {
        try {
            const response = await api.get('/sinh-vien/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching all students:', error);
            throw new Error('Không thể lấy danh sách sinh viên: ' + (error.response?.data || error.message || 'Không xác định'));
        }
    },

    // Get template file for import
    getImportTemplate: async () => {
        try {
            const response = await api.get('/admin/template-SinhVien', {
                responseType: 'blob'
            });
            
            if (!response.data) {
                throw new Error('Không thể tải file mẫu');
            }

            const fileName = 'mau-import-sinh-vien.xlsx';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error downloading template:', error);
            throw new Error('Lỗi khi tải file mẫu: ' + (error.response?.data || error.message || 'Không xác định'));
        }
    },

    // Export students to Excel
    exportStudents: async () => {
        try {
            const response = await api.get('/admin/export-sinhvien', {
                responseType: 'blob'
            });
            
            // Create file name with current date
            const date = new Date().toISOString().split('T')[0];
            const fileName = `danh-sach-sinh-vien-${date}.xlsx`;
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error exporting students:', error);
            throw new Error('Lỗi khi xuất danh sách sinh viên: ' + (error.response?.data || error.message || 'Không xác định'));
        }
    }
    
}; 