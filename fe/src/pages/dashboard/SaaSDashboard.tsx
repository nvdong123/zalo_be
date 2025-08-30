import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Table, Tag, Avatar, 
  Select, DatePicker, Space, Button, Tooltip, Typography,
  Segmented, Alert, Spin, Empty
} from 'antd';
import {
  DollarOutlined, UserOutlined, CalendarOutlined, HomeOutlined,
  RiseOutlined, FallOutlined, BellOutlined,
  ExpandOutlined, ReloadOutlined, DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { roomApi, bookingRequestApi, customerApi } from '../../api/backend.api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingGrowth: number;
  occupancyRate: number;
  occupancyChange: number;
  totalCustomers: number;
  customerGrowth: number;
}

interface RecentBooking {
  id: string;
  customerName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

interface RoomTypeData {
  type: string;
  value: number;
  percentage: number;
}

const SaaSDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    totalBookings: 0,
    bookingGrowth: 0,
    occupancyRate: 0,
    occupancyChange: 0,
    totalCustomers: 0,
    customerGrowth: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [roomTypeData, setRoomTypeData] = useState<RoomTypeData[]>([]);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const tenantId = userData.user_info?.tenant_id || 1;

      // Fetch data from multiple endpoints
      const [roomsResponse, bookingsResponse, customersResponse] = await Promise.all([
        roomApi.getAll(tenantId),
        bookingRequestApi.getAll(tenantId),
        customerApi.getAll(tenantId),
      ]);

      // Calculate statistics - API responses are arrays directly
      const rooms = Array.isArray(roomsResponse) ? roomsResponse : [];
      const bookings = Array.isArray(bookingsResponse) ? bookingsResponse : [];
      const customers = Array.isArray(customersResponse) ? customersResponse : [];

      // Mock revenue data - in real app, this comes from backend
      const mockRevenueData = [
        { month: 'Jan', revenue: 45000, bookings: 120 },
        { month: 'Feb', revenue: 52000, bookings: 140 },
        { month: 'Mar', revenue: 48000, bookings: 125 },
        { month: 'Apr', revenue: 61000, bookings: 165 },
        { month: 'May', revenue: 55000, bookings: 150 },
        { month: 'Jun', revenue: 67000, bookings: 180 },
      ];

      // Calculate occupancy rate
      const totalRooms = rooms.length;
      const occupiedRooms = bookings.filter((b: any) => b.status === 'confirmed').length;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      // Room type distribution
      const roomTypeCounts: { [key: string]: number } = {};
      rooms.forEach((room: any) => {
        const type = room.room_type || 'Standard';
        roomTypeCounts[type] = (roomTypeCounts[type] || 0) + 1;
      });

      const roomTypeData = Object.entries(roomTypeCounts).map(([type, count]) => ({
        type,
        value: count,
        percentage: totalRooms > 0 ? (count / totalRooms) * 100 : 0,
      }));

      // Recent bookings
      const recentBookings = bookings.slice(0, 5).map((booking: any) => ({
        id: booking.id || Math.random().toString(),
        customerName: booking.customer_name || 'Unknown',
        roomNumber: booking.room_number || 'N/A',
        checkIn: booking.check_in_date || new Date().toISOString(),
        checkOut: booking.check_out_date || new Date().toISOString(),
        status: (booking.status as any) || 'pending',
        amount: booking.total_amount || Math.random() * 1000,
      }));

      setStats({
        totalRevenue: mockRevenueData.reduce((sum, item) => sum + item.revenue, 0),
        revenueGrowth: 12.5,
        totalBookings: bookings.length,
        bookingGrowth: 8.3,
        occupancyRate,
        occupancyChange: 5.2,
        totalCustomers: customers.length,
        customerGrowth: 15.7,
      });

