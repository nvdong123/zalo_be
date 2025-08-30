import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, InputNumber,
  DatePicker, Switch, Popconfirm, Typography, Row, Col, Tag, Progress, Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, PercentageOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../../utils/request';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useTenantContext } from '../../hooks/useTenantContext';

const { Title } = Typography;

interface Voucher {
  id: number;
  tenant_id: number;
  code: string;
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
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const VouchersPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  const { data: vouchers, isLoading, refetch } = useQuery({
    queryKey: ['vouchers', tenantId],
    queryFn: () => get<Voucher[]>('/api/v1/vouchers', { params: { tenant_id: tenantId } }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => post('/api/v1/vouchers', { ...data, tenant_id: tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers', tenantId] });
      message.success('Voucher created successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      put(`/api/v1/vouchers/${id}`, { ...data, tenant_id: tenantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers', tenantId] });
      message.success('Voucher updated successfully');
      handleModalCancel();
    },
    onError: (error: any) => message.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/api/v1/vouchers/${id}`, { params: { tenant_id: tenantId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers', tenantId] });
      message.success('Voucher deleted successfully');
    },
    onError: (error: any) => message.error(error.message),
  });

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
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
      
      if (editingVoucher) {
        updateMutation.mutate({ id: editingVoucher.id, data: values });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const generateVoucherCode = () => {
    const code = 'VOUCHER' + Math.random().toString(36).substr(2, 6).toUpperCase();
    form.setFieldsValue({ code });
  };

  const columns: ColumnsType<Voucher> = [
    {
      title: 'Voucher Code',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record: Voucher) => (
        <div>
          <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.title}</div>
        </div>
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, record: Voucher) => (
        <div style={{ textAlign: 'center' }}>
          <PercentageOutlined style={{ color: '#1890ff' }} />
          <div style={{ fontWeight: 'bold' }}>
            {record.discount_type === 'percentage'
              ? `${record.discount_value}%`
              : `$${record.discount_value}`}
          </div>
          {record.max_discount_amount && (
            <div style={{ fontSize: 12, color: '#666' }}>
              Max: ${record.max_discount_amount}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Valid Period',
      key: 'period',
      render: (_, record: Voucher) => (
        <div>
          <div>{dayjs(record.start_date).format('MMM DD')} - {dayjs(record.end_date).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: 12, color: dayjs().isAfter(record.end_date) ? 'red' : '#52c41a' }}>
            {dayjs().isAfter(record.end_date) ? 'Expired' : 'Active'}
          </div>
        </div>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record: Voucher) => {
        if (!record.usage_limit) return <div style={{ textAlign: 'center' }}>Unlimited</div>;
        const usage = record.current_usage || 0;
        const percent = (usage / record.usage_limit) * 100;
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{usage} / {record.usage_limit}</div>
            <div style={{ width: 80, height: 4, backgroundColor: '#f0f0f0', borderRadius: 2 }}>
              <div 
                style={{ 
                  width: `${percent}%`, 
                  height: '100%', 
                  backgroundColor: percent > 80 ? '#ff4d4f' : '#1890ff',
                  borderRadius: 2 
                }} 
              />
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'is_public',
      key: 'is_public',
      render: (isPublic: boolean) => (
        <Tag color={isPublic ? 'blue' : 'orange'}>
          {isPublic ? 'Public' : 'Private'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: Voucher) => {
        const isExpired = dayjs().isAfter(record.end_date);
        const color = isExpired ? 'error' : isActive ? 'success' : 'default';
        const text = isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Voucher) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingVoucher(record);
              form.setFieldsValue({
                ...record,
                start_date: dayjs(record.start_date),
                end_date: dayjs(record.end_date),
              });
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete voucher? This action cannot be undone."
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
            <Title level={3} style={{ margin: 0 }}>Voucher Management</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Add Voucher
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={vouchers || []}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingVoucher ? 'Edit Voucher' : 'Create Voucher'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ is_active: true, is_public: true, discount_type: 'percentage' }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="code"
                label="Voucher Code"
                rules={[{ required: true, message: 'Please enter voucher code' }]}
              >
                <Input placeholder="e.g., SUMMER2024" style={{ fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label=" ">
                <Button onClick={generateVoucherCode} block>
                  Generate Code
                </Button>
              </Form.Item>
            </Col>
          </Row>
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
            <Col span={8}>
              <Form.Item name="min_booking_amount" label="Min Booking Amount">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="max_discount_amount" label="Max Discount">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="usage_limit" label="Usage Limit">
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Unlimited"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="is_public" valuePropName="checked" label="Public Voucher">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" valuePropName="checked" label="Active">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default VouchersPage;
