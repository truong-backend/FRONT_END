import React, { useEffect, useState } from 'react';
import { User, Edit3, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import { message, Spin, Alert } from 'antd';
import { GiaoVienService } from '../../../services/GiaoVien/HoSo/GiaoVienService.js';

// ====================== Configuration ======================
const FIELD_LABELS = {
  maGv: 'Mã giáo viên',
  tenGv: 'Họ và tên',
  ngaySinh: 'Ngày sinh',
  phai: 'Giới tính',
  sdt: 'Số điện thoại',
  email: 'Email',
  diaChi: 'Địa chỉ'
};

// ====================== Utility Functions ======================
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

// ====================== Sub Components ======================
const Header = ({ isEditing, onEdit, onSave, onCancel }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Thông tin Giáo viên</h1>
      {isEditing ? (
        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Edit3 size={16} /> Lưu
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit3 size={16} /> Chỉnh sửa
        </button>
      )}
    </div>
  </div>
);

const ErrorAlert = ({ error }) =>
  error ? (
    <Alert
      message="Lỗi"
      description={error}
      type="error"
      showIcon
      style={{ marginBottom: '16px' }}
    />
  ) : null;

const ProfileField = ({ label, icon: Icon, value, isEditing, onChange, type = 'text' }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon size={16} /> {label}
    </label>
    {isEditing ? (
      type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      )
    ) : (
      <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
        {value}
      </p>
    )}
  </div>
);

// ====================== Main Component ======================
export const HoSoGiaoVienComponents = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [teacherData, setTeacherData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await GiaoVienService.getGiaoVienProfile();
      setTeacherData(res);
    } catch (err) {
      setError('Không thể tải hồ sơ giáo viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await GiaoVienService.updateGiaoVienProfile(teacherData);
      message.success('Cập nhật thành công');
      setIsEditing(false);
    } catch (err) {
      message.error('Lỗi khi cập nhật thông tin');
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTeacherData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Header
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <ErrorAlert error={error} />

        <Spin spinning={loading}>
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField
                label={FIELD_LABELS.maGv}
                icon={CreditCard}
                value={teacherData.maGv}
                isEditing={false}
              />
              <ProfileField
                label={FIELD_LABELS.tenGv}
                icon={User}
                value={teacherData.tenGv}
                isEditing={false}
              />
              <ProfileField
                label={FIELD_LABELS.ngaySinh}
                icon={Calendar}
                value={formatDate(teacherData.ngaySinh)}
                isEditing={false}
              />
              <ProfileField
                label={FIELD_LABELS.phai}
                icon={User}
                value={teacherData.phai === 1 ? 'Nam' : 'Nữ'}
                isEditing={false}
              />
              <ProfileField
                label={FIELD_LABELS.sdt}
                icon={Phone}
                value={teacherData.sdt}
                isEditing={isEditing}
                onChange={(val) => handleInputChange('sdt', val)}
              />
              <ProfileField
                label={FIELD_LABELS.email}
                icon={Mail}
                value={teacherData.email}
                isEditing={false}
              />
              <ProfileField
                label={FIELD_LABELS.diaChi}
                icon={MapPin}
                value={teacherData.diaChi}
                isEditing={isEditing}
                onChange={(val) => handleInputChange('diaChi', val)}
                type="textarea"
              />
            </div>
          </div>
        </Spin>
      </div>
    </div>
  );
};
