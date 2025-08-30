import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  message, 
  Select, 
  Tag,
  Row,
  Col,
  Divider,
  Modal,
  Descriptions
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import type { BookingRequest, Tenant } from '@/types/api';
import { bookingApi, tenantApi } from '@/api/backend.api';
import dayjs from 'dayjs';

const { Column } = Table;
const { Option } = Select;

const SimpleBookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<number>(1); // Default to tenant 1
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load tenants
  const loadTenants = async () => {
    try {
      const response = await tenantApi.getAll();
      if (response.result && Array.isArray(response.result)) {
        setTenants(response.result);
      }
    } catch (error) {
      console.error('Load tenants error:', error);
      message.error('❌ Failed to load tenants');
    }
  };

  // Load bookings for selected tenant
  const loadBookings = async (tenantId: number) => {
    setLoading(true);
    try {
      const response = await bookingApi.getAll(tenantId);
      if (response.result && Array.isArray(response.result)) {
        setBookings(response.result);
        message.success(`✅ Loaded ${response.result.length} bookings successfully`);
      } else {
        setBookings([]);
        message.info('No bookings found');
      }
    } catch (error) {
      console.error('Load bookings error:', error);
      message.error('❌ Failed to load bookings');
      setBookings([]);
    }
    setLoading(false);
  };

  // Update booking status
  const handleStatusUpdate = async (booking: BookingRequest, newStatus: string) => {
    try {
      await bookingApi.updateStatus(booking.id, newStatus, selectedTenant);
      message.success('✅ Booking status updated successfully');
      loadBookings(selectedTenant);
    } catch (error) {
      console.error('Update status error:', error);
      message.error('❌ Failed to update booking status');
    }
  };

  // Delete booking
  const handleDelete = async (booking: BookingRequest) => {
    Modal.confirm({
      title: 'Delete Booking',
      content: `Are you sure you want to delete booking from "${booking.customer_name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await bookingApi.delete(booking.id, selectedTenant);
          message.success('✅ Booking deleted successfully');
          loadBookings(selectedTenant);
        } catch (error) {
          console.error('Delete booking error:', error);
          message.error('❌ Failed to delete booking');
        }
      }
    });
  };

  // Show booking details
  const showBookingDetails = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'requested': return 'orange';
      case 'checked_in': return 'blue';
      case 'checked_out': return 'purple';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  useEffect(() => {
    loadTenants();
    loadBookings(selectedTenant);
  }, [selectedTenant]);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2>📋 Booking Management</h2>
            <p>Manage hotel booking requests - Connected to tested backend API</p>
          </Col>
          <Col>
            <Space>
              <Select
                value={selectedTenant}
                onChange={setSelectedTenant}
                style={{ width: 200 }}
                placeholder="Select Tenant"
              >
                {tenants.map(tenant => (
                  <Option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </Option>
                ))}
              </Select>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => loadBookings(selectedTenant)}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Table 
          dataSource={bookings}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1400 }}
          size="middle"
        >
          <Column 
            title="Customer" 
            dataIndex="customer_name" 
            key="customer_name"
            width={150}
            render={(text: string, record: BookingRequest) => (
              <div>
                <strong>{text}</strong>
                {record.customer_phone && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    📱 {record.customer_phone}
                  </div>
                )}
              </div>
            )}
          />
          
          <Column 
            title="Dates" 
            key="dates"
            width={180}
            render={(_, record: BookingRequest) => (
              <div>
                <div><strong>Check-in:</strong> {dayjs(record.check_in_date).format('MMM DD, YYYY')}</div>
                <div><strong>Check-out:</strong> {dayjs(record.check_out_date).format('MMM DD, YYYY')}</div>
              </div>
            )}
          />
          
          <Column 
            title="Guests" 
            dataIndex="guest_count" 
            key="guest_count"
            width={80}
            render={(count: number) => (
              <Tag color="blue">{count} guests</Tag>
            )}
          />
          
          <Column 
            title="Status" 
            dataIndex="status" 
            key="status"
            width={120}
            render={(status: string, record: BookingRequest) => (
              <Select
                value={status}
                onChange={(newStatus) => handleStatusUpdate(record, newStatus)}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="requested">
                  <Tag color="orange">Requested</Tag>
                </Option>
                <Option value="confirmed">
                  <Tag color="green">Confirmed</Tag>
                </Option>
                <Option value="checked_in">
                  <Tag color="blue">Checked In</Tag>
                </Option>
                <Option value="checked_out">
                  <Tag color="purple">Checked Out</Tag>
                </Option>
                <Option value="cancelled">
                  <Tag color="red">Cancelled</Tag>
                </Option>
              </Select>
            )}
          />
          
          <Column 
            title="Total Amount" 
            dataIndex="total_amount" 
            key="total_amount"
            width={120}
            render={(amount: number) => (
              <span style={{ fontWeight: 'bold', color: amount ? '#52c41a' : '#999' }}>
                {amount ? `$${amount.toLocaleString()}` : 'TBD'}
              </span>
            )}
          />
          
          <Column 
            title="Source" 
            dataIndex="booking_source" 
            key="booking_source"
            width={100}
            render={(source: string) => (
              <Tag color="cyan">{source || 'Direct'}</Tag>
            )}
          />
          
          <Column 
            title="Created" 
            dataIndex="created_at" 
            key="created_at"
            width={100}
            render={(date: string) => 
              dayjs(date).format('MMM DD')
            }
          />
          
          <Column
            title="Actions"
            key="actions"
            width={120}
            fixed="right"
            render={(_, record: BookingRequest) => (
              <Space size="small">
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => showBookingDetails(record)}
                />
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleDelete(record)}
                />
              </Space>
            )}
          />
        </Table>

        {/* Booking Details Modal */}
        <Modal
          title="📋 Booking Details"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedBooking(null);
          }}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {selectedBooking && (
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Booking ID">
                #{selectedBooking.id}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedBooking.status)}>
                  {selectedBooking.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Name">
                {selectedBooking.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedBooking.customer_phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedBooking.customer_email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Room ID">
                {selectedBooking.room_id ? `Room #${selectedBooking.room_id}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Check-in Date">
                {dayjs(selectedBooking.check_in_date).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Check-out Date">
                {dayjs(selectedBooking.check_out_date).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Guest Count">
                {selectedBooking.guest_count} guests
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                {selectedBooking.total_amount ? `$${selectedBooking.total_amount.toLocaleString()}` : 'TBD'}
              </Descriptions.Item>
              <Descriptions.Item label="Booking Source">
                <Tag color="cyan">{selectedBooking.booking_source || 'Direct'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {dayjs(selectedBooking.created_at).format('MMMM DD, YYYY HH:mm')}
              </Descriptions.Item>
              {selectedBooking.special_requests && (
                <Descriptions.Item label="Special Requests" span={2}>
                  {selectedBooking.special_requests}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default SimpleBookingManagement;
