import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, InputNumber, 
  Switch, Popconfirm, Typography, Row, Col, Tag, Select
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, 
  ToolOutlined, CoffeeOutlined, WifiOutlined, CarOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  useFacilitiesQuery, 
  useCreateFacilityMutation, 
  useUpdateFacilityMutation, 
  useDeleteFacilityMutation,
  FacilitiesQueryParams
} from './hooks';
import type { Facility } from '../../api/facilities.api';
import type { CreateFacilityRequest } from './hooks';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

const facilityTypeIcons = {
  AMENITY: <WifiOutlined />,
  SERVICE: <CoffeeOutlined />,
  EQUIPMENT: <ToolOutlined />,
};

const facilityTypeColors = {
  AMENITY: 'blue',
  SERVICE: 'green',
  EQUIPMENT: 'orange',
};

const FacilitiesPage: React.FC = () => {
  const [queryParams, setQueryParams] = useState<FacilitiesQueryParams>({
    skip: 0,
    limit: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [form] = Form.useForm();

  // Queries and mutations
  const { data: facilitiesData, isLoading, refetch } = useFacilitiesQuery(queryParams);
  const createFacilityMutation = useCreateFacilityMutation();
  const updateFacilityMutation = useUpdateFacilityMutation();
  const deleteFacilityMutation = useDeleteFacilityMutation();

  // Handle table pagination and filtering
  const handleTableChange = (pagination: any, filters: any) => {
    setQueryParams(prev => ({
      ...prev,
      skip: (pagination.current - 1) * pagination.pageSize,
      limit: pagination.pageSize,
      category: filters.category?.[0],
      is_available: filters.is_available?.[0],
    }));
  };

  // Handle search
  const handleSearch = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      skip: 0,
      search: value || undefined,
    }));
  };

  // Modal handlers
  const showCreateModal = () => {
    setEditingFacility(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    form.setFieldsValue(facility);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingFacility(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const facilityData: CreateFacilityRequest = {
        ...values,
        price_per_hour: values.booking_required ? values.price_per_hour : undefined,
      };

      if (editingFacility) {
        await updateFacilityMutation.mutateAsync({
          id: editingFacility.id,
          ...facilityData,
        });
      } else {
        await createFacilityMutation.mutateAsync(facilityData);
      }

      handleCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteFacilityMutation.mutateAsync(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const columns: ColumnsType<Facility> = [
    {
      title: 'Name',
      dataIndex: 'facility_name',
      key: 'facility_name',
      sorter: true,
    },
    {
      title: 'Type',
      dataIndex: 'facility_type',
      key: 'facility_type',
      filters: [
        { text: 'Spa', value: 'spa' },
        { text: 'Gym', value: 'gym' },
        { text: 'Pool', value: 'pool' },
        { text: 'Restaurant', value: 'restaurant' },
        { text: 'Conference', value: 'conference' },
        { text: 'Parking', value: 'parking' },
        { text: 'Other', value: 'other' },
      ],
      render: (facilityType: string) => (
        <Tag color="blue">
          {facilityType?.charAt(0).toUpperCase() + facilityType?.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Price',
      key: 'pricing',
      render: (_, record) => {
        if (!record.booking_required) {
          return <Tag color="green">Free</Tag>;
        }
        return record.price_per_hour ? formatCurrency(record.price_per_hour) : 'TBD';
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_available',
      key: 'is_available',
      filters: [
        { text: 'Available', value: true },
        { text: 'Unavailable', value: false },
      ],
      render: (isAvailable) => (
        <Tag color={isAvailable ? 'green' : 'red'}>
          {isAvailable ? 'Available' : 'Unavailable'}
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
            title="Are you sure you want to delete this facility?"
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
            <Title level={2}>Facilities Management</Title>
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
                Add Facility
              </Button>
            </Space>
          </Col>
        </Row>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={16}>
              <Col span={8}>
                <Search
                  placeholder="Search facilities..."
                  allowClear
                  onSearch={handleSearch}
                />
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={facilitiesData || []}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: Math.floor((queryParams.skip || 0) / (queryParams.limit || 10)) + 1,
                pageSize: queryParams.limit || 10,
                total: facilitiesData?.length || 0,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              onChange={handleTableChange}
            />
          </Space>
        </Card>
      </Space>

      <Modal
        title={editingFacility ? 'Edit Facility' : 'Add Facility'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        confirmLoading={createFacilityMutation.isPending || updateFacilityMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_available: true,
            is_chargeable: false,
            type: 'AMENITY',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Facility Name"
                rules={[{ required: true, message: 'Please enter facility name' }]}
              >
                <Input placeholder="Enter facility name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select facility type">
                  <Option value="AMENITY">Amenity</Option>
                  <Option value="SERVICE">Service</Option>
                  <Option value="EQUIPMENT">Equipment</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              placeholder="Enter facility description..." 
              rows={3}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="is_chargeable"
                label="Pricing"
                valuePropName="checked"
              >
                <Switch checkedChildren="Chargeable" unCheckedChildren="Free" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_available"
                label="Availability"
                valuePropName="checked"
              >
                <Switch checkedChildren="Available" unCheckedChildren="Unavailable" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.is_chargeable !== currentValues.is_chargeable}
          >
            {({ getFieldValue }) => {
              const isChargeable = getFieldValue('is_chargeable');
              return isChargeable ? (
                <Form.Item
                  name="price"
                  label="Price ($)"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    placeholder="0.00"
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="icon"
            label="Icon (Optional)"
          >
            <Input placeholder="Enter icon name or emoji" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacilitiesPage;
