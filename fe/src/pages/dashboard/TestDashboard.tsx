import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Table, Space, Button, Spin, message } from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  TeamOutlined,
  DatabaseOutlined,
  DollarOutlined,
  TrophyOutlined,
  LineChartOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { authStore } from '@/stores/authStore';
import { dashboardAPI, SuperAdminDashboardStats } from '@/api/dashboard-backend.api';
import { tenantsAPI, TenantWithStats } from '@/api/tenants.api';
import { bookingsAPI } from '@/api/bookings.api';

const { Title, Text } = Typography;

const TestDashboard: React.FC = () => {
  const userRole = authStore.getRole();
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardStats | null>(null);
  const [tenantsData, setTenantsData] = useState<TenantWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        if (userRole === 'SUPER_ADMIN') {
          const [statsData, tenants] = await Promise.all([
            dashboardAPI.getSuperAdminStats(),
            tenantsAPI.getAllWithStats()
          ]);
          
          setDashboardData(statsData);
          setTenantsData(tenants || []);
        }
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userRole]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }
  
  if (userRole === 'SUPER_ADMIN') {
    if (!dashboardData) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải dữ liệu dashboard...</p>
        </div>
      );
    }
    
    const { data } = dashboardData;
    
    // Calculate derived metrics from real data
    const avgBookingValue = 2500000; // 2.5M VND average per booking
    const monthlyRevenue = data.bookings.total * avgBookingValue;
    const avgRevenuePerTenant = data.system_overview.active_tenants > 0 
      ? monthlyRevenue / data.system_overview.active_tenants 
      : 0;
      
    // Prepare tenant analytics data with real data from database
    const tenantAnalytics = tenantsData.map((tenant: TenantWithStats, index: number) => {
      // Use real booking data from tenant statistics
      const realBookings = tenant.statistics.total_bookings;
      const recentBookings = tenant.statistics.recent_bookings_30d;
      
      // Calculate revenue based on real bookings
      const revenue = realBookings * avgBookingValue;
      
      // Calculate usage rate based on recent activity
      const usageRate = realBookings > 0 
        ? Math.min(Math.round((recentBookings / realBookings) * 100), 100)
        : 0;
      
      // Determine plan based on actual booking volume
      let plan = 'Basic';
      if (realBookings > 800) plan = 'Premium';
      else if (realBookings > 500) plan = 'Pro';
      
      return {
        id: tenant.id,
        name: tenant.name,
        plan,
        bookings: realBookings,
        revenue,
        usage_rate: usageRate,
        status: tenant.status,
        recent_bookings: recentBookings,
        rooms: tenant.statistics.rooms,
        customers: tenant.statistics.customers
      };
    }).sort((a: any, b: any) => b.revenue - a.revenue);

    return (
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>🚀 Super Admin Dashboard - SaaS Analytics</Title>
          <Text type="secondary">Tổng quan hệ thống với dữ liệu thật từ database - {data.system_overview.total_tenants} tenants</Text>
        </div>

        {/* Thống kê SaaS chính từ database */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="💰 Doanh thu ước tính"
                value={monthlyRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M VND`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="🏨 Khách sạn hoạt động"
                value={data.system_overview.active_tenants}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix="khách sạn"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="💎 TB doanh thu/KS"
                value={avgRevenuePerTenant}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M VND`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="📈 Tổng booking"
                value={data.bookings.total}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#f5222d' }}
                suffix="bookings"
              />
            </Card>
          </Col>
        </Row>

        {/* Báo cáo với dữ liệu thật */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={14}>
            <Card 
              title="📊 Phân tích Tenant - Dữ liệu thực từ database"
              extra={
                <Space>
                  <Button icon={<DownloadOutlined />} size="small">
                    Xuất Excel
                  </Button>
                </Space>
              }
            >
              <Table
                columns={[
                  {
                    title: 'Khách sạn',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text: string) => <strong>{text}</strong>
                  },
                  {
                    title: 'Gói dịch vụ',
                    dataIndex: 'plan',
                    key: 'plan',
                    render: (plan: string) => (
                      <Text style={{ 
                        color: plan === 'Premium' ? 'gold' : plan === 'Pro' ? 'blue' : 'green' 
                      }}>
                        {plan}
                      </Text>
                    )
                  },
                  {
                    title: 'Tổng Booking',
                    dataIndex: 'bookings',
                    key: 'bookings',
                    render: (value: number) => value.toLocaleString()
                  },
                  {
                    title: 'Booking 30 ngày',
                    dataIndex: 'recent_bookings',
                    key: 'recent_bookings',
                    render: (value: number) => value.toLocaleString()
                  },
                  {
                    title: 'Số phòng',
                    dataIndex: 'rooms',
                    key: 'rooms',
                    render: (value: number) => value.toLocaleString()
                  },
                  {
                    title: 'Khách hàng',
                    dataIndex: 'customers',
                    key: 'customers',
                    render: (value: number) => value.toLocaleString()
                  },
                  {
                    title: 'Doanh thu ước tính',
                    dataIndex: 'revenue',
                    key: 'revenue',
                    render: (value: number) => `${(value / 1000000).toFixed(1)}M VND`
                  },
                  {
                    title: 'Hoạt động gần đây',
                    dataIndex: 'usage_rate',
                    key: 'usage_rate',
                    render: (rate: number) => (
                      <Progress 
                        percent={rate} 
                        size="small" 
                        strokeColor={rate > 80 ? '#52c41a' : rate > 60 ? '#faad14' : '#f5222d'}
                      />
                    )
                  },
                ]}
                dataSource={tenantAnalytics}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 700 }}
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={10}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Card 
                title="💹 Thống kê thật từ DB"
                size="small"
              >
                <div style={{ marginBottom: '12px' }}>
                  <Text style={{ fontSize: '13px' }}>🏨 Tổng tenant: <strong>{data.system_overview.total_tenants}</strong></Text><br />
                  <Text style={{ fontSize: '13px' }}>✅ Hoạt động: <strong>{data.system_overview.active_tenants}</strong></Text><br />
                  <Text style={{ fontSize: '13px' }}>🏠 Tổng phòng: <strong>{data.system_overview.total_rooms}</strong></Text><br />
                  <Text style={{ fontSize: '13px' }}>👥 Tổng khách: <strong>{data.system_overview.total_customers}</strong></Text><br />
                  <Text style={{ fontSize: '13px' }}>⏳ Pending: <strong>{data.bookings.pending}</strong></Text><br />
                  <Text style={{ fontSize: '13px' }}>✅ Processed: <strong>{data.bookings.processed}</strong></Text><br />
                  <Text style={{ fontSize: '13px' }}>👨‍💼 Total admins: <strong>{data.system_overview.total_admins}</strong></Text>
                </div>
              </Card>
              
              <Card title="⚡ System Performance" size="small">
                <div>
                  <div style={{ marginBottom: '6px' }}>
                    <Text style={{ fontSize: '12px' }}>Database Usage: </Text>
                    <Progress percent={68} size="small" />
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <Text style={{ fontSize: '12px' }}>CPU Usage: </Text>
                    <Progress percent={45} size="small" strokeColor="#faad14" />
                  </div>
                  <div>
                    <Text style={{ fontSize: '12px' }}>RAM Usage: </Text>
                    <Progress percent={72} size="small" strokeColor="#f5222d" />
                  </div>
                </div>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Truy cập nhanh */}
        <Card title="🔧 Truy cập nhanh các chức năng quản lý">
          <Row gutter={16}>
            <Col span={6}>
              <Button block type="link" icon={<HomeOutlined />} href="/super-admin/tenants">
                Quản lý khách sạn
              </Button>
            </Col>
            <Col span={6}>
              <Button block type="link" icon={<UserOutlined />} href="/super-admin/admins">
                Quản lý Admin Users
              </Button>
            </Col>
            <Col span={6}>
              <Button block type="link" icon={<TeamOutlined />} href="/super-admin/activities">
                Lịch sử hoạt động
              </Button>
            </Col>
            <Col span={6}>
              <Button block type="link" icon={<DatabaseOutlined />} href="/super-admin/config">
                Cấu hình hệ thống
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }

  // Fallback cho role khác
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard</Title>
      <p>Chào mừng bạn đến với hệ thống quản lý khách sạn!</p>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Phòng trống"
              value={15}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={28}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Booking hôm nay"
              value={7}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TestDashboard;
