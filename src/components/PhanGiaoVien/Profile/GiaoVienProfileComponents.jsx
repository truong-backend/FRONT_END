import React, { useEffect, useState } from 'react';
import { User, Edit3, Mail, Phone, MapPin, Calendar, CreditCard, Rss } from 'lucide-react';
import { GiaoVienService } from '../../../services/PhanGiaoVien/Profile/GiaoVienService.js';

export const GiaoVienProfileComponents = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [teacherData, setTeacherData] = useState({
    maGv: '',
    tenGv: '',
    ngaySinh: '',
    phai: '',
    diaChi: '',
    sdt: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const [originalTeacherData, setOriginalTeacherData] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await GiaoVienService.getGiaoVienProfile();
      console.log('res', res);
      console.log('res data', res.data);

      if (res && res.maGv) {
        setTeacherData(res);
        setOriginalTeacherData(res);
      }
      else {
        console.warn("Dữ liệu trả về không hợp lệ:", res);
      }
    } catch (error) {
      console.log('Lỗi lấy thông tin giáo viên', error);
      return null;
    }
  }

  const handleSave = async () => {
    try {
      const res = await GiaoVienService.updateGiaoVienProfile(teacherData);
      console.log('res', res);

      const data = res?.data ?? res;

      console.log('Cập nhật thành công', data);

      setIsEditing(false);
      setOriginalTeacherData(teacherData);
    } catch (error) {
      console.log('Lỗi khi cập nhật thông tin giáo viên', error);
    }
  };
  const handleCancel = () => {
    setOriginalTeacherData(teacherData);
    setIsEditing(false);
  }
  const handleInputChange = (field, value) => {
    setTeacherData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTeacherData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Thông tin Giáo viên</h1>
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit3 size={16} />
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 size={16} />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                    {teacherData && teacherData.avatar ? (
                      <img
                        src={teacherData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={64} className="text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Edit3 size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

              </div>
            </div>

            {/* Information Section */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã giáo viên */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CreditCard size={16} />
                    Mã giáo viên
                  </label>

                  <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {teacherData.maGv}
                  </p>

                </div>

                {/* Họ và tên */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User size={16} />
                    Họ và tên
                  </label>

                  <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {teacherData.tenGv}
                  </p>

                </div>

                {/* Ngày sinh */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar size={16} />
                    Ngày sinh
                  </label>

                  <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {new Date(teacherData.ngaySinh).toLocaleDateString('vi-VN')}
                  </p>

                </div>

                {/* Giới tính */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Giới tính
                  </label>

                  <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {teacherData.phai === 1 ? "Nam" : "Nữ"}
                  </p>

                </div>

                {/* Số điện thoại */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone size={16} />
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={teacherData.sdt}
                      onChange={(e) => handleInputChange('sdt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {teacherData.sdt}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail size={16} />
                    Email
                  </label>

                  <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {teacherData.email}
                  </p>

                </div>

                {/* Địa chỉ */}
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin size={16} />
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <textarea
                      value={teacherData.diaChi}
                      onChange={(e) => handleInputChange('diaChi', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {teacherData.diaChi}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};