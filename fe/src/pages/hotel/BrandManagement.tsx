import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Row, Col, message, Space, Typography, Divider } from 'antd';
import { UploadOutlined, PictureOutlined, PlayCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '../../api/request';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface HotelBrand {
  id: number;
  hotel_name: string;
  slogan: string;
  description: string;
  logo_url: string;
  banner_images: string[];
  intro_video_url: string;
  vr360_url: string;
  primary_color: string;
  secondary_color: string;
  address: string;
  phone_number: string;
  email: string;
  website_url: string;
}

const BrandManagement: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch hotel brand data
  const { data: brandData, isLoading } = useQuery({
    queryKey: ['hotel-brand'],
    queryFn: () => request('get', '/hotel-brands'),
  });

  const brand = brandData?.data?.[0] as HotelBrand;

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: (data: Partial<HotelBrand>) =>
      brand?.id 
        ? request('put', `/hotel-brands/${brand.id}`, data)
        : request('post', '/hotel-brands', data),
    onSuccess: () => {
      message.success('Cập nhật thương hiệu thành công');
      queryClient.invalidateQueries({ queryKey: ['hotel-brand'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Lỗi cập nhật thương hiệu');
    },
  });

  const handleSubmit = async (values: any) => {
    await updateBrandMutation.mutateAsync(values);
  };

  // Set form values when data loads
  React.useEffect(() => {
    if (brand) {
      form.setFieldsValue({
        hotel_name: brand.hotel_name,
        slogan: brand.slogan,
        description: brand.description,
        address: brand.address,
        phone_number: brand.phone_number,
        email: brand.email,
        website_url: brand.website_url,
        primary_color: brand.primary_color || '#1890ff',
        secondary_color: brand.secondary_color || '#722ed1',
      });
    }
  }, [brand, form]);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>Quản lý Thương hiệu & Giao diện</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Tùy chỉnh logo, tên thương hiệu, theme màu sắc và thông tin liên hệ của khách sạn
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={updateBrandMutation.isPending}
      >
        <Row gutter={24}>
          {/* Thông tin cơ bản */}
          <Col xs={24} lg={12}>
            <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Tên khách sạn"
                name="hotel_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách sạn' }]}
              >
                <Input placeholder="Nhập tên khách sạn" size="large" />
              </Form.Item>

              <Form.Item
                label="Slogan"
                name="slogan"
              >
                <Input placeholder="Slogan ngắn gọn về khách sạn" size="large" />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Mô tả chi tiết về khách sạn"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Thông tin liên hệ */}
          <Col xs={24} lg={12}>
            <Card title="Thông tin liên hệ" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <TextArea rows={2} placeholder="Địa chỉ khách sạn" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone_number"
              >
                <Input placeholder="Số điện thoại liên hệ" size="large" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input placeholder="Email liên hệ" size="large" />
              </Form.Item>

              <Form.Item
                label="Website"
                name="website_url"
              >
                <Input 
                  placeholder="https://example.com" 
                  prefix={<GlobalOutlined />}
                  size="large" 
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Theme màu sắc */}
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title="Theme màu sắc" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Màu chính"
                    name="primary_color"
                  >
                    <Input 
                      placeholder="#1890ff"
                      prefix="#"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Màu phụ"
                    name="secondary_color"
                  >
                    <Input 
                      placeholder="#722ed1"
                      prefix="#"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Upload Files */}
          <Col xs={24} lg={12}>
            <Card title="Tài liệu đa phương tiện" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Logo khách sạn</Text>
                  <Upload>
                    <Button icon={<PictureOutlined />} style={{ width: '100%', marginTop: 8 }}>
                      Tải lên Logo
                    </Button>
                  </Upload>
                </div>

                <div>
                  <Text strong>Banner/Slider</Text>
                  <Upload multiple>
                    <Button icon={<PictureOutlined />} style={{ width: '100%', marginTop: 8 }}>
                      Tải lên Banner
                    </Button>
                  </Upload>
                </div>

                <div>
                  <Text strong>Video giới thiệu</Text>
                  <Upload>
                    <Button icon={<PlayCircleOutlined />} style={{ width: '100%', marginTop: 8 }}>
                      Tải lên Video
                    </Button>
                  </Upload>
                </div>

                <div>
                  <Text strong>VR 360°</Text>
                  <Upload>
                    <Button icon={<GlobalOutlined />} style={{ width: '100%', marginTop: 8 }}>
                      Tải lên VR 360°
                    </Button>
                  </Upload>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Action buttons */}
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button size="large">
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={updateBrandMutation.isPending}
              size="large"
            >
              Lưu thay đổi
            </Button>
          </Space>
        </div>
      </Form>

      {/* Preview section */}
      <Card title="Xem trước Mini App" style={{ marginTop: 24 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: 24,
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <Title level={4} style={{ margin: 0 }}>
            🚧 Tính năng preview đang được phát triển
          </Title>
          <Text type="secondary">
            Sẽ hiển thị preview Mini App với theme và thông tin đã cập nhật
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default BrandManagement;
