import React from 'react';
import { Modal, Descriptions, Avatar, Card, Tag } from 'antd';
import { UserOutlined, IdcardOutlined, BankOutlined, KeyOutlined } from '@ant-design/icons';
import moment from 'moment';

export const ChiTietGiangVienComponents = ({ visible, onClose, lecturer }) => {
  if (!lecturer) return null;

  const formatGender = (gender) => gender === 1 ? 'Nam' : 'Nữ';
  const formatDate = (date) => moment(date).format('DD/MM/YYYY');

  const personalInfo = [
    { label: 'Họ và tên', value: lecturer.tenGv },
    { label: 'Ngày sinh', value: formatDate(lecturer.ngaySinh) },
    { label: 'Giới tính', value: formatGender(lecturer.phai) },
    { label: 'Số điện thoại', value: lecturer.sdt },
    { label: 'Email', value: lecturer.email, span: 2 },
    { label: 'Địa chỉ', value: lecturer.diaChi, span: 2 }
  ];

  const workInfo = [
    { label: 'Mã giảng viên', value: <Tag color="blue">{lecturer.maGv}</Tag> },
    // { label: 'Chức vụ', value: lecturer.chucVu },
    // { label: 'Khoa', value: lecturer.tenKhoa, span: 2 }
  ];

  const accountInfo = [
    { label: 'Tên đăng nhập', value: lecturer.maGv },
    { label: 'Email đăng nhập', value: lecturer.email },
    // { label: 'Trạng thái', value: <Tag color="green">Đã kích hoạt</Tag> }
  ];

  const renderDescriptions = (items) => (
    <Descriptions column={2}>
      {items.map((item, index) => (
        <Descriptions.Item 
          key={index} 
          label={item.label} 
          span={item.span || 1}
        >
          {item.value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      title={
        <div className="flex items-center">
          <IdcardOutlined className="mr-2" />
          Chi tiết giảng viên
        </div>
      }
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Avatar
            size={80}
            src={lecturer.avatar}
            icon={<UserOutlined />}
            className="mr-4"
          />
          <div>
            <h2 className="text-xl font-bold mb-2">{lecturer.tenGv}</h2>
            <div>
              <Tag color="blue">Mã GV: {lecturer.maGv}</Tag>
              {lecturer.hasAccount && (
                <Tag color="green" className="ml-2">Đã có tài khoản</Tag>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <Card 
          title={
            <div className="flex items-center">
              <UserOutlined className="mr-2" />
              Thông tin cá nhân
            </div>
          }
          className="mb-4"
        >
          {renderDescriptions(personalInfo)}
        </Card>

        {/* Work Information */}
        <Card 
          title={
            <div className="flex items-center">
              <BankOutlined className="mr-2" />
              Thông tin công tác
            </div>
          }
          className="mb-4"
        >
          {renderDescriptions(workInfo)}
        </Card>

        {/* Account Information */}
        {lecturer.hasAccount && (
          <Card 
            title={
              <div className="flex items-center">
                <KeyOutlined className="mr-2" />
                Thông tin tài khoản
              </div>
            }
          >
            {renderDescriptions(accountInfo)}
          </Card>
        )}
      </div>
    </Modal>
  );
};