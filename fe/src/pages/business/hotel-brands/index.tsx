import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getHotelBrands, createHotelBrand, updateHotelBrand, deleteHotelBrand, HotelBrand, HotelBrandCreate, HotelBrandUpdate } from '../../../api/hotel.brand.api';
import { useTenantScope } from '../../../hooks/useTenantScope'; // Assuming this hook provides the tenantId

const HotelBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<HotelBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<HotelBrand | null>(null);
  const [form] = Form.useForm();
  const { tenantId } = useTenantScope(); // Get the current tenant ID

  const fetchBrands = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await getHotelBrands(tenantId);
      // Backend API returns array directly in result field
      if (res.status && res.result) {
        setBrands(res.result);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching hotel brands:', error);
      message.error('Failed to fetch hotel brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [tenantId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      let response;
      if (editingBrand) {
        response = await updateHotelBrand(tenantId!, editingBrand.id, values as HotelBrandUpdate);
        if (response.status) {
          message.success('Brand updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update brand');
        }
      } else {
        response = await createHotelBrand(tenantId!, values as HotelBrandCreate);
        if (response.status) {
          message.success('Brand created successfully');
        } else {
          throw new Error(response.message || 'Failed to create brand');
        }
      }
      
      setIsModalVisible(false);
      setEditingBrand(null);
      form.resetFields();
      fetchBrands(); // Refresh the list
    } catch (error: any) {
      console.error('Error saving brand:', error);
      message.error(error.message || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBrand(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setEditingBrand(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (brand: HotelBrand) => {
    setEditingBrand(brand);
    form.setFieldsValue(brand);
    setIsModalVisible(true);
  };

  const handleDelete = async (brandId: number) => {
    try {
      setLoading(true);
      const response = await deleteHotelBrand(tenantId!, brandId);
      if (response.status) {
        message.success('Brand deleted successfully');
        fetchBrands(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to delete brand');
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      message.error(error.message || 'Failed to delete brand');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Hotel Name', dataIndex: 'hotel_name', key: 'hotel_name' },
    { title: 'Slogan', dataIndex: 'slogan', key: 'slogan' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: HotelBrand) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this brand?"
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
        Add Hotel Brand
      </Button>
      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        bordered
      />
      <Modal
        title={editingBrand ? 'Edit Hotel Brand' : 'Add Hotel Brand'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" name="brand_form">
          <Form.Item
            name="hotel_name"
            label="Hotel Name"
            rules={[{ required: true, message: 'Please input the hotel name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="slogan"
            label="Slogan"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
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
            name="phone_number"
            label="Phone Number"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HotelBrandsPage;
