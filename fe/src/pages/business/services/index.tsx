import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Switch, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getServices, createService, updateService, deleteService, Service, ServiceCreate, ServiceUpdate } from '../../../api/service.api';
import { useTenantScope } from '../../../hooks/useTenantScope';

const { Option } = Select;

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();
  const { tenantId } = useTenantScope();

  const serviceCategories = [
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'room_service', label: 'Room Service' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'tour_guide', label: 'Tour Guide' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'business', label: 'Business Services' },
    { value: 'other', label: 'Other' },
  ];

  const fetchServices = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await getServices(tenantId);
      if (res.status && res.result) {
        setServices(res.result);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [tenantId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      let response;
      if (editingService) {
        response = await updateService(tenantId!, editingService.id, values as ServiceUpdate);
        if (response.status) {
          message.success('Service updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update service');
        }
      } else {
        response = await createService(tenantId!, values as ServiceCreate);
        if (response.status) {
          message.success('Service created successfully');
        } else {
          throw new Error(response.message || 'Failed to create service');
        }
      }
      
      setIsModalVisible(false);
      setEditingService(null);
      form.resetFields();
      fetchServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      message.error(error.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingService(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue(service);
    setIsModalVisible(true);
  };

  const handleDelete = async (serviceId: number) => {
    try {
      setLoading(true);
      const response = await deleteService(tenantId!, serviceId);
      if (response.status) {
        message.success('Service deleted successfully');
        fetchServices();
      } else {
        throw new Error(response.message || 'Failed to delete service');
      }
    } catch (error: any) {
      console.error('Error deleting service:', error);
      message.error(error.message || 'Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Service Name', dataIndex: 'service_name', key: 'service_name', width: 200 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 120 },
    { 
      title: 'Price', 
      dataIndex: 'price', 
      key: 'price', 
      width: 100,
      render: (price: number) => price ? `$${price}` : '-'
    },
    { 
      title: 'Duration', 
      dataIndex: 'duration_minutes', 
      key: 'duration_minutes', 
      width: 100,
      render: (minutes: number) => minutes ? `${minutes} min` : '-'
    },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { 
      title: 'Status', 
      dataIndex: 'is_active', 
      key: 'is_active', 
      width: 80,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 150,
      render: (_: any, record: Service) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this service?"
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
        Add Service
      </Button>
      <Table
        columns={columns}
        dataSource={services}
        rowKey="id"
        loading={loading}
        bordered
        scroll={{ x: 1200 }}
      />
      <Modal
        title={editingService ? 'Edit Service' : 'Add Service'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical" name="service_form">
          <Form.Item
            name="service_name"
            label="Service Name"
            rules={[{ required: true, message: 'Please input the service name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
          >
            <Select placeholder="Select service category">
              {serviceCategories.map(category => (
                <Option key={category.value} value={category.value}>{category.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price ($)"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="duration_minutes"
            label="Duration (minutes)"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicesPage;
