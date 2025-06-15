import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Upload, Avatar, Tabs, Space } from 'antd';
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const ProfileComponents = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { user, updateUserInfo } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      form.setFieldsValue({
        username: data.username,
        email: data.email,
        fullName: data.fullName
      });
    } catch (error) {
      message.error('Lỗi khi tải thông tin cá nhân');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      await profileService.updateProfile(values);
      message.success('Cập nhật thông tin thành công');
      // Update auth context if needed
      if (updateUserInfo) {
        updateUserInfo({
          ...user,
          email: values.email,
          fullName: values.fullName
        });
      }
      fetchProfile();
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      await profileService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Lỗi khi đổi mật khẩu');
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: 'Thông tin cá nhân',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={profile}
        >
          <Form.Item
            label="Avatar"
            name="avatar"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <Avatar
                size={100}
                src={profile?.avatar}
                icon={<UserOutlined />}
              />
              <Upload
                name="avatar"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Thay đổi avatar</Button>
              </Upload>
            </Space>
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email không được để trống' },
              { type: 'email', message: 'Email không hợp lệ' },
              { max: 50, message: 'Email không được vượt quá 50 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: 'Họ và tên không được để trống' },
              { max: 150, message: 'Họ và tên không được vượt quá 150 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: '2',
      label: 'Đổi mật khẩu',
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Mật khẩu xác nhận không khớp');
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card title="Thông tin cá nhân" className="shadow-md">
        <Tabs items={items} />
      </Card>
    </div>
  );
};

export default ProfileComponents;