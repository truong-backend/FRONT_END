import React from 'react';
import { Modal, Descriptions, Avatar, Card, Row, Col, Tag } from 'antd';
import { 
  UserOutlined, IdcardOutlined, HomeOutlined, PhoneOutlined, 
  MailOutlined, TeamOutlined, BankOutlined, KeyOutlined 
} from '@ant-design/icons';
import moment from 'moment';

export const ChiTietSinhVienComponents = ({ visible, onClose, student }) => {
  if (!student) return null;

  const renderHeader = () => (
    <div className="flex items-center">
      <IdcardOutlined className="mr-2" />
      <span>Chi tiết sinh viên</span>
    </div>
  );

  const renderStudentInfo = () => (
    <div className="flex items-center mb-6">
      <Avatar
        size={100}
        src={student.avatar}
        icon={<UserOutlined />}
        className="mr-6"
      />
      <div>
        <h2 className="text-2xl font-bold mb-2">{student.tenSv}</h2>
        <Tag color="blue">Mã SV: {student.maSv}</Tag>
        {student.hasAccount && (
          <Tag color="green" className="ml-2">Đã có tài khoản</Tag>
        )}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <Card 
      title={
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          <span>Thông tin cá nhân</span>
        </div>
      }
      className="mb-4"
    >
      <Descriptions column={2}>
        <Descriptions.Item label="Họ và tên">{student.tenSv}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {moment(student.ngaySinh).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {student.phai === 1 ? 'Nam' : 'Nữ'}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          <div className="flex items-center">
            <PhoneOutlined className="mr-2" />
            {student.sdt}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Email" span={2}>
          <div className="flex items-center">
            <MailOutlined className="mr-2" />
            {student.email}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ" span={2}>
          <div className="flex items-center">
            <HomeOutlined className="mr-2" />
            {student.diaChi}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderAcademicInfo = () => (
    <Card 
      title={
        <div className="flex items-center">
          <BankOutlined className="mr-2" />
          <span>Thông tin học vụ</span>
        </div>
      }
      className="mb-4"
    >
      <Descriptions column={2}>
        <Descriptions.Item label="Mã sinh viên">
          <Tag color="blue">{student.maSv}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Lớp">
          <div className="flex items-center">
            <TeamOutlined className="mr-2" />
            {student.tenLop}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Khoa" span={2}>
          {student.tenKhoa}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderAccountInfo = () => {
    if (!student.hasAccount) return null;
    
    return (
      <Card 
        title={
          <div className="flex items-center">
            <KeyOutlined className="mr-2" />
            <span>Thông tin tài khoản</span>
          </div>
        }
      >
        <Descriptions column={2}>
          <Descriptions.Item label="Tên đăng nhập">
            {student.maSv}
          </Descriptions.Item>
          <Descriptions.Item label="Email đăng nhập">
            {student.email}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color="green">Đã kích hoạt</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      title={renderHeader()}
    >
      <div className="p-4">
        {renderStudentInfo()}
        
        <Row gutter={[24, 24]}>
          <Col span={24}>
            {renderPersonalInfo()}
          </Col>
          
          <Col span={24}>
            {renderAcademicInfo()}
          </Col>
          
          <Col span={24}>
            {renderAccountInfo()}
          </Col>
        </Row>
      </div>
    </Modal>
  );
};