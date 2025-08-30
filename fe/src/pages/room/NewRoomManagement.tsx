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
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import type { Room, CreateRoomRequest, ROOM_TYPE_OPTIONS } from '@/types/api';
import { roomApi } from '@/api/backend.api';

const { Column } = Table;
const { Option } = Select;
const { TextArea } = Input;

const NewRoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedTenant] = useState<number>(1); // Default tenant từ API test
  const [form] = Form.useForm();

  // Load rooms từ API đã test thành công - 3 records
  const loadRooms = async (tenantId: number = 1) => {
    setLoading(true);
    try {
      const response = await roomApi.getAll(tenantId);
      
      if (response.result && Array.isArray(response.result)) {
        setRooms(response.result);
        message.success(`✅ Loaded ${response.result.length} rooms successfully`);
      } else {
        setRooms([]);
        message.info('No rooms found');
      }
    } catch (error) {
      console.error('Load rooms error:', error);
      message.error('❌ Failed to load rooms');
      setRooms([]);
    }
    setLoading(false);
  };

  // Create room
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

  // Update room  
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

  // Delete room
  const handleDelete = async (room: Room) => {
    Modal.confirm({
      title: 'Delete Room',
      content: `Are you sure you want to delete room "${room.room_name}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await roomApi.delete(room.id, selectedTenant);
          
          message.success('✅ Room deleted successfully');
          loadRooms(selectedTenant);
        } catch (error) {
          console.error('Delete room error:', error);
          message.error('❌ Failed to delete room');
        }
      }
    });
  };

  // Handle form submit
  const handleSubmit = async (values: any) => {
    if (editingRoom) {
      await handleUpdate(values);
    } else {
      await handleCreate(values);
    }
  };

  // Open edit modal
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

  // Open create modal
  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    form.setFieldsValue({
      tenant_id: selectedTenant,
      is_available: true
    });
    setModalVisible(true);
  };

  useEffect(() => {
    loadRooms(selectedTenant);
  }, [selectedTenant]);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2>🏨 Room Management</h2>
            <p>Manage hotel rooms - Connected to tested backend API</p>
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

        <Divider />

        <Table 
          dataSource={rooms}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          size="middle"
        >
          <Column 
            title="Room Name" 
            dataIndex="room_name" 
            key="room_name"
            width={150}
            render={(text: string, record: Room) => (
              <div>
                <strong>{text}</strong>
                {record.room_number && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    #{record.room_number}
                  </div>
                )}
              </div>
            )}
          />
          
          <Column 
            title="Type" 
            dataIndex="room_type" 
            key="room_type"
            width={100}
            render={(type: string) => (
              <Tag color="blue">{type}</Tag>
            )}
          />
          
          <Column 
            title="Capacity" 
            dataIndex="capacity" 
            key="capacity"
            width={80}
            render={(capacity: number) => (
              <span>{capacity} guests</span>
            )}
          />
          
          <Column 
            title="Price/Night" 
            dataIndex="price_per_night" 
            key="price_per_night"
            width={120}
            render={(price: number) => (
              <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                ${price?.toLocaleString() || 'N/A'}
              </span>
            )}
          />
          
          <Column 
            title="Floor" 
            dataIndex="floor" 
            key="floor"
            width={80}
            render={(floor: number) => floor || 'N/A'}
          />
          
          <Column 
            title="Status" 
            dataIndex="is_available" 
            key="is_available"
            width={100}
            render={(available: boolean) => (
              <Tag color={available ? 'green' : 'red'}>
                {available ? 'Available' : 'Occupied'}
              </Tag>
            )}
          />
          
          <Column 
            title="Created" 
            dataIndex="created_at" 
            key="created_at"
            width={100}
            render={(date: string) => 
              new Date(date).toLocaleDateString()
            }
          />
          
          <Column
            title="Actions"
            key="actions"
            width={120}
            fixed="right"
            render={(_, record: Room) => (
              <Space size="small">
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => {
                    Modal.info({
                      title: `Room: ${record.room_name}`,
                      content: (
                        <div>
                          <p><strong>Type:</strong> {record.room_type}</p>
                          <p><strong>Capacity:</strong> {record.capacity} guests</p>
                          <p><strong>Price:</strong> ${record.price_per_night}/night</p>
                          {record.description && (
                            <p><strong>Description:</strong> {record.description}</p>
                          )}
                          {record.amenities && (
                            <p><strong>Amenities:</strong> {record.amenities}</p>
                          )}
                        </div>
                      ),
                      width: 500
                    });
                  }}
                />
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(record)}
                />
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleDelete(record)}
                />
              </Space>
            )}
          />
        </Table>

        {/* Room Form Modal */}
        <Modal
          title={editingRoom ? '✏️ Edit Room' : '➕ Add New Room'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingRoom(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
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
              <Col span={12}>
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
              <Col span={12}>
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
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Capacity"
                  name="capacity"
                  rules={[{ required: true, message: 'Please input capacity!' }]}
                >
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Floor"
                  name="floor"
                >
                  <InputNumber min={1} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Area (sqm)"
                  name="area_sqm"
                >
                  <InputNumber min={10} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

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

            <Form.Item
              label="Available"
              name="is_available"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

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
      </Card>
    </div>
  );
};

export default NewRoomManagement;
