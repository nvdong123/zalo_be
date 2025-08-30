import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, InputNumber,
  Select, Switch, Popconfirm, Typography, Row, Col, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../../utils/request';
import { message } from 'antd';

const { Title } = Typography;

interface Service {
  id: number;
  tenant_id: number;
  service_name: string;
  service_type: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

const ServicesPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: () => get<Service[]>('/api/v1/services'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => post('/api/v1/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      message.success('Service created successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      put(`/api/v1/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      message.success('Service updated successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/api/v1/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      message.success('Service deleted successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingService(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingService) {
        updateMutation.mutate({ id: editingService.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const columns: ColumnsType<Service> = [
    {
      title: 'Service Name',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (text: string, record: Service) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Tag color="blue">{record.service_type}</Tag>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price?.toLocaleString()}`,
    },
    {
      title: 'Duration',
      dataIndex: 'duration_minutes',
      key: 'duration_minutes',
      render: (minutes: number) => minutes ? `${minutes} min` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'is_available',
      key: 'is_available',
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'success' : 'error'}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Service) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingService(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete service?"
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
            <Title level={3} style={{ margin: 0 }}>Service Management</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Add Service
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={services || []}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingService ? 'Edit Service' : 'Create Service'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ is_available: true }}>
          <Form.Item
            name="service_name"
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="service_type"
            label="Service Type"
            rules={[{ required: true, message: 'Please select service type' }]}
          >
            <Select
              options={[
                { label: 'Spa', value: 'Spa' },
                { label: 'Restaurant', value: 'Restaurant' },
                { label: 'Fitness', value: 'Fitness' },
                { label: 'Cleaning', value: 'Cleaning' },
                { label: 'Transportation', value: 'Transportation' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration_minutes" label="Duration (minutes)">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="is_available" valuePropName="checked" label="Available">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicesPage;
