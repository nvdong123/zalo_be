import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Spin } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useDashboardStats } from './hooks';
import { authStore } from '../../stores/authStore';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const isHotelAdmin = authStore.isHotelAdmin();

  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={4}>Error loading dashboard</Title>
        <p>Please try again later</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={2}>
            {isHotelAdmin ? 'Hotel Dashboard' : 'Multi-Tenant Dashboard'}
          </Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Total Rooms"
                value={stats?.total_rooms || 0}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Available Rooms"
                value={stats?.available_rooms || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Total Bookings"
                value={stats?.total_bookings || 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable>
              <Statistic
                title="Active Bookings"
                value={stats?.active_bookings || 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Total Customers"
                value={stats?.total_customers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Total Revenue"
                value={formatCurrency(stats?.total_revenue || 0)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <Statistic
                title="Occupancy Rate"
                value={stats?.occupancy_rate || 0}
                suffix="%"
                prefix={<PercentageOutlined />}
                valueStyle={{ 
                  color: (stats?.occupancy_rate || 0) > 75 ? '#52c41a' : 
                         (stats?.occupancy_rate || 0) > 50 ? '#fa8c16' : '#ff4d4f'
                }}
                precision={1}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default DashboardPage;
