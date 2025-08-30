import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, InputNumber, 
  Switch, Popconfirm, Typography, Row, Col, Tag, Select, List
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePlansQuery, useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation } from './hooks';
import type { SubscriptionPlan, CreatePlanRequest, PlansQueryParams } from './hooks';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const PlansPage: React.FC = () => {
  const [queryParams, setQueryParams] = useState<PlansQueryParams>({
    page: 1,
    size: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form] = Form.useForm();
  const [features, setFeatures] = useState<string[]>([]);

  // Queries and mutations
  const { data: plansData, isLoading, refetch } = usePlansQuery(queryParams);
  const createPlanMutation = useCreatePlanMutation();
  const updatePlanMutation = useUpdatePlanMutation();
  const deletePlanMutation = useDeletePlanMutation();

  // Handle table pagination and filtering
  const handleTableChange = (pagination: any, filters: any) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current,
      size: pagination.pageSize,
      is_active: filters.is_active?.[0],
    }));
  };

  // Handle search
  const handleSearch = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      page: 1,
      search: value || undefined,
    }));
  };

  // Modal handlers
  const showCreateModal = () => {
    setEditingPlan(null);
    setFeatures([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFeatures(plan.features || []);
    form.setFieldsValue({
      ...plan,
      features: plan.features?.join('\n') || '',
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPlan(null);
    setFeatures([]);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const featuresArray = values.features ? values.features.split('\n').filter((f: string) => f.trim()) : [];
      
      const planData: CreatePlanRequest = {
        ...values,
        features: featuresArray,
      };

      if (editingPlan) {
        await updatePlanMutation.mutateAsync({
          id: editingPlan.id,
          data: planData,
        });
      } else {
        await createPlanMutation.mutateAsync(planData);
      }

      handleCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    await deletePlanMutation.mutateAsync(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const columns: ColumnsType<SubscriptionPlan> = [
    {
      title: 'Plan Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Monthly Price',
      dataIndex: 'price_monthly',
      key: 'price_monthly',
      render: (price) => formatCurrency(price),
      sorter: true,
    },
    {
      title: 'Yearly Price',
      dataIndex: 'price_yearly',
      key: 'price_yearly',
      render: (price) => price ? formatCurrency(price) : '-',
    },
    {
      title: 'Max Rooms',
      dataIndex: 'max_rooms',
      key: 'max_rooms',
      sorter: true,
    },
    {
      title: 'Max Bookings/Month',
      dataIndex: 'max_bookings_per_month',
      key: 'max_bookings_per_month',
      sorter: true,
    },
    {
      title: 'Features',
      dataIndex: 'features',
      key: 'features',
      render: (features: string[]) => (
        <Space direction="vertical" size="small">
          {features?.slice(0, 2).map((feature, index) => (
            <Tag key={index} color="blue">{feature}</Tag>
          ))}
          {features?.length > 2 && (
            <Tag color="default">+{features.length - 2} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this plan?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Subscription Plans</Title>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showCreateModal}
              >
                Create Plan
              </Button>
            </Space>
          </Col>
        </Row>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={16}>
              <Col span={8}>
                <Search
                  placeholder="Search plans..."
                  allowClear
                  onSearch={handleSearch}
                />
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={plansData?.data || []}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: queryParams.page,
                pageSize: queryParams.size,
                total: plansData?.total || 0,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              onChange={handleTableChange}
            />
          </Space>
        </Card>
      </Space>

      <Modal
        title={editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        confirmLoading={createPlanMutation.isPending || updatePlanMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_active: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Plan Name"
                rules={[{ required: true, message: 'Please enter plan name' }]}
              >
                <Input placeholder="Enter plan name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="Status"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              placeholder="Enter plan description" 
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price_monthly"
                label="Monthly Price ($)"
                rules={[{ required: true, message: 'Please enter monthly price' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price_yearly"
                label="Yearly Price ($) (Optional)"
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="max_rooms"
                label="Maximum Rooms"
                rules={[{ required: true, message: 'Please enter maximum rooms' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Enter max rooms"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="max_bookings_per_month"
                label="Max Bookings/Month"
                rules={[{ required: true, message: 'Please enter max bookings per month' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Enter max bookings"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="features"
            label="Features (one per line)"
          >
            <TextArea 
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3..." 
              rows={6}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlansPage;
