import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, Customer, CustomerCreate, CustomerUpdate } from '../../../api/customer.api';
import { useTenantScope } from '../../../hooks/useTenantScope';
import dayjs from 'dayjs';

const { Option } = Select;

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const { tenantId } = useTenantScope();

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const membershipLevels = [
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'diamond', label: 'Diamond' },
  ];

  const fetchCustomers = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await getCustomers(tenantId);
      if (res.status && res.result) {
        setCustomers(res.result);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [tenantId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Convert date to string if exists
      if (values.date_of_birth) {
        values.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
      }
      
      let response;
      if (editingCustomer) {
        response = await updateCustomer(tenantId!, editingCustomer.id, values as CustomerUpdate);
        if (response.status) {
          message.success('Customer updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update customer');
        }
      } else {
        response = await createCustomer(tenantId!, values as CustomerCreate);
        if (response.status) {
          message.success('Customer created successfully');
        } else {
          throw new Error(response.message || 'Failed to create customer');
        }
      }
      
      setIsModalVisible(false);
      setEditingCustomer(null);
      form.resetFields();
      fetchCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      message.error(error.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    const formData = {
      ...customer,
      date_of_birth: customer.date_of_birth ? dayjs(customer.date_of_birth) : undefined
    };
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleDelete = async (customerId: number) => {
    try {
      setLoading(true);
      const response = await deleteCustomer(tenantId!, customerId);
      if (response.status) {
        message.success('Customer deleted successfully');
        fetchCustomers();
      } else {
        throw new Error(response.message || 'Failed to delete customer');
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      message.error(error.message || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'customer_name', key: 'customer_name', width: 150 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 200 },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number', width: 120 },
    { title: 'City', dataIndex: 'city', key: 'city', width: 100 },
    { title: 'Membership', dataIndex: 'membership_level', key: 'membership_level', width: 100 },
    { title: 'Points', dataIndex: 'loyalty_points', key: 'loyalty_points', width: 80 },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: Customer) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this customer?"
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
        Add Customer
      </Button>
      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        bordered
        scroll={{ x: 1200 }}
      />
      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical" name="customer_form">
          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please input the customer name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label="Phone Number"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="City"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="country"
            label="Country"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date_of_birth"
            label="Date of Birth"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
          >
            <Select placeholder="Select gender">
              {genderOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="membership_level"
            label="Membership Level"
          >
            <Select placeholder="Select membership level">
              {membershipLevels.map(level => (
                <Option key={level.value} value={level.value}>{level.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="loyalty_points"
            label="Loyalty Points"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
