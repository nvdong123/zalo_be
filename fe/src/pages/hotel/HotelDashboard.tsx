import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Typography,
  Alert,
  Spin,
  Space,
  Select,
  Button
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { request } from '../../api/request';

const { Title, Text } = Typography;
const { Option } = Select;

interface DashboardData {
  overview: {
    total_rooms: number;
    total_bookings: number;
    total_customers: number;
    total_facilities: number;
    estimated_revenue: number;
  };
  booking_stats: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    recent: number;
    conversion_rate: number;
  };
  customer_stats: {
    total: number;
    new_this_month: number;
    growth_rate: number;
  };
  facility_stats: {
    total: number;
    active: number;
    utilization_rate: number;
  };
  promotion_stats: {
    total: number;
    active: number;
  };
  performance: {
    occupancy_rate: number;
    conversion_rate: number;
    revenue_growth: number;
  };
  charts: {
    daily_bookings: Array<{ date: string; bookings: number }>;
    room_types: Array<{ type: string; count: number }>;
  };
  recent_activities: {
    bookings: Array<{
      id: number;
      customer_name: string;
      customer_phone: string;
      room_name: string;
      room_type: string;
      check_in_date: string;
      check_out_date: string;
      status: string;
      created_at: string;
    }>;
  };
}

const HotelDashboard: React.FC = () => {
  console.log('🏨 HotelDashboard component is being rendered!');
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request('get', `/dashboard/hotel-comprehensive?days=${selectedDays}`);
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.detail || err.message || 'Có lỗi xảy ra khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDays]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <Spin size="large" tip="Đang tải dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <Space>
            <Button onClick={fetchDashboardData}>
              <ReloadOutlined /> Thử lại
            </Button>
          </Space>
        }
      />
    );
  }

  if (!dashboardData) {
    return <Alert message="Không có dữ liệu" type="warning" showIcon />;
  }

  // Chart configurations
  const dailyBookingsConfig = {
    data: dashboardData.charts.daily_bookings,
    xField: 'date',
    yField: 'bookings',
    point: {
      size: 5,
      shape: 'diamond',
    },
    smooth: true,
    color: '#1890ff',
    height: 300,
  };

  const roomTypesConfig = {
    data: dashboardData.charts.room_types,
    xField: 'type',
    yField: 'count',
    color: '#52c41a',
    height: 300,
  };

  const bookingStatusConfig = {
    data: [
      { type: 'Đã xác nhận', value: dashboardData.booking_stats.confirmed },
      { type: 'Chờ xử lý', value: dashboardData.booking_stats.pending },
      { type: 'Đã hủy', value: dashboardData.booking_stats.cancelled },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: ['#52c41a', '#faad14', '#ff4d4f'],
    height: 300,
  };

  // Table columns for recent bookings
  const bookingColumns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.customer_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.customer_phone}</div>
        </div>
      ),
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (record: any) => (
        <div>
          <div>{record.room_name}</div>
          <Tag color="blue">{record.room_type}</Tag>
        </div>
      ),
    },
    {
      title: 'Check-in',
      dataIndex: 'check_in_date',
      key: 'check_in',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Check-out',
      dataIndex: 'check_out_date',
      key: 'check_out',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          pending: 'orange',
          confirmed: 'green',
          cancelled: 'red',
          completed: 'blue'
        };
        const labels = {
          pending: 'Chờ xử lý',
          confirmed: 'Đã xác nhận',
          cancelled: 'Đã hủy',
          completed: 'Hoàn thành'
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {labels[status as keyof typeof labels] || status}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            🏨 Dashboard Hotel Management
          </Title>
          <Text type="secondary">
            Dashboard tổng hợp với dữ liệu thật - Cập nhật lúc {new Date().toLocaleString('vi-VN')}
          </Text>
        </div>
        <div>
          <Space>
            <Select
              value={selectedDays}
              onChange={setSelectedDays}
              style={{ width: 120 }}
            >
              <Option value={7}>7 ngày</Option>
              <Option value={30}>30 ngày</Option>
              <Option value={90}>90 ngày</Option>
            </Select>
            <Button onClick={fetchDashboardData}>
              <ReloadOutlined /> Làm mới
            </Button>
          </Space>
        </div>
      </div>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số phòng"
              value={dashboardData.overview.total_rooms}
              prefix={<HomeOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng booking"
              value={dashboardData.overview.total_bookings}
              prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={dashboardData.overview.total_customers}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu ước tính"
              value={dashboardData.overview.estimated_revenue}
              prefix={<DollarCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={8}>
          <Card title="📊 Tỷ lệ lấp đầy" bordered={false}>
            <Progress
              type="circle"
              percent={dashboardData.performance.occupancy_rate}
              format={(percent) => `${percent}%`}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Text type="secondary">Lấp đầy phòng hiện tại</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="💼 Tỷ lệ chuyển đổi" bordered={false}>
            <Progress
              type="circle"
              percent={dashboardData.performance.conversion_rate}
              format={(percent) => `${percent}%`}
              strokeColor={{
                '0%': '#ffa39e',
                '100%': '#ff7875',
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Text type="secondary">Booking thành công</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="📈 Tăng trưởng doanh thu" bordered={false}>
            <Progress
              type="circle"
              percent={dashboardData.performance.revenue_growth}
              format={(percent) => `+${percent}%`}
              strokeColor={{
                '0%': '#b7eb8f',
                '100%': '#52c41a',
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Text type="secondary">So với tháng trước</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="📈 Booking theo ngày" bordered={false}>
            <Line {...dailyBookingsConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="🏠 Phân bố loại phòng" bordered={false}>
            <Column {...roomTypesConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="🎯 Trạng thái booking" bordered={false}>
            <Pie {...bookingStatusConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📊 Chi tiết thống kê" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Khách hàng mới tháng này"
                  value={dashboardData.customer_stats.new_this_month}
                  suffix={
                    <span style={{ fontSize: '14px', color: '#52c41a' }}>
                      <RiseOutlined /> +{dashboardData.customer_stats.growth_rate}%
                    </span>
                  }
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Cơ sở vật chất hoạt động"
                  value={dashboardData.facility_stats.active}
                  suffix={`/${dashboardData.facility_stats.total}`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Khuyến mãi đang chạy"
                  value={dashboardData.promotion_stats.active}
                  suffix={`/${dashboardData.promotion_stats.total}`}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Booking gần đây"
                  value={dashboardData.booking_stats.recent}
                  suffix={`trong ${selectedDays} ngày`}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings Table */}
      <Card title="📋 Booking gần đây" bordered={false}>
        <Table
          columns={bookingColumns}
          dataSource={dashboardData.recent_activities.bookings}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default HotelDashboard;
