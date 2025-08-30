import React from 'react';
import { Card, Row, Col, Statistic, Typography, Empty, Spin, Table } from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  GiftOutlined, 
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useTenantScope } from '@/hooks/useTenantScope';
import { useDashboardStats } from '@/modules/dashboard/hooks';
import { useHotelBrands } from '@/hooks/useAPI';
import SuperAdminDashboard from '@/modules/super-admin/SuperAdminDashboard';
import { auth } from '@/store/auth';

import './index.less';

const { Title } = Typography;

const DashBoardPage: React.FC = () => {
  const { hasSelectedTenant, isSuperAdmin, isHotelAdmin } = useTenantScope();
  
  // Debug log to check user role
  console.log('Dashboard Debug:', {
    isSuperAdmin,
    isHotelAdmin,
    hasSelectedTenant,
    authData: auth.get(),
    userRole: auth.get().user?.role
  });

  // Force check: if user role is super_admin, show SuperAdminDashboard
  const userRole = auth.get().user?.role;
  if (userRole === 'super_admin') {
    console.log('Rendering SuperAdminDashboard for super_admin user');
    return (
      <div style={{ padding: '24px' }}>
        <h1>🎯 SUPER ADMIN DASHBOARD</h1>
        <p>User role: {userRole}</p>
        <p>This should be the SuperAdminDashboard component!</p>
        <SuperAdminDashboard />
      </div>
    );
  }
  
  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: hotelBrands, isLoading: brandsLoading } = useHotelBrands({ page: 1, page_size: 5 });

  // SUPER_ADMIN: Show Super Admin Dashboard (không cần chọn tenant)
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  // HOTEL_ADMIN: Show tenant selection prompt if no tenant selected
  if (isHotelAdmin && !hasSelectedTenant) {
    return (
      <Card>
        <Empty
          description="Vui lòng chọn tenant để xem thông tin quản lý"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  // HOTEL_ADMIN: Show hotel management dashboard
  if (statsLoading || brandsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard Quản lý khách sạn</Title>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Thương hiệu khách sạn"
              value={hotelBrands?.total || 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số phòng"
              value={0} // TODO: Add rooms count API
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Khuyến mãi đang hoạt động"
              value={0} // TODO: Add promotions count API
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Booking hôm nay"
              value={0} // TODO: Add bookings count API
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Thương hiệu khách sạn">
            <Table
              dataSource={hotelBrands?.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Tên khách sạn',
                  dataIndex: 'hotel_name',
                  key: 'hotel_name',
                },
                {
                  title: 'Địa chỉ',
                  dataIndex: 'address',
                  key: 'address',
                  render: (text: string) => text || '-',
                },
                {
                  title: 'Điện thoại',
                  dataIndex: 'phone_number',
                  key: 'phone_number',
                  render: (text: string) => text || '-',
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                  render: (text: string) => text || '-',
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Thống kê">
            <div style={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#999'
            }}>
              Biểu đồ sẽ được hiển thị ở đây
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashBoardPage;
