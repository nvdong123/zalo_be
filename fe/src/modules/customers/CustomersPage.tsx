import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Form, Input, Popconfirm, Typography, Row, Col, Tag, Avatar, Divider
} from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put, del } from '../../utils/request';
import { message } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { authStore } from '../../stores/authStore';
import { tenantStore } from '../../stores/tenantStore';

const { Title, Text } = Typography;
const { Search } = Input;

// Helper to get current tenant ID
const getCurrentTenantId = (): number => {
  const role = authStore.getRole();
  if (role === 'SUPER_ADMIN') {
    return tenantStore.getSelectedTenantId() || 1;
  } else if (role === 'HOTEL_ADMIN') {
    return authStore.getTenantId() || 1;
  }
  return 1;
};

dayjs.extend(relativeTime);

interface Customer {
  id: number;
  tenant_id: number;
  zalo_user_id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  total_bookings?: number;
  total_spent?: number;
  last_booking_date?: string;
  created_at: string;
  updated_at: string;
}

const CustomersPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['customers', searchText],
    queryFn: async () => {
      const tenantId = getCurrentTenantId();
      // Backend expects: GET /customers?tenant_id=X&skip=0&limit=100
      const response = await get<Customer[]>(`/api/v1/customers`, {
        params: {
          tenant_id: tenantId,
          skip: 0,
          limit: 100,
          ...(searchText && { search: searchText })
        }
      });
      return response;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      put(`/api/v1/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      message.success('Customer updated successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/api/v1/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      message.success('Customer deleted successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 10000) return { tier: 'Platinum', color: '#722ed1' };
    if (totalSpent >= 5000) return { tier: 'Gold', color: '#faad14' };
    if (totalSpent >= 1000) return { tier: 'Silver', color: '#8c8c8c' };
    return { tier: 'Bronze', color: '#d4b106' };
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record: Customer) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.avatar_url} 
            icon={<UserOutlined />}
            size={40}
            style={{ marginRight: 12 }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 14 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>ID: {record.zalo_user_id}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record: Customer) => (
        <div>
          {record.phone && (
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              {record.phone}
            </div>
          )}
          {record.email && (
            <div style={{ fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4, color: '#52c41a' }} />
              {record.email}
            </div>
          )}
          {!record.phone && !record.email && (
            <Text type="secondary">No contact info</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Booking Stats',
      key: 'stats',
      render: (_, record: Customer) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: 16, color: '#1890ff' }}>
            {record.total_bookings}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Total Bookings</div>
          {record.last_booking_date && (
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
              Last: {dayjs(record.last_booking_date).format('MMM DD, YYYY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Total Spent',
      key: 'spent',
      render: (_, record: Customer) => {
        const totalSpent = record.total_spent || 0;
        const { tier, color } = getCustomerTier(totalSpent);
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: 16, color: '#52c41a' }}>
              ${totalSpent.toLocaleString()}
            </div>
            <Tag color={color} style={{ marginTop: 4, fontSize: 11 }}>
              {tier}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Join Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <div>
          <div>{dayjs(date).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {dayjs(date).fromNow()}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Customer) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              // Note: Customers are typically read-only from Zalo data
              // This would open a modal to edit limited fields like notes
              message.info('Customer editing functionality to be implemented');
            }}
          />
          <Popconfirm
            title="Delete customer? This will remove all their booking history."
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Customer Management</Title>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder="Search customers..."
                allowClear
                style={{ width: 250 }}
                onSearch={setSearchText}
                onChange={(e) => {
                  if (!e.target.value) setSearchText('');
                }}
              />
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Space>
          </Col>
        </Row>

        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {customers?.length || 0}
                </div>
                <div style={{ color: '#666' }}>Total Customers</div>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  ${customers?.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString() || 0}
                </div>
                <div style={{ color: '#666' }}>Total Revenue</div>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {customers?.reduce((sum, c) => sum + (c.total_bookings || 0), 0) || 0}
                </div>
                <div style={{ color: '#666' }}>Total Bookings</div>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                  {customers?.filter(c => (c.total_spent || 0) >= 10000).length || 0}
                </div>
                <div style={{ color: '#666' }}>Platinum Customers</div>
              </div>
            </div>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={customers || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
          }}
        />
      </Card>
    </div>
  );
};

export default CustomersPage;
