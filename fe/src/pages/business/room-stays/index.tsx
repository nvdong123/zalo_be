import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoomStays, createRoomStay, updateRoomStay, deleteRoomStay, RoomStay, RoomStayCreate, RoomStayUpdate } from '../../../api/room-stay.api';
import { getCustomers } from '../../../api/customer.api';
import { useTenantScope } from '../../../hooks/useTenantScope';
import dayjs from 'dayjs';

const { Option } = Select;

const RoomStaysPage: React.FC = () => {
  const [roomStays, setRoomStays] = useState<RoomStay[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStay, setEditingStay] = useState<RoomStay | null>(null);
  const [form] = Form.useForm();
  const { tenantId } = useTenantScope();

  const stayStatusOptions = [
    { value: 'reserved', label: 'Reserved', color: 'blue' },
    { value: 'checked_in', label: 'Checked In', color: 'green' },
    { value: 'checked_out', label: 'Checked Out', color: 'purple' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'orange' },
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'refunded', label: 'Refunded', color: 'red' },
  ];

  const fetchRoomStays = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await getRoomStays(tenantId);
      if (res.status && res.result) {
        setRoomStays(res.result);
      } else {
        setRoomStays([]);
      }
    } catch (error) {
      console.error('Error fetching room stays:', error);
      message.error('Failed to fetch room stays');
      setRoomStays([]);
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
    fetchRoomStays();
    fetchCustomers();
  }, [tenantId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Convert dates to strings
      if (values.checkin_date) {
        values.checkin_date = values.checkin_date.format('YYYY-MM-DD');
      }
      if (values.checkout_date) {
        values.checkout_date = values.checkout_date.format('YYYY-MM-DD');
      }
      if (values.actual_checkin) {
        values.actual_checkin = values.actual_checkin.format('YYYY-MM-DD HH:mm:ss');
      }
      if (values.actual_checkout) {
        values.actual_checkout = values.actual_checkout.format('YYYY-MM-DD HH:mm:ss');
      }
      
      let response;
      if (editingStay) {
        response = await updateRoomStay(tenantId!, editingStay.id, values as RoomStayUpdate);
        if (response.status) {
          message.success('Room stay updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update room stay');
        }
      } else {
        response = await createRoomStay(tenantId!, values as RoomStayCreate);
        if (response.status) {
          message.success('Room stay created successfully');
        } else {
          throw new Error(response.message || 'Failed to create room stay');
        }
      }
      
      setIsModalVisible(false);
      setEditingStay(null);
      form.resetFields();
      fetchRoomStays();
    } catch (error: any) {
      console.error('Error saving room stay:', error);
      message.error(error.message || 'Failed to save room stay');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStay(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingStay(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (stay: RoomStay) => {
    setEditingStay(stay);
    const formData = {
      ...stay,
      checkin_date: stay.checkin_date ? dayjs(stay.checkin_date) : undefined,
      checkout_date: stay.checkout_date ? dayjs(stay.checkout_date) : undefined,
      actual_checkin: stay.actual_checkin ? dayjs(stay.actual_checkin) : undefined,
      actual_checkout: stay.actual_checkout ? dayjs(stay.actual_checkout) : undefined,
    };
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleDelete = async (stayId: number) => {
    try {
      setLoading(true);
      const response = await deleteRoomStay(tenantId!, stayId);
      if (response.status) {
        message.success('Room stay deleted successfully');
        fetchRoomStays();
      } else {
        throw new Error(response.message || 'Failed to delete room stay');
      }
    } catch (error: any) {
      console.error('Error deleting room stay:', error);
      message.error(error.message || 'Failed to delete room stay');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, type: 'stay' | 'payment') => {
    const options = type === 'stay' ? stayStatusOptions : paymentStatusOptions;
    const statusOption = options.find(opt => opt.value === status);
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
      render: (customerId: number) => customerId ? getCustomerName(customerId) : '-'
    },
    { title: 'Room ID', dataIndex: 'room_id', key: 'room_id', width: 80 },
    { title: 'Booking ID', dataIndex: 'booking_request_id', key: 'booking_request_id', width: 100 },
    { 
      title: 'Check-in', 
      dataIndex: 'checkin_date', 
      key: 'checkin_date', 
      width: 100,
      render: (date: string) => date ? dayjs(date).format('MM-DD') : '-'
    },
    { 
      title: 'Check-out', 
      dataIndex: 'checkout_date', 
      key: 'checkout_date', 
      width: 100,
      render: (date: string) => date ? dayjs(date).format('MM-DD') : '-'
    },
    { 
      title: 'Actual In', 
      dataIndex: 'actual_checkin', 
      key: 'actual_checkin', 
      width: 120,
      render: (date: string) => date ? dayjs(date).format('MM-DD HH:mm') : '-'
    },
    { 
      title: 'Actual Out', 
      dataIndex: 'actual_checkout', 
      key: 'actual_checkout', 
      width: 120,
      render: (date: string) => date ? dayjs(date).format('MM-DD HH:mm') : '-'
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status, 'stay')}>
          {status?.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    { 
      title: 'Payment', 
      dataIndex: 'payment_status', 
      key: 'payment_status', 
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status, 'payment')}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    { 
      title: 'Amount', 
      dataIndex: 'total_amount', 
      key: 'total_amount', 
      width: 100,
      render: (amount: number) => amount ? `$${amount}` : '-'
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: RoomStay) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this room stay?"
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
        Add Room Stay
      </Button>
      <Table
        columns={columns}
        dataSource={roomStays}
        rowKey="id"
        loading={loading}
        bordered
        scroll={{ x: 1500 }}
      />
      <Modal
        title={editingStay ? 'Edit Room Stay' : 'Add Room Stay'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical" name="stay_form">
          <Form.Item
            name="customer_id"
            label="Customer"
          >
            <Select placeholder="Select customer" showSearch allowClear>
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.customer_name} ({customer.phone_number})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="room_id"
            label="Room ID"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="booking_request_id"
            label="Booking Request ID"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="checkin_date"
            label="Check-in Date"
            rules={[{ required: true, message: 'Please select check-in date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="checkout_date"
            label="Check-out Date"
            rules={[{ required: true, message: 'Please select check-out date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="actual_checkin"
            label="Actual Check-in"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="actual_checkout"
            label="Actual Check-out"
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            initialValue="reserved"
          >
            <Select placeholder="Select status">
              {stayStatusOptions.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="payment_status"
            label="Payment Status"
            initialValue="pending"
          >
            <Select placeholder="Select payment status">
              {paymentStatusOptions.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="total_amount"
            label="Total Amount ($)"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomStaysPage;
