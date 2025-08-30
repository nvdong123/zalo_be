import React, { useState, useEffect } from 'react';
import {
  Card, Form, Input, Button, Row, Col, Typography, Space, 
  message, Divider, Avatar, Tag, Alert
} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put } from '../../utils/request';

const { Title, Text } = Typography;

interface ProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  tenant_id?: number;
  tenant_name?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface ProfileUpdateRequest {
  email?: string;
  current_password?: string;
  new_password?: string;
}

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch current user profile
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => get<ProfileData>('/api/v1/profile/me'),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileUpdateRequest) => put<ProfileData>('/api/v1/profile/me', data),
    onSuccess: () => {
      message.success('Cập nhật thông tin thành công');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi cập nhật thông tin');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ current_password, new_password, confirm_password }: { 
      current_password: string; 
      new_password: string; 
      confirm_password: string;
    }) =>
      put('/api/v1/profile/change-password', { current_password, new_password, confirm_password }),
    onSuccess: () => {
      message.success('Đổi mật khẩu thành công');
      passwordForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi đổi mật khẩu');
    },
  });

  // Set form values when data loads
  useEffect(() => {
    if (profileData) {
      form.setFieldsValue({
        email: profileData.email,
      });
    }
  }, [profileData, form]);

  const handleUpdateProfile = async (values: any) => {
    await updateProfileMutation.mutateAsync({
      email: values.email,
    });
  };

  const handleChangePassword = async (values: any) => {
    await changePasswordMutation.mutateAsync({
      current_password: values.current_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    });
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Profile Header */}
        <Card style={{ marginBottom: 24 }}>
          <Row align="middle" gutter={24}>
            <Col>
              <Avatar size={80} icon={<UserOutlined />} />
            </Col>
            <Col flex={1}>
              <Title level={2} style={{ margin: 0 }}>
                {profileData?.username}
              </Title>
              <Space style={{ marginTop: 12 }} size="large">
                <Tag color={profileData?.role === 'super_admin' ? 'red' : 'blue'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {profileData?.role === 'super_admin' ? 'Super Admin' : 'Hotel Admin'}
                </Tag>
                <Tag color={profileData?.status === 'active' ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {profileData?.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                </Tag>
              </Space>
              {profileData?.tenant_name && (
                <div style={{ marginTop: 12, fontSize: 16 }}>
                  <Text type="secondary">Khách sạn: <strong>{profileData.tenant_name}</strong></Text>
                </div>
              )}
              {profileData?.role === 'super_admin' && (
                <div style={{ marginTop: 12, fontSize: 16 }}>
                  <Text type="secondary">Quản trị toàn hệ thống</Text>
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* Main Content */}
        <Row gutter={32}>
          {/* Personal Information */}
          <Col xs={24} lg={14}>
            <Card title="Thông tin cá nhân" style={{ marginBottom: 24 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                disabled={updateProfileMutation.isPending}
              >
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Tên đăng nhập">
                      <Input 
                        value={profileData?.username} 
                        disabled 
                        prefix={<UserOutlined />}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="Nhập email" size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Vai trò">
                      <Input 
                        value={profileData?.role === 'super_admin' ? 'Super Admin' : 'Hotel Admin'} 
                        disabled 
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Ngày tạo">
                      <Input 
                        value={profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('vi-VN') : ''} 
                        disabled 
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={updateProfileMutation.isPending}
                    size="large"
                  >
                    Cập nhật thông tin
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Change Password */}
          <Col xs={24} lg={10}>
            <Card title="Đổi mật khẩu" style={{ marginBottom: 24 }}>
              <Alert
                message="Bảo mật tài khoản"
                description="Thường xuyên thay đổi mật khẩu để bảo vệ tài khoản của bạn"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
                disabled={changePasswordMutation.isPending}
              >
                <Form.Item
                  name="current_password"
                  label="Mật khẩu hiện tại"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Nhập mật khẩu hiện tại" 
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="new_password"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Nhập mật khẩu mới" 
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="confirm_password"
                  label="Xác nhận mật khẩu mới"
                  dependencies={['new_password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Xác nhận mật khẩu mới" 
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={changePasswordMutation.isPending}
                    block
                    size="large"
                  >
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Additional Info */}
        {(profileData?.role === 'super_admin' || (profileData?.role === 'hotel_admin' && profileData?.tenant_name)) && (
          <Card 
            title={profileData?.role === 'super_admin' ? 'Thông tin hệ thống' : 'Thông tin khách sạn'}
          >
            {profileData?.role === 'super_admin' ? (
              <>
                <Text type="secondary">
                  Bạn có quyền truy cập toàn bộ hệ thống bao gồm:
                </Text>
                <ul style={{ marginTop: 12, marginBottom: 0 }}>
                  <li>Quản lý tất cả tenants/khách sạn</li>
                  <li>Quản lý admin users</li>
                  <li>Xem báo cáo tổng hợp</li>
                  <li>Cấu hình hệ thống</li>
                </ul>
              </>
            ) : (
              <>
                <Text type="secondary">
                  Bạn có quyền quản lý khách sạn: <strong>{profileData?.tenant_name}</strong>
                </Text>
                <ul style={{ marginTop: 12, marginBottom: 0 }}>
                  <li>Quản lý phòng và dịch vụ</li>
                  <li>Xử lý đặt phòng</li>
                  <li>Quản lý khách hàng</li>
                  <li>Xem báo cáo khách sạn</li>
                </ul>
              </>
            )}
          </Card>
        )}
      </div>
  );
};

export default ProfilePage;
