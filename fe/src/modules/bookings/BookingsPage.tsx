import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, Select, DatePicker,
  Popconfirm, Typography, Row, Col, Tag, Avatar, Divider, Descriptions,
  Spin, Alert
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined, UserOutlined, 
  CalendarOutlined, DollarOutlined, HomeOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, put, del, post } from '../../utils/request';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useTenantContext } from '../../hooks/useTenantContext';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Booking {
  id: number;
  tenant_id: number;
  customer_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    avatar_url?: string;
    phone?: string;
  };
  room?: {
    name: string;
    type: string;
  };
}

const BookingsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  const { data: bookingResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['bookings', tenantId, searchText, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchText) params.append('customer_name', searchText);
      if (statusFilter) params.append('status_filter', statusFilter);
      return get<{success: boolean, data: {bookings: Booking[], pagination: any}}>(`/api/v1/booking-requests/management?${params.toString()}`);
    },
  });

  const bookings = bookingResponse?.data?.bookings || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      put(`/api/v1/booking-requests/management/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', tenantId] });
      message.success('Booking status updated successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      post(`/api/v1/booking-requests/management/${id}/cancel?cancellation_reason=${encodeURIComponent(reason)}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', tenantId] });
      message.success('Booking cancelled successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0;
    return dayjs(checkOut).diff(dayjs(checkIn), 'day');
  };

  const columns: ColumnsType<Booking> = [
    {
      title: 'Booking ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number) => `#${id}`,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record: Booking) => {
        // Safe data extraction with fallbacks
        const customerName = record.customer?.name || 'Unknown';
        const customerPhone = record.customer?.phone || '';
        const avatarUrl = record.customer?.avatar_url || '';
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={avatarUrl} 
              icon={<UserOutlined />}
              size={32}
              style={{ marginRight: 8 }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 13 }}>{String(customerName)}</div>
              {customerPhone && (
                <div style={{ fontSize: 11, color: '#666' }}>{String(customerPhone)}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Room',
      key: 'room',
      render: (_, record: Booking) => {
        const roomName = record.room?.name || 'Unknown Room';
        const roomType = record.room?.type || 'Standard';
        
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{String(roomName)}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{String(roomType)}</div>
          </div>
        );
      },
    },
    {
      title: 'Stay Period',
      key: 'period',
      render: (_, record: Booking) => {
        const nights = calculateNights(record.check_in_date, record.check_out_date);
        const checkInDate = record.check_in_date ? dayjs(record.check_in_date).format('MMM DD') : 'N/A';
        const checkOutDate = record.check_out_date ? dayjs(record.check_out_date).format('MMM DD') : 'N/A';
        
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              <CalendarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              {String(nights)} night{nights > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {String(checkInDate)} - {String(checkOutDate)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => {
        const numAmount = Number(amount) || 0;
        return (
          <div style={{ textAlign: 'right' }}>
            <DollarOutlined style={{ color: '#52c41a', marginRight: 4 }} />
            <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
              ${numAmount.toLocaleString()}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusString = String(status || 'pending');
        return (
          <Tag color={getStatusColor(statusString)}>
            {statusString.charAt(0).toUpperCase() + statusString.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Booked On',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => {
        if (!date) return 'N/A';
        try {
          const parsedDate = dayjs(date);
          return (
            <div>
              <div>{parsedDate.format('MMM DD, YYYY')}</div>
              <div style={{ fontSize: 11, color: '#666' }}>
                {parsedDate.format('HH:mm')}
              </div>
            </div>
          );
        } catch (error) {
          return 'Invalid Date';
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Booking) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBooking(record);
              setDetailModalVisible(true);
            }}
          />
          {record.status === 'pending' && (
            <Button
              type="text"
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'confirmed' })}
            >
              Confirm
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Button
              type="text"
              size="small"
              danger
              onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'cancelled' })}
            >
              Cancel
            </Button>
          )}
          <Popconfirm
            title="Cancel booking?"
            onConfirm={() => cancelMutation.mutate({ id: record.id, reason: 'Cancelled by admin' })}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Summary stats
  // Early returns for loading and error states
  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error loading bookings"
          description="Unable to load booking data. Please try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Safe data processing
  const safeBookings = Array.isArray(bookings) ? bookings.filter(booking => 
    booking && typeof booking === 'object' && booking.id
  ) : [];

  const totalBookings = safeBookings.length;
  const totalRevenue = bookings?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;
  const pendingBookings = safeBookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = safeBookings.filter(b => b.status === 'confirmed').length;

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>Booking Management</Title>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder="Search bookings..."
                allowClear
                style={{ width: 200 }}
                onSearch={setSearchText}
                onChange={(e) => {
                  if (!e.target.value) setSearchText('');
                }}
              />
              <Select
                placeholder="Filter by status"
                allowClear
                style={{ width: 130 }}
                onChange={setStatusFilter}
              >
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Space>
          </Col>
        </Row>

        {/* Summary Stats */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {totalBookings}
                </div>
                <div style={{ color: '#666' }}>Total Bookings</div>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  ${totalRevenue.toLocaleString()}
                </div>
                <div style={{ color: '#666' }}>Total Revenue</div>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {pendingBookings}
                </div>
                <div style={{ color: '#666' }}>Pending</div>
              </div>
              <Divider type="vertical" style={{ height: 40 }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {confirmedBookings}
                </div>
                <div style={{ color: '#666' }}>Confirmed</div>
              </div>
            </div>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={safeBookings}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} bookings`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Booking Details #${selectedBooking?.id}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedBooking && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Customer" span={2}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={selectedBooking.customer?.avatar_url} 
                  icon={<UserOutlined />}
                  style={{ marginRight: 8 }}
                />
                {selectedBooking.customer?.name || 'Unknown'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Room" span={2}>
              <HomeOutlined style={{ marginRight: 4 }} />
              {selectedBooking.room?.name || 'Unknown Room'} ({selectedBooking.room?.type || 'Standard'})
            </Descriptions.Item>
            <Descriptions.Item label="Check-in">
              {selectedBooking.check_in_date ? dayjs(selectedBooking.check_in_date).format('MMM DD, YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Check-out">
              {selectedBooking.check_out_date ? dayjs(selectedBooking.check_out_date).format('MMM DD, YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Nights">
              {calculateNights(selectedBooking.check_in_date, selectedBooking.check_out_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>
                ${selectedBooking.total_amount?.toLocaleString() || '0'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              <Tag color={getStatusColor(selectedBooking.status)}>
                {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Booking Date" span={2}>
              {selectedBooking.created_at ? dayjs(selectedBooking.created_at).format('MMM DD, YYYY HH:mm') : 'N/A'}
            </Descriptions.Item>
            {selectedBooking.special_requests && (
              <Descriptions.Item label="Special Requests" span={2}>
                {selectedBooking.special_requests}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default BookingsPage;
