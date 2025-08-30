import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Tag,
  Row,
  Col,
  Upload,
  Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { promotionApi, tenantApi } from '@/api/backend.api';
import type { Promotion, Tenant } from '@/types/api';
import dayjs from 'dayjs';

const { Column } = Table;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionRead[]>([]);
  const [tenants, setTenants] = useState<TenantRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionRead | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Load promotions
  const loadPromotions = async (tenantId?: number) => {
    if (!tenantId && !selectedTenant) return;
    
    setLoading(true);
    try {
      const response = await promotionApi.getAll(tenantId || selectedTenant!);
      if (response.status) {
        setPromotions(response.result || []);
      } else {
        message.error('Failed to load promotions');
      }
    } catch (error) {
      console.error('Load promotions error:', error);
      message.error('Failed to load promotions');
    }
    setLoading(false);
  };

  // Load tenants
  const loadTenants = async () => {
    try {
      const response = await tenantApi.getAll();
      if (response.status) {
        setTenants(response.result || []);
        if (response.result && response.result.length > 0) {
          setSelectedTenant(response.result[0].id);
        }
      }
    } catch (error) {
      console.error('Load tenants error:', error);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadPromotions(selectedTenant);
    }
  }, [selectedTenant]);

  // Handle create/edit
  const handleSubmit = async (values: any) => {
    if (!selectedTenant) {
      message.error('Please select a tenant first');
      return;
    }

    try {
      const promotionData: PromotionCreate = {
        ...values,
        tenant_id: selectedTenant,
        start_date: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      };

      // Remove dateRange from the data as it's not part of the API
      delete (promotionData as any).dateRange;

      if (editingPromotion) {
        await promotionApi.update(editingPromotion.id, promotionData, selectedTenant);
        message.success('Promotion updated successfully');
      } else {
        await promotionApi.create(promotionData, selectedTenant);
        message.success('Promotion created successfully');
      }
      
      setModalVisible(false);
      setEditingPromotion(null);
      form.resetFields();
      loadPromotions();
    } catch (error) {
      console.error('Save promotion error:', error);
      message.error('Failed to save promotion');
    }
  };

  // Handle delete
  const handleDelete = async (promotion: PromotionRead) => {
    Modal.confirm({
      title: 'Delete Promotion',
      content: `Are you sure you want to delete promotion "${promotion.title}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await promotionApi.delete(promotion.id, selectedTenant!);
          message.success('Promotion deleted successfully');
          loadPromotions();
        } catch (error) {
          console.error('Delete promotion error:', error);
          message.error('Failed to delete promotion');
        }
      },
    });
  };

  // Handle edit
  const handleEdit = (promotion: PromotionRead) => {
    setEditingPromotion(promotion);
    const formData = {
      ...promotion,
      dateRange: promotion.start_date && promotion.end_date ? [
        dayjs(promotion.start_date),
        dayjs(promotion.end_date)
      ] : undefined
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  // Handle create new
  const handleCreate = () => {
    if (!selectedTenant) {
      message.error('Please select a tenant first');
      return;
    }
    setEditingPromotion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'orange';
      case 'expired': return 'volcano';
      default: return 'default';
    }
  };

  const isPromotionActive = (promotion: PromotionRead) => {
    if (!promotion.start_date || !promotion.end_date) return false;
    const now = dayjs();
    const start = dayjs(promotion.start_date);
    const end = dayjs(promotion.end_date);
    return now.isAfter(start) && now.isBefore(end);
  };

  return (
    <Card>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <h2>Promotion Management</h2>
        </Col>
        <Col>
          <Select
            value={selectedTenant}
            onChange={setSelectedTenant}
            style={{ width: 200, marginRight: 16 }}
            placeholder="Select Hotel"
          >
            {tenants.map(tenant => (
              <Option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
            disabled={!selectedTenant}
          >
            Add New Promotion
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={promotions}
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
          title="Title"
          dataIndex="title"
          key="title"
          render={(text: string) => <strong>{text}</strong>}
        />
        
        <Column
          title="Description"
          dataIndex="description"
          key="description"
          ellipsis={{ showTitle: false }}
          render={(text: string) => (
            text ? (
              <span title={text}>
                {text.length > 50 ? `${text.slice(0, 50)}...` : text}
              </span>
            ) : '-'
          )}
        />
        
        <Column
          title="Period"
          key="period"
          render={(_, record: PromotionRead) => (
            <div>
              {record.start_date && record.end_date ? (
                <>
                  <div>{dayjs(record.start_date).format('MMM DD, YYYY')}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    to {dayjs(record.end_date).format('MMM DD, YYYY')}
                  </div>
                </>
              ) : '-'}
            </div>
          )}
        />
        
        <Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(status: string, record: PromotionRead) => (
            <Space direction="vertical" size="small">
              <Tag color={getStatusColor(status)}>
                {status?.toUpperCase()}
              </Tag>
              {isPromotionActive(record) && (
                <Tag color="blue" style={{ fontSize: '10px' }}>
                  CURRENTLY ACTIVE
                </Tag>
              )}
            </Space>
          )}
        />
        
        <Column
          title="Banner"
          dataIndex="banner_image"
          key="banner_image"
          width={100}
          render={(url: string) => (
            url ? (
              <Image
                width={60}
                height={40}
                src={url}
                style={{ objectFit: 'cover' }}
                preview={{ mask: <EyeOutlined /> }}
              />
            ) : '-'
          )}
        />
        
        <Column
          title="Actions"
          key="actions"
          width={150}
          render={(_, record: PromotionRead) => (
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
        title={editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPromotion(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter promotion title' }]}
          >
            <Input placeholder="Summer Sale 2024" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              rows={4} 
              placeholder="Describe your promotion details, terms and conditions..." 
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Promotion Period"
                rules={[{ required: true, message: 'Please select promotion period' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="active"
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="expired">Expired</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="banner_image"
            label="Banner Image URL"
          >
            <Input placeholder="https://example.com/banner.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PromotionManagement;
