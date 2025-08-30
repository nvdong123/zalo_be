import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getVouchers, createVoucher, updateVoucher, deleteVoucher, Voucher, VoucherCreate, VoucherUpdate } from '../../../api/voucher.api';
import { useTenantScope } from '../../../hooks/useTenantScope';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const VouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();
  const { tenantId } = useTenantScope();

  const discountTypes = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed_amount', label: 'Fixed Amount' },
  ];

  const fetchVouchers = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await getVouchers(tenantId);
      if (res.status && res.result) {
        setVouchers(res.result);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      message.error('Failed to fetch vouchers');
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [tenantId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Convert date range to separate dates
      if (values.dateRange) {
        values.valid_from = values.dateRange[0].format('YYYY-MM-DD');
        values.valid_to = values.dateRange[1].format('YYYY-MM-DD');
        delete values.dateRange;
      }
      
      let response;
      if (editingVoucher) {
        response = await updateVoucher(tenantId!, editingVoucher.id, values as VoucherUpdate);
        if (response.status) {
          message.success('Voucher updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update voucher');
        }
      } else {
        response = await createVoucher(tenantId!, values as VoucherCreate);
        if (response.status) {
          message.success('Voucher created successfully');
        } else {
          throw new Error(response.message || 'Failed to create voucher');
        }
      }
      
      setIsModalVisible(false);
      setEditingVoucher(null);
      form.resetFields();
      fetchVouchers();
    } catch (error: any) {
      console.error('Error saving voucher:', error);
      message.error(error.message || 'Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingVoucher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    const formData = {
      ...voucher,
      dateRange: voucher.valid_from && voucher.valid_to ? [
        dayjs(voucher.valid_from),
        dayjs(voucher.valid_to)
      ] : undefined
    };
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleDelete = async (voucherId: number) => {
    try {
      setLoading(true);
      const response = await deleteVoucher(tenantId!, voucherId);
      if (response.status) {
        message.success('Voucher deleted successfully');
        fetchVouchers();
      } else {
        throw new Error(response.message || 'Failed to delete voucher');
      }
    } catch (error: any) {
      console.error('Error deleting voucher:', error);
      message.error(error.message || 'Failed to delete voucher');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Code', dataIndex: 'voucher_code', key: 'voucher_code', width: 120 },
    { title: 'Name', dataIndex: 'voucher_name', key: 'voucher_name', width: 150 },
    { 
      title: 'Discount', 
      key: 'discount', 
      width: 120,
      render: (_: any, record: Voucher) => (
        <span>
          {record.discount_type === 'percentage' 
            ? `${record.discount_value}%` 
            : `$${record.discount_value}`
          }
        </span>
      )
    },
    { title: 'Min Order', dataIndex: 'min_order_value', key: 'min_order_value', width: 100 },
    { title: 'Usage', key: 'usage', width: 80, render: (_: any, record: Voucher) => `${record.used_count || 0}/${record.usage_limit || '∞'}` },
    { 
      title: 'Valid From', 
      dataIndex: 'valid_from', 
      key: 'valid_from', 
      width: 100,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    { 
      title: 'Valid To', 
      dataIndex: 'valid_to', 
      key: 'valid_to', 
      width: 100,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
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
      render: (_: any, record: Voucher) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this voucher?"
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
        Add Voucher
      </Button>
      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="id"
        loading={loading}
        bordered
        scroll={{ x: 1400 }}
      />
      <Modal
        title={editingVoucher ? 'Edit Voucher' : 'Add Voucher'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical" name="voucher_form">
          <Form.Item
            name="voucher_code"
            label="Voucher Code"
            rules={[{ required: true, message: 'Please input the voucher code!' }]}
          >
            <Input placeholder="e.g., SUMMER2024" />
          </Form.Item>
          <Form.Item
            name="voucher_name"
            label="Voucher Name"
            rules={[{ required: true, message: 'Please input the voucher name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="discount_type"
            label="Discount Type"
            rules={[{ required: true, message: 'Please select discount type!' }]}
          >
            <Select placeholder="Select discount type">
              {discountTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="discount_value"
            label="Discount Value"
            rules={[{ required: true, message: 'Please input the discount value!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="min_order_value"
            label="Minimum Order Value"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="max_discount_amount"
            label="Maximum Discount Amount"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="usage_limit"
            label="Usage Limit"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Valid Period"
            rules={[{ required: true, message: 'Please select valid period!' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="terms_conditions"
            label="Terms & Conditions"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VouchersPage;