      setRevenueData(mockRevenueData);
      setRoomTypeData(roomTypeData);
      setRecentBookings(recentBookings);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // KPI Cards Configuration
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      prefix: '$',
      precision: 0,
      growth: stats.revenueGrowth,
      icon: <DollarOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      growth: stats.bookingGrowth,
      icon: <CalendarOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Occupancy Rate',
      value: stats.occupancyRate,
      suffix: '%',
      precision: 1,
      growth: stats.occupancyChange,
      icon: <HomeOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      growth: stats.customerGrowth,
      icon: <UserOutlined />,
      color: '#fa541c',
    },
  ];

  // Recent Bookings Table Columns
  const bookingColumns: ColumnsType<RecentBooking> = [
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (room: string) => <Tag color="blue">{room}</Tag>,
    },
    {
      title: 'Check-in',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          confirmed: 'success',
          pending: 'warning',
          cancelled: 'error',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
  ];

  // Chart Configurations (simplified for display)
  const displayData = {
    revenueData,
    roomTypeData,
    selectedMetric
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Dashboard Overview
            </Title>
            <Text type="secondary">
              Welcome back! Here's what's happening with your hotel today.
            </Text>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
                options={[
                  { label: 'Last 7 days', value: '7d' },
                  { label: 'Last 30 days', value: '30d' },
                  { label: 'Last 90 days', value: '90d' },
                ]}
              />
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchDashboardData}
                loading={loading}
              >
                Refresh
              </Button>
              <Button type="primary" icon={<DownloadOutlined />}>
                Export Report
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Alert Banner */}
      <Alert
        message="Hotel Performance Update"
        description="Your hotel has shown a 12.5% increase in revenue this month compared to last month. Great job!"
        type="success"
        showIcon
        closable
        style={{ marginBottom: 24 }}
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiCards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Row justify="space-between" align="top">
                <Col>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {card.title}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Statistic
                      value={card.value}
                      prefix={card.prefix}
                      suffix={card.suffix}
                      precision={card.precision}
                      valueStyle={{ fontSize: 24, fontWeight: 'bold' }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text
                        type={card.growth > 0 ? 'success' : 'danger'}
                        style={{ fontSize: 12 }}
                      >
                        {card.growth > 0 ? <RiseOutlined /> : <FallOutlined />}
                        {Math.abs(card.growth).toFixed(1)}% vs last period
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      color: 'white',
                    }}
                  >
                    {card.icon}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Revenue Trend Chart */}
        <Col xs={24} lg={16}>
          <Card
            title="Revenue Trend"
            extra={
              <Space>
                <Select
                  value={selectedMetric}
                  onChange={setSelectedMetric}
                  style={{ width: 120 }}
                  options={[
                    { label: 'Revenue', value: 'revenue' },
                    { label: 'Bookings', value: 'bookings' },
                  ]}
                />
                <Tooltip title="Expand">
                  <Button icon={<ExpandOutlined />} type="text" />
                </Tooltip>
              </Space>
            }
          >
            <div style={{ height: 300, padding: 20, background: '#fafafa', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Text type="secondary">Revenue Chart Visualization</Text>
              </div>
              {/* Revenue trend bars */}
              <div style={{ display: 'flex', alignItems: 'end', gap: 8, marginTop: 16 }}>
                {revenueData.map((item, index) => (
                  <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                    <div
                      style={{
                        height: (item.revenue / 70000) * 200,
                        backgroundColor: '#1890ff',
                        borderRadius: '4px 4px 0 0',
                        marginBottom: 4,
                      }}
                    />
                    <Text style={{ fontSize: 10 }}>{item.month}</Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        {/* Room Type Distribution */}
        <Col xs={24} lg={8}>
          <Card title="Room Type Distribution">
            {roomTypeData.length > 0 ? (
              <div style={{ height: 300, padding: 20 }}>
                {roomTypeData.map((item, index) => (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{item.type}</Text>
                      <Text>{item.percentage.toFixed(1)}%</Text>
                    </div>
                    <Progress 
                      percent={item.percentage} 
                      strokeColor={['#1890ff', '#52c41a', '#faad14', '#f5222d'][index % 4]}
                      showInfo={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="No room data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        {/* Recent Bookings */}
        <Col xs={24} lg={16}>
          <Card
            title="Recent Bookings"
            extra={
              <Button type="link">View All Bookings</Button>
            }
          >
            <Table
              dataSource={recentBookings}
              columns={bookingColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col xs={24} lg={8}>
          <Card title="Quick Stats">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">Average Daily Rate</Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>$125.50</Text>
                  <Text type="success" style={{ marginLeft: 8 }}>+5.2%</Text>
                </div>
              </div>
              
              <div>
                <Text type="secondary">Revenue per Available Room</Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>$98.75</Text>
                  <Text type="success" style={{ marginLeft: 8 }}>+8.1%</Text>
                </div>
              </div>
              
              <div>
                <Text type="secondary">Guest Satisfaction</Text>
                <div style={{ marginTop: 4 }}>
                  <Progress
                    percent={87}
                    strokeColor="#52c41a"
                    format={percent => `${percent}%`}
                  />
                </div>
              </div>
              
              <div>
                <Text type="secondary">Staff Utilization</Text>
                <div style={{ marginTop: 4 }}>
                  <Progress
                    percent={73}
                    strokeColor="#1890ff"
                    format={percent => `${percent}%`}
                  />
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SaaSDashboard;
