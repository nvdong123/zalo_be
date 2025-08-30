import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, 
  Select, Switch, Popconfirm, Typography, Row, Col, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../../utils/request';
import { message } from 'antd';

const { Title } = Typography;
const { Search } = Input;

interface Tenant {
  id: number;
  name: string;
  description?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TenantsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch tenants
  const { data: tenants, isLoading, refetch } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => get<Tenant[]>('/api/v1/tenants'),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => post('/api/v1/tenants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      message.success('Tenant created successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      put(`/api/v1/tenants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      message.success('Tenant updated successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/api/v1/tenants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      message.success('Tenant deleted successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTenant(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTenant) {
        updateMutation.mutate({ id: editingTenant.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const columns: ColumnsType<Tenant> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Tenant) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.email && (
            <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Tenant) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTenant(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete tenant?"
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
            <Title level={3} style={{ margin: 0 }}>Tenant Management</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Add Tenant
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={tenants || []}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingTenant ? 'Edit Tenant' : 'Create Tenant'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="is_active" valuePropName="checked" label="Active">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantsPage;
