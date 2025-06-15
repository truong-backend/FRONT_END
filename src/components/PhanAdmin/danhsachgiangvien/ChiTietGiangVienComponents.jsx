import React from 'react';
import { Modal, Descriptions, Avatar, Card, Row, Col, Tag, Divider } from 'antd';
import { UserOutlined, IdcardOutlined, HomeOutlined, PhoneOutlined, MailOutlined, TeamOutlined, BankOutlined, KeyOutlined } from '@ant-design/icons';
import moment from 'moment';

export const ChiTietGiangVienComponents = ({ visible, onClose, lecturer }) => {
  if (!lecturer) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      title={
        <div className="flex items-center">
          <IdcardOutlined className="mr-2" />
          <span>Chi tiết giảng viên</span>
        </div>
      }
    >
      <div className="p-4">
        {/* Header với avatar và thông tin cơ bản */}
        <div className="flex items-center mb-6">
          <Avatar
            size={100}
            src={lecturer.avatar}
            icon={<UserOutlined />}
            className="mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold mb-2">{lecturer.tenGv}</h2>
            <Tag color="blue">Mã GV: {lecturer.maGv}</Tag>
            {lecturer.hasAccount && <Tag color="green" className="ml-2">Đã có tài khoản</Tag>}
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Thông tin cá nhân */}
          <Col span={24}>
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
                <Descriptions.Item label="Họ và tên">{lecturer.tenGv}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {moment(lecturer.ngaySinh).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {lecturer.phai === 1 ? 'Nam' : 'Nữ'}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2" />
                    {lecturer.sdt}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>
                  <div className="flex items-center">
                    <MailOutlined className="mr-2" />
                    {lecturer.email}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  <div className="flex items-center">
                    <HomeOutlined className="mr-2" />
                    {lecturer.diaChi}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin công tác */}
          <Col span={24}>
            <Card 
              title={
                <div className="flex items-center">
                  <BankOutlined className="mr-2" />
                  <span>Thông tin công tác</span>
                </div>
              }
              className="mb-4"
            >
              <Descriptions column={2}>
                <Descriptions.Item label="Mã giảng viên">
                  <Tag color="blue">{lecturer.maGv}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Chức vụ">
                  <div className="flex items-center">
                    <TeamOutlined className="mr-2" />
                    {lecturer.chucVu}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Khoa" span={2}>
                  {lecturer.tenKhoa}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Thông tin tài khoản */}
          {lecturer.hasAccount && (
            <Col span={24}>
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
                    {lecturer.maGv}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email đăng nhập">
                    {lecturer.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color="green">Đã kích hoạt</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </Modal>
  );
}; 