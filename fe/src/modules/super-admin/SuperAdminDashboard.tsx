import React, { useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Button, Space, Tag, 
  Typography, Tabs, Modal, Form, Input, Select, Switch,
  Progress, Timeline, List, Alert, Divider
} from 'antd';
import {
  UserOutlined, ShopOutlined, DashboardOutlined, SettingOutlined,
  PlusOutlined, SecurityScanOutlined,
  ApiOutlined, DollarCircleOutlined, TeamOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put } from '../../utils/request';
import { message } from 'antd';
import { dashboardAPI } from '../../api/dashboard-backend.api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface Tenant {
  id: number;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan: string;
  admin_count: number;
  rooms_count: number;
  bookings_count: number;
  revenue: number;
  created_at: string;
  last_activity: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'hotel_admin';
  tenant_name?: string;
  status: 'active' | 'inactive';
  last_login: string;
  created_at: string;
}

interface SystemActivity {
  id: number;
  action: string;
  user: string;
  tenant: string;
  timestamp: string;
  details: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantModalVisible, setTenantModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm] = Form.useForm();
  const [adminForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['super-admin-dashboard-stats'],
    queryFn: dashboardAPI.getSuperAdminStats,
  });

  // Fetch tenants list
  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['tenants-list'],
    queryFn: () => get<Tenant[]>('/api/v1/tenants'),
  });

  // Fetch admin users
  const { data: adminUsers, isLoading: adminsLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => get<AdminUser[]>('/api/v1/admin-users'),
  });

  // Mock activities for demo
  const activities = [
    { id: 1, action: 'Tạo khách sạn mới', user: 'superadmin', tenant: 'Hotel ABC', timestamp: new Date().toISOString(), details: 'Thêm khách sạn ABC' },
    { id: 2, action: 'Cập nhật cấu hình', user: 'admin1', tenant: 'Hotel XYZ', timestamp: new Date().toISOString(), details: 'Cập nhật thông tin' },
    { id: 3, action: 'Đăng nhập hệ thống', user: 'admin2', tenant: 'Hotel DEF', timestamp: new Date().toISOString(), details: 'Đăng nhập thành công' },
  ];

  // Mutations
  const createTenantMutation = useMutation({
    mutationFn: (data: any) => post('/api/v1/tenants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants-list'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-dashboard-stats'] });
      message.success('Tạo khách sạn thành công!');
      setTenantModalVisible(false);
      tenantForm.resetFields();
    },
    onError: (error: any) => message.error(error.message),
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => put(`/api/v1/tenants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants-list'] });
      message.success('Cập nhật khách sạn thành công!');
      setTenantModalVisible(false);
      setEditingTenant(null);
      tenantForm.resetFields();
    },
    onError: (error: any) => message.error(error.message),
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: any) => post('/api/v1/admin-users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      message.success('Tạo admin thành công!');
      setAdminModalVisible(false);
      adminForm.resetFields();
    },
    onError: (error: any) => message.error(error.message),
  });

  // Dashboard Stats Cards
  const renderStatsCards = () => {
    const stats = dashboardStats?.data?.system_overview;
    
    // Use mock data if no real data
    const mockStats = {
      total_tenants: 15,
      active_tenants: 12,
      inactive_tenants: 3,
      total_rooms: 450,
      total_customers: 1250,
      total_admins: 28
    };
    
    const displayStats = stats || mockStats;
    
    return (
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} xl={6}>
          <Card hoverable style={{ height: '100%' }}>
            <Statistic
              title="Tổng số khách sạn"
              value={displayStats.total_tenants}
              prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <Text type="success" style={{ fontSize: 14 }}>
                {displayStats.active_tenants} hoạt động
              </Text>
              <Text type="danger" style={{ fontSize: 14 }}>
                {displayStats.inactive_tenants} tạm dừng
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card hoverable style={{ height: '100%' }}>
            <Statistic
              title="Tổng số phòng"
              value={displayStats.total_rooms}
              prefix={<DashboardOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Trên tất cả khách sạn
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card hoverable style={{ height: '100%' }}>
            <Statistic
              title="Tổng khách hàng"
              value={displayStats.total_customers}
              prefix={<UserOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 28 }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Đã đăng ký hệ thống
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card hoverable style={{ height: '100%' }}>
            <Statistic
              title="Quản trị viên"
              value={displayStats.total_admins}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 28 }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Super + Hotel Admin
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  // Tenants Table Columns
  const tenantColumns: ColumnsType<Tenant> = [
    {
      title: 'Tên khách sạn',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.domain}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          active: 'green',
          inactive: 'red',
          suspended: 'orange',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Gói dịch vụ',
      dataIndex: 'subscription_plan',
      key: 'subscription_plan',
      render: (plan: string) => <Tag color="blue">{plan}</Tag>,
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_, record) => (
        <div>
          <div>{record.admin_count || 0} admins</div>
          <div>{record.rooms_count || 0} phòng</div>
          <div>{record.bookings_count || 0} bookings</div>
        </div>
      ),
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            type="primary" 
            onClick={() => handleEditTenant(record)}
          >
            Sửa
          </Button>
          <Button 
            size="small" 
            danger
            onClick={() => handleToggleTenantStatus(record)}
          >
            Tạm dừng
          </Button>
        </Space>
      ),
    },
  ];

  // Admin Users Table Columns
  const adminColumns: ColumnsType<AdminUser> = [
    {
      title: 'Thông tin',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.username}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'super_admin' ? 'red' : 'blue'}>
          {role === 'super_admin' ? 'Super Admin' : 'Hotel Admin'}
        </Tag>
      ),
    },
    {
      title: 'Khách sạn',
      dataIndex: 'tenant_name',
      key: 'tenant_name',
      render: (name: string) => name || 'Tất cả',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase() || 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Tạo ngày',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" type="primary">Sửa</Button>
          <Button size="small" danger>Xóa</Button>
        </Space>
      ),
    },
  ];

  // Event Handlers
  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    tenantForm.setFieldsValue(tenant);
    setTenantModalVisible(true);
  };

  const handleToggleTenantStatus = (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
    updateTenantMutation.mutate({
      id: tenant.id,
      data: { status: newStatus }
    });
  };

  const handleTenantSubmit = () => {
    tenantForm.validateFields().then(values => {
      if (editingTenant) {
        updateTenantMutation.mutate({
          id: editingTenant.id,
          data: values
        });
      } else {
        createTenantMutation.mutate(values);
      }
    });
  };

  const handleAdminSubmit = () => {
    adminForm.validateFields().then(values => {
      createAdminMutation.mutate(values);
    });
  };

  // System Configuration Component
  const renderSystemConfig = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}>
        <Card 
          title="Cấu hình thanh toán" 
          extra={<Button icon={<SettingOutlined />} type="link">Cấu hình</Button>}
          style={{ height: '100%' }}
        >
          <List
            size="small"
            dataSource={[
              { name: 'PayPal Gateway', status: 'active', icon: <DollarCircleOutlined /> },
              { name: 'Stripe Payment', status: 'active', icon: <DollarCircleOutlined /> },
              { name: 'VNPay', status: 'inactive', icon: <DollarCircleOutlined /> },
            ]}
            renderItem={item => (
              <List.Item
                actions={[
                  <Switch 
                    key="switch"
                    checked={item.status === 'active'} 
                    size="small"
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={item.icon}
                  title={item.name}
                  description={`Trạng thái: ${item.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card 
          title="Tích hợp API" 
          extra={<Button icon={<ApiOutlined />} type="link">Quản lý</Button>}
          style={{ height: '100%' }}
        >
          <List
            size="small"
            dataSource={[
              { name: 'Zalo Official Account API', status: 'active', icon: <ApiOutlined /> },
              { name: 'SMS Gateway', status: 'active', icon: <ApiOutlined /> },
              { name: 'Email Service', status: 'active', icon: <ApiOutlined /> },
              { name: 'Analytics API', status: 'inactive', icon: <ApiOutlined /> },
            ]}
            renderItem={item => (
              <List.Item
                actions={[
                  <Switch 
                    key="switch"
                    checked={item.status === 'active'} 
                    size="small"
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={item.icon}
                  title={item.name}
                  description={`Trạng thái: ${item.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24}>
        <Card 
          title="Thông tin hệ thống" 
          extra={<Button icon={<SecurityScanOutlined />} type="link">Cài đặt</Button>}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Statistic 
                  title="Phiên bản hệ thống" 
                  value="v2.1.0" 
                  valueStyle={{ color: '#1890ff' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Statistic 
                  title="Uptime" 
                  value="99.9" 
                  suffix="%" 
                  valueStyle={{ color: '#52c41a' }} 
                />
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Statistic 
                  title="Backup cuối" 
                  value="12:00 hôm qua"
                  valueStyle={{ color: '#faad14' }}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );

  // Activity Timeline
  const renderActivityTimeline = () => (
    <Timeline>
      {activities.slice(0, 10).map(activity => (
        <Timeline.Item key={activity.id} color="blue">
          <div>
            <div style={{ fontWeight: 'bold' }}>{activity.action}</div>
            <div>Người dùng: {activity.user} - Khách sạn: {activity.tenant}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {dayjs(activity.timestamp).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: 32, textAlign: 'left' }}>
          <Title level={2} style={{ 
            margin: 0, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            color: '#1f1f1f'
          }}>
            <DashboardOutlined style={{ color: '#1890ff' }} /> 
            Super Admin Dashboard
          </Title>
          <Paragraph style={{ 
            margin: '8px 0 0 0', 
            color: '#666',
            fontSize: 16,
            maxWidth: 600
          }}>
            Quản lý toàn bộ hệ thống khách sạn SaaS - theo dõi hoạt động và cấu hình hệ thống
          </Paragraph>
        </div>

        {/* Stats Cards Section */}
        <div style={{ marginBottom: 32 }}>
          {renderStatsCards()}
        </div>

        {/* Main Content Tabs */}
        <Card 
          style={{ 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            size="large"
            style={{ padding: '0 24px' }}
            tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f0f0f0' }}
          >
            <Tabs.TabPane tab="Quản lý khách sạn" key="tenants">
              <div style={{ padding: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 24
                }}>
                  <Title level={4} style={{ margin: 0 }}>Danh sách khách sạn</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setTenantModalVisible(true)}
                    size="large"
                  >
                    Thêm khách sạn
                  </Button>
                </div>
                <Table
                  columns={tenantColumns}
                  dataSource={tenants || []}
                  rowKey="id"
                  loading={tenantsLoading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true, 
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                  }}
                  scroll={{ x: 1000 }}
                  bordered={false}
                  style={{ backgroundColor: '#fff' }}
                />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Quản lý Admin" key="admins">
              <div style={{ padding: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 24
                }}>
                  <Title level={4} style={{ margin: 0 }}>Danh sách quản trị viên</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setAdminModalVisible(true)}
                    size="large"
                  >
                    Thêm admin
                  </Button>
                </div>
                <Table
                  columns={adminColumns}
                  dataSource={adminUsers || []}
                  rowKey="id"
                  loading={adminsLoading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true, 
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
                  }}
                  scroll={{ x: 1000 }}
                  bordered={false}
                  style={{ backgroundColor: '#fff' }}
                />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Lịch sử hoạt động" key="activities">
              <div style={{ padding: '24px' }}>
                <Title level={4} style={{ marginBottom: 24 }}>Hoạt động gần đây</Title>
                <div style={{ 
                  backgroundColor: '#fff', 
                  padding: 24, 
                  borderRadius: 8,
                  border: '1px solid #f0f0f0'
                }}>
                  {renderActivityTimeline()}
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Cấu hình hệ thống" key="config">
              <div style={{ padding: '24px' }}>
                <Title level={4} style={{ marginBottom: 24 }}>Cấu hình hệ thống</Title>
                {renderSystemConfig()}
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>

      {/* Modals */}
      <Modal
        title={editingTenant ? 'Sửa khách sạn' : 'Thêm khách sạn mới'}
        open={tenantModalVisible}
        onOk={handleTenantSubmit}
        onCancel={() => {
          setTenantModalVisible(false);
          setEditingTenant(null);
          tenantForm.resetFields();
        }}
        confirmLoading={createTenantMutation.isPending || updateTenantMutation.isPending}
      >
        <Form form={tenantForm} layout="vertical">
          <Form.Item name="name" label="Tên khách sạn" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="domain" label="Domain" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="phone_number" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="subscription_plan" label="Gói dịch vụ">
            <Select>
              <Select.Option value="basic">Basic</Select.Option>
              <Select.Option value="premium">Premium</Select.Option>
              <Select.Option value="enterprise">Enterprise</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm quản trị viên mới"
        open={adminModalVisible}
        onOk={handleAdminSubmit}
        onCancel={() => {
          setAdminModalVisible(false);
          adminForm.resetFields();
        }}
        confirmLoading={createAdminMutation.isPending}
      >
        <Form form={adminForm} layout="vertical">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="hotel_admin">Hotel Admin</Select.Option>
              <Select.Option value="super_admin">Super Admin</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tenant_id" label="Khách sạn">
            <Select placeholder="Chọn khách sạn (để trống nếu là Super Admin)">
              {tenants?.map(tenant => (
                <Select.Option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
