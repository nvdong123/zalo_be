import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, message, Modal, Form, Input, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { tenantApi } from '@/api/backend.api';
import type { Tenant } from '@/types/api';

const { Column } = Table;
const { Option } = Select;

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantRead | null>(null);
  const [form] = Form.useForm();

  // Load tenants
  const loadTenants = async () => {
    setLoading(true);
    try {
      const response = await tenantApi.getAll();
      if (response.status) {
        setTenants(response.result || []);
      } else {
        message.error('Failed to load tenants');
      }
    } catch (error) {
      console.error('Load tenants error:', error);
      message.error('Failed to load tenants');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Handle create/edit
  const handleSubmit = async (values: TenantCreate) => {
    try {
      if (editingTenant) {
        await tenantApi.update(editingTenant.id, values);
        message.success('Tenant updated successfully');
      } else {
        await tenantApi.create(values);
        message.success('Tenant created successfully');
      }
      
      setModalVisible(false);
      setEditingTenant(null);
      form.resetFields();
      loadTenants();
    } catch (error) {
      console.error('Save tenant error:', error);
      message.error('Failed to save tenant');
    }
  };

  // Handle delete
  const handleDelete = async (tenant: TenantRead) => {
    Modal.confirm({
      title: 'Delete Tenant',
      content: `Are you sure you want to delete "${tenant.name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await tenantApi.delete(tenant.id);
          message.success('Tenant deleted successfully');
          loadTenants();
        } catch (error) {
          console.error('Delete tenant error:', error);
          message.error('Failed to delete tenant');
        }
      },
    });
  };

  // Handle edit
  const handleEdit = (tenant: TenantRead) => {
    setEditingTenant(tenant);
    form.setFieldsValue(tenant);
    setModalVisible(true);
  };

  // Handle create new
  const handleCreate = () => {
    setEditingTenant(null);
    form.resetFields();
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'orange';
      default: return 'default';
    }
  };

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Hotel Tenants Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add New Tenant
        </Button>
      </div>

      <Table
        dataSource={tenants}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      >
        <Column
          title="ID"
          dataIndex="id"
          key="id"
          width={80}
        />
        
        <Column
          title="Hotel Name"
          dataIndex="name"
          key="name"
          render={(text: string) => <strong>{text}</strong>}
        />
        
        <Column
          title="Domain"
          dataIndex="domain"
          key="domain"
          render={(text: string) => (
            <a href={`https://${text}`} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          )}
        />
        
        <Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(status: string) => (
            <Tag color={getStatusColor(status)}>
              {status?.toUpperCase()}
            </Tag>
          )}
        />
        
        <Column
          title="Created"
          dataIndex="created_at"
          key="created_at"
          render={(date: string) => new Date(date).toLocaleDateString()}
        />
        
        <Column
          title="Actions"
          key="actions"
          width={150}
          render={(_, record: TenantRead) => (
            <Space>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Edit
              </Button>
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              >
                Delete
              </Button>
            </Space>
          )}
        />
      </Table>

      <Modal
        title={editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTenant(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Hotel Name"
            rules={[{ required: true, message: 'Please enter hotel name' }]}
          >
            <Input placeholder="Enter hotel name" />
          </Form.Item>

          <Form.Item
            name="domain"
            label="Domain"
            rules={[
              { required: true, message: 'Please enter domain' },
              { pattern: /^[a-zA-Z0-9.-]+$/, message: 'Invalid domain format' }
            ]}
          >
            <Input placeholder="hotel.com" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="active"
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TenantManagement;
