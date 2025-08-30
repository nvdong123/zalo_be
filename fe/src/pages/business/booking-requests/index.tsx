import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBookingRequests, createBookingRequest, updateBookingRequest, deleteBookingRequest, BookingRequest, BookingRequestCreate, BookingRequestUpdate } from '../../../api/booking-request.api';
import { getCustomers } from '../../../api/customer.api';
import { useTenantScope } from '../../../hooks/useTenantScope';
import dayjs from 'dayjs';

const { Option } = Select;

const BookingRequestsPage: React.FC = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRequest | null>(null);
  const [form] = Form.useForm();
  const { tenantId } = useTenantScope();

  const requestChannels = [
    { value: 'zalo_chat', label: 'Zalo Chat' },
    { value: 'external_link', label: 'External Link' },
    { value: 'website', label: 'Website' },
    { value: 'phone_call', label: 'Phone Call' },
    { value: 'walk_in', label: 'Walk-in' },
  ];

  const statusOptions = [
    { value: 'requested', label: 'Requested', color: 'blue' },
    { value: 'confirmed', label: 'Confirmed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'completed', label: 'Completed', color: 'purple' },
  ];

  const fetchBookingRequests = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await getBookingRequests(tenantId);
      if (res.status && res.result) {
        setBookingRequests(res.result);
      } else {
        setBookingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      message.error('Failed to fetch booking requests');
      setBookingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!tenantId) return;
    try {
      const res = await getCustomers(tenantId);
      if (res.status && res.result) {
        setCustomers(res.result);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchBookingRequests();
    fetchCustomers();
  }, [tenantId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Convert dates to strings
      if (values.booking_date) {
        values.booking_date = values.booking_date.format('YYYY-MM-DD HH:mm:ss');
      }
      if (values.check_in_date) {
        values.check_in_date = values.check_in_date.format('YYYY-MM-DD');
      }
      if (values.check_out_date) {
        values.check_out_date = values.check_out_date.format('YYYY-MM-DD');
      }
      
      let response;
      if (editingBooking) {
        response = await updateBookingRequest(tenantId!, editingBooking.id, values as BookingRequestUpdate);
        if (response.status) {
          message.success('Booking request updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update booking request');
        }
      } else {
        response = await createBookingRequest(tenantId!, values as BookingRequestCreate);
        if (response.status) {
          message.success('Booking request created successfully');
        } else {
          throw new Error(response.message || 'Failed to create booking request');
        }
      }
      
      setIsModalVisible(false);
      setEditingBooking(null);
      form.resetFields();
      fetchBookingRequests();
    } catch (error: any) {
      console.error('Error saving booking request:', error);
      message.error(error.message || 'Failed to save booking request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBooking(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingBooking(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (booking: BookingRequest) => {
    setEditingBooking(booking);
    const formData = {
      ...booking,
      booking_date: booking.booking_date ? dayjs(booking.booking_date) : undefined,
      check_in_date: booking.check_in_date ? dayjs(booking.check_in_date) : undefined,
      check_out_date: booking.check_out_date ? dayjs(booking.check_out_date) : undefined,
    };
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleDelete = async (bookingId: number) => {
    try {
      setLoading(true);
      const response = await deleteBookingRequest(tenantId!, bookingId);
      if (response.status) {
        message.success('Booking request deleted successfully');
        fetchBookingRequests();
      } else {
        throw new Error(response.message || 'Failed to delete booking request');
      }
    } catch (error: any) {
      console.error('Error deleting booking request:', error);
      message.error(error.message || 'Failed to delete booking request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'default';
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.customer_name || `Customer ${customerId}`;
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { 
      title: 'Customer', 
      dataIndex: 'customer_id', 
      key: 'customer_id', 
      width: 150,
      render: (customerId: number) => getCustomerName(customerId)
    },
    { 
      title: 'Mobile', 
      dataIndex: 'mobile_number', 
      key: 'mobile_number', 
      width: 120 
    },
    { 
      title: 'Booking Date', 
      dataIndex: 'booking_date', 
      key: 'booking_date', 
      width: 150,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    { 
      title: 'Check-in', 
      dataIndex: 'check_in_date', 
      key: 'check_in_date', 
      width: 100,
      render: (date: string) => date ? dayjs(date).format('MM-DD') : '-'
    },
    { 
      title: 'Check-out', 
      dataIndex: 'check_out_date', 
      key: 'check_out_date', 
      width: 100,
      render: (date: string) => date ? dayjs(date).format('MM-DD') : '-'
    },
    { 
      title: 'Channel', 
      dataIndex: 'request_channel', 
      key: 'request_channel', 
      width: 120 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: BookingRequest) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this booking request?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
      >
        Add Booking Request
      </Button>
      <Table
        columns={columns}
        dataSource={bookingRequests}
        rowKey="id"
        loading={loading}
        bordered
        scroll={{ x: 1400 }}
      />
      <Modal
        title={editingBooking ? 'Edit Booking Request' : 'Add Booking Request'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical" name="booking_form">
          <Form.Item
            name="customer_id"
            label="Customer"
            rules={[{ required: true, message: 'Please select a customer!' }]}
          >
            <Select placeholder="Select customer" showSearch>
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.customer_name} ({customer.phone_number})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="mobile_number"
            label="Mobile Number"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="booking_date"
            label="Booking Date"
            rules={[{ required: true, message: 'Please select booking date!' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="check_in_date"
            label="Check-in Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="check_out_date"
            label="Check-out Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="request_channel"
            label="Request Channel"
          >
            <Select placeholder="Select request channel">
              {requestChannels.map(channel => (
                <Option key={channel.value} value={channel.value}>{channel.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            initialValue="requested"
          >
            <Select placeholder="Select status">
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="note"
            label="Note"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingRequestsPage;
