import React, { useState } from 'react';
import {
  Table, Button, Space, Card, Modal, Form, Input, InputNumber, 
  Select, Switch, Popconfirm, Typography, Row, Col, Tag, Tooltip
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRoomsQuery, useCreateRoom, useUpdateRoom, useDeleteRoom } from './hooks';
import type { Room, CreateRoomRequest, RoomsQueryParams } from './hooks';

const { Title } = Typography;
const { Search } = Input;

const RoomsPage: React.FC = () => {
  const [queryParams, setQueryParams] = useState<RoomsQueryParams>({
    page: 1,
    size: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  // Queries and mutations
  const { data: roomsData, isLoading, refetch } = useRoomsQuery(queryParams);
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();

  // Handle table pagination and filtering
  const handleTableChange = (pagination: any, filters: any) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current,
      size: pagination.pageSize,
      room_type: filters.room_type?.[0],
      is_available: filters.is_available?.[0],
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
    setEditingRoom(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRoom) {
        await updateRoomMutation.mutateAsync({ id: editingRoom.id, ...values });
      } else {
        await createRoomMutation.mutateAsync(values);
      }
      
      handleModalCancel();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    await deleteRoomMutation.mutateAsync(id);
  };

  // Table columns
  const columns: ColumnsType<Room> = [
    {
      title: 'Room Name',
      dataIndex: 'room_name',
      key: 'room_name',
      render: (text: string, record: Room) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Type: {record.room_type}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'room_type',
      key: 'room_type',
      filters: [
        { text: 'Standard', value: 'Standard' },
        { text: 'Deluxe', value: 'Deluxe' },
        { text: 'Suite', value: 'Suite' },
        { text: 'Premium', value: 'Premium' },
      ],
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 120,
      render: (capacity: number) => `${capacity} guests`,
    },
    {
      title: 'Price/Night',
      dataIndex: 'price_per_night',
      key: 'price_per_night',
      width: 120,
      render: (price: number) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ${price?.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_available',
      key: 'is_available',
      width: 100,
      filters: [
        { text: 'Available', value: true },
        { text: 'Unavailable', value: false },
      ],
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'success' : 'error'}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </Tag>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record: Room) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this room?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Room Management
              </Title>
            </Col>
            <Col>
              <Space>
                <Search
                  placeholder="Search rooms..."
                  allowClear
                  enterButton
                  style={{ width: 300 }}
                  onSearch={handleSearch}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  loading={isLoading}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateModal}
                >
                  Add Room
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={roomsData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.size,
            total: roomsData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} rooms`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRoom ? 'Edit Room' : 'Create Room'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={createRoomMutation.isPending || updateRoomMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            capacity: 2,
            room_type: 'Standard',
            is_available: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="room_name"
                label="Room Name"
                rules={[{ required: true, message: 'Please enter room name' }]}
              >
                <Input placeholder="e.g., Ocean View Suite" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="room_number"
                label="Room Number"
              >
                <Input placeholder="e.g., 101" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="room_type"
                label="Room Type"
                rules={[{ required: true, message: 'Please select room type' }]}
              >
                <Select
                  options={[
                    { label: 'Standard', value: 'Standard' },
                    { label: 'Deluxe', value: 'Deluxe' },
                    { label: 'Suite', value: 'Suite' },
                    { label: 'Premium', value: 'Premium' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="floor"
                label="Floor"
              >
                <InputNumber
                  min={1}
                  max={50}
                  style={{ width: '100%' }}
                  placeholder="Floor number"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true, message: 'Please enter capacity' }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                  addonAfter="guests"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price_per_night"
                label="Price per Night"
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="area_sqm"
                label="Area (m²)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Room area"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bed_type"
                label="Bed Type"
              >
                <Select
                  placeholder="Select bed type"
                  options={[
                    { label: 'Single', value: 'Single' },
                    { label: 'Double', value: 'Double' },
                    { label: 'Queen', value: 'Queen' },
                    { label: 'King', value: 'King' },
                    { label: 'Twin', value: 'Twin' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Room description..."
            />
          </Form.Item>

          <Form.Item
            name="amenities"
            label="Amenities"
          >
            <Input.TextArea
              rows={2}
              placeholder="e.g., WiFi, Air Conditioning, Mini Bar..."
            />
          </Form.Item>

          <Form.Item
            name="is_available"
            label="Available"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomsPage;
