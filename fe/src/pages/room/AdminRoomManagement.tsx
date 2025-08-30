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
  InputNumber, 
  Select, 
  Tag,
  Row,
  Col,
  Switch,
  Divider,
  Typography,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Room, CreateRoomRequest } from '@/types/api';
import { roomApi } from '@/api/backend.api';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Search } = Input;

const AdminRoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedTenant] = useState<number>(1); // Default tenant từ API test
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [form] = Form.useForm();

  // Load rooms từ API - react-antd-admin pattern
  const loadRooms = async (tenantId: number = 1) => {
    setLoading(true);
    try {
      const response = await roomApi.getAll(tenantId);
      
      if (response.result && Array.isArray(response.result)) {
        setRooms(response.result);
        setFilteredRooms(response.result);
        message.success(`✅ Loaded ${response.result.length} rooms successfully`);
      } else {
        setRooms([]);
        setFilteredRooms([]);
        message.info('No rooms found');
      }
    } catch (error) {
      console.error('Load rooms error:', error);
      message.error('❌ Failed to load rooms');
      setRooms([]);
      setFilteredRooms([]);
    }
    setLoading(false);
  };

  // Filter and search functions - react-antd-admin pattern
  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, filterType);
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    applyFilters(searchText, type);
  };

  const applyFilters = (search: string, type: string) => {
    let filtered = rooms;

    // Apply text search
    if (search) {
      filtered = filtered.filter(room => 
        room.room_name.toLowerCase().includes(search.toLowerCase()) ||
        room.room_type.toLowerCase().includes(search.toLowerCase()) ||
        (room.room_number && room.room_number.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply type filter
    if (type !== 'all') {
      if (type === 'available') {
        filtered = filtered.filter(room => room.is_available);
      } else if (type === 'occupied') {
        filtered = filtered.filter(room => !room.is_available);
      } else {
        filtered = filtered.filter(room => room.room_type === type);
      }
    }

    setFilteredRooms(filtered);
  };

  // CRUD Operations
  const handleCreate = async (values: any) => {
    try {
      const roomData: CreateRoomRequest = {
        ...values,
        tenant_id: selectedTenant,
        is_available: values.is_available ?? true
      };
      
      const response = await roomApi.create(roomData, selectedTenant);
      
      if (response.result) {
        message.success('✅ Room created successfully');
        setModalVisible(false);
        form.resetFields();
        loadRooms(selectedTenant);
      }
    } catch (error) {
      console.error('Create room error:', error);
      message.error('❌ Failed to create room');
    }
  };

  const handleUpdate = async (values: any) => {
    if (!editingRoom) return;
    
    try {
      const response = await roomApi.update(editingRoom.id, values, selectedTenant);
      
      if (response.result) {
        message.success('✅ Room updated successfully');
        setModalVisible(false);
        setEditingRoom(null);
        form.resetFields();
        loadRooms(selectedTenant);
      }
    } catch (error) {
      console.error('Update room error:', error);
      message.error('❌ Failed to update room');
    }
  };

  const handleDelete = async (room: Room) => {
    try {
      await roomApi.delete(room.id, selectedTenant);
      message.success('✅ Room deleted successfully');
      loadRooms(selectedTenant);
    } catch (error) {
      console.error('Delete room error:', error);
      message.error('❌ Failed to delete room');
    }
  };

  const handleSubmit = async (values: any) => {
    if (editingRoom) {
      await handleUpdate(values);
    } else {
      await handleCreate(values);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue({
      room_name: room.room_name,
      room_type: room.room_type,
      room_number: room.room_number,
      floor: room.floor,
      capacity: room.capacity,
      price_per_night: room.price_per_night,
      description: room.description,
      amenities: room.amenities,
      area_sqm: room.area_sqm,
      bed_type: room.bed_type,
      is_available: room.is_available
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    form.setFieldsValue({
      tenant_id: selectedTenant,
      is_available: true
    });
    setModalVisible(true);
  };

  // Table columns - react-antd-admin style
  const columns: ColumnsType<Room> = [
    {
      title: 'Room Info',
      key: 'roomInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {record.room_name}
          </Title>
          {record.room_number && (
            <Text type="secondary">#{record.room_number}</Text>
          )}
          <br />
          <Tag color="blue">{record.room_type}</Tag>
        </div>
      ),
    },
    {
      title: 'Capacity & Floor',
      key: 'details',
      width: 150,
      render: (_, record) => (
        <div>
          <div>👥 {record.capacity} guests</div>
          <div>🏢 Floor {record.floor || 'N/A'}</div>
          {record.area_sqm && <div>📐 {record.area_sqm}m²</div>}
        </div>
      ),
    },
    {
      title: 'Price/Night',
      dataIndex: 'price_per_night',
      key: 'price_per_night',
      width: 120,
      sorter: (a, b) => (a.price_per_night || 0) - (b.price_per_night || 0),
      render: (price: number) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
            ${price?.toLocaleString() || 'TBD'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Available', value: true },
        { text: 'Occupied', value: false },
      ],
      onFilter: (value, record) => record.is_available === value,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <Tag 
            color={record.is_available ? 'green' : 'red'}
            style={{ minWidth: '70px' }}
          >
            {record.is_available ? '✅ Available' : '🔴 Occupied'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Bed Type',
      dataIndex: 'bed_type',
      key: 'bed_type',
      width: 100,
      render: (type: string) => type ? <Tag color="purple">{type}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: `🏨 ${record.room_name}`,
                  content: (
                    <div style={{ marginTop: 16 }}>
                      <p><strong>Type:</strong> {record.room_type}</p>
                      <p><strong>Capacity:</strong> {record.capacity} guests</p>
                      <p><strong>Price:</strong> ${record.price_per_night}/night</p>
                      <p><strong>Floor:</strong> {record.floor || 'N/A'}</p>
                      {record.bed_type && <p><strong>Bed:</strong> {record.bed_type}</p>}
                      {record.area_sqm && <p><strong>Area:</strong> {record.area_sqm}m²</p>}
                      {record.description && <p><strong>Description:</strong> {record.description}</p>}
                      {record.amenities && <p><strong>Amenities:</strong> {record.amenities}</p>}
                    </div>
                  ),
                  width: 500
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Room">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Room">
            <Popconfirm
              title={`Are you sure to delete "${record.room_name}"?`}
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadRooms(selectedTenant);
  }, [selectedTenant]);

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header - react-antd-admin style */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            🏨 Room Management
          </Title>
          <Text type="secondary">
            Manage hotel rooms with full CRUD operations
          </Text>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => loadRooms(selectedTenant)}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Add Room
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filters and Search - react-antd-admin pattern */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search rooms by name, type, or number..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          <Col>
            <Select
              value={filterType}
              onChange={handleFilterChange}
              style={{ width: 150 }}
              size="large"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Rooms</Option>
              <Option value="available">Available</Option>
              <Option value="occupied">Occupied</Option>
              <Option value="standard">Standard</Option>
              <Option value="deluxe">Deluxe</Option>
              <Option value="suite">Suite</Option>
              <Option value="presidential">Presidential</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card>
        <Table 
          dataSource={filteredRooms}
          columns={columns}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredRooms.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} rooms`,
          }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>Summary</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text strong>Avg: ${Math.round(filteredRooms.reduce((sum, r) => sum + (r.price_per_night || 0), 0) / filteredRooms.length) || 0}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Tag color="green">{filteredRooms.filter(r => r.is_available).length} Available</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} colSpan={3}>
                  <Text type="secondary">Total: {filteredRooms.length} rooms</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* Room Form Modal - react-antd-admin style */}
      <Modal
        title={
          <Space>
            {editingRoom ? <EditOutlined /> : <PlusOutlined />}
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRoom(null);
          form.resetFields();
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            tenant_id: selectedTenant,
            is_available: true,
            capacity: 2,
            floor: 1
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Room Name"
                name="room_name"
                rules={[{ required: true, message: 'Please input room name!' }]}
              >
                <Input placeholder="e.g. Deluxe Ocean View" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Room Number"
                name="room_number"
              >
                <Input placeholder="e.g. 101" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Room Type"
                name="room_type"
                rules={[{ required: true, message: 'Please select room type!' }]}
              >
                <Select placeholder="Select room type">
                  <Option value="standard">Standard</Option>
                  <Option value="deluxe">Deluxe</Option>
                  <Option value="suite">Suite</Option>
                  <Option value="presidential">Presidential</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Bed Type"
                name="bed_type"
              >
                <Select placeholder="Select bed type">
                  <Option value="single">Single Bed</Option>
                  <Option value="double">Double Bed</Option>
                  <Option value="queen">Queen Bed</Option>
                  <Option value="king">King Bed</Option>
                  <Option value="twin">Twin Beds</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Available"
                name="is_available"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Capacity"
                name="capacity"
                rules={[{ required: true, message: 'Please input capacity!' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Floor"
                name="floor"
              >
                <InputNumber min={1} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Area (sqm)"
                name="area_sqm"
              >
                <InputNumber min={10} max={500} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Price per Night ($)"
                name="price_per_night"
                rules={[{ required: true, message: 'Please input price!' }]}
              >
                <InputNumber 
                  min={0} 
                  max={10000}
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Room description..." />
          </Form.Item>

          <Form.Item
            label="Amenities"
            name="amenities"
          >
            <TextArea rows={2} placeholder="WiFi, Air conditioning, Mini bar, etc." />
          </Form.Item>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingRoom(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                {editingRoom ? 'Update Room' : 'Create Room'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminRoomManagement;
