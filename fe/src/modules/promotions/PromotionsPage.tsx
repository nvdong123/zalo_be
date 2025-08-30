import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, InputNumber,
  DatePicker, Switch, Popconfirm, Typography, Row, Col, Tag, Progress, Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../../utils/request';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useTenantContext } from '../../hooks/useTenantContext';

const { Title, Text } = Typography;

interface Promotion {
  id: number;
  tenant_id: number;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  min_booking_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  current_usage?: number;
  created_at: string;
  updated_at: string;
}

const PromotionsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  const { data: promotions, isLoading, refetch } = useQuery({
    queryKey: ['promotions', tenantId],
    queryFn: () => get<Promotion[]>(`/api/v1/promotions?tenant_id=${tenantId}`),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => post(`/api/v1/promotions?tenant_id=${tenantId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', tenantId] });
      message.success('Promotion created successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      put(`/api/v1/promotions/${id}?tenant_id=${tenantId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', tenantId] });
      message.success('Promotion updated successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/api/v1/promotions/${id}?tenant_id=${tenantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', tenantId] });
      message.success('Promotion deleted successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPromotion(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Format dates
      if (values.start_date) {
        values.start_date = values.start_date.format('YYYY-MM-DD');
      }
      if (values.end_date) {
        values.end_date = values.end_date.format('YYYY-MM-DD');
      }
      
      if (editingPromotion) {
        updateMutation.mutate({ id: editingPromotion.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Calculate time remaining for countdown
  const getTimeRemaining = (endDate: string) => {
    const now = dayjs();
    const end = dayjs(endDate);
    const diff = end.diff(now);
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const columns: ColumnsType<Promotion> = [
    {
      title: 'Promotion',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Promotion) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.discount_type === 'percentage'
              ? `${record.discount_value}% off`
              : `$${record.discount_value} off`}
          </div>
        </div>
      ),
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record: Promotion) => (
        <div>
          <div>{dayjs(record.start_date).format('MMM DD')} - {dayjs(record.end_date).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: 12, color: dayjs().isAfter(record.end_date) ? 'red' : '#1890ff' }}>
            <ClockCircleOutlined /> {getTimeRemaining(record.end_date)}
          </div>
        </div>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record: Promotion) => {
        if (!record.usage_limit) return '-';
        const usage = record.current_usage || 0;
        const percent = (usage / record.usage_limit) * 100;
        return (
          <div style={{ minWidth: 120 }}>
            <Progress
              percent={percent}
              size="small"
              format={() => `${usage}/${record.usage_limit}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: Promotion) => {
        const isExpired = dayjs().isAfter(record.end_date);
        const color = isExpired ? 'error' : isActive ? 'success' : 'default';
        const text = isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Promotion) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPromotion(record);
              form.setFieldsValue({
                ...record,
                start_date: dayjs(record.start_date),
                end_date: dayjs(record.end_date),
              });
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete promotion?"
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
            <Title level={3} style={{ margin: 0 }}>Promotion Management</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Add Promotion
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={promotions || []}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingPromotion ? 'Edit Promotion' : 'Create Promotion'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ is_active: true, discount_type: 'percentage' }}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discount_type"
                label="Discount Type"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: 'Percentage', value: 'percentage' },
                    { label: 'Fixed Amount', value: 'fixed' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discount_value"
                label="Discount Value"
                rules={[{ required: true, message: 'Please enter discount value' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="end_date"
                label="End Date"
                rules={[{ required: true, message: 'Please select end date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_booking_amount" label="Min Booking Amount">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="usage_limit" label="Usage Limit">
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="is_active" valuePropName="checked" label="Active">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionsPage;
