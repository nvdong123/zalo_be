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
  Switch
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { Room, Tenant, CreateRoomRequest, ROOM_TYPE_OPTIONS } from '@/types/api';
import { request } from '@/api/request';
import { buildUrl, API_ENDPOINTS } from '@/api/endpoints';

const { Column } = Table;
const { Option } = Select;
const { TextArea } = Input;

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Load rooms
  const loadRooms = async (tenantId?: number) => {
    if (!tenantId && !selectedTenant) return;
    
    setLoading(true);
    try {
      const response = await roomApi.getAll(tenantId || selectedTenant!);
      if (response.status) {
        setRooms(response.result || []);
      } else {
        message.error('Failed to load rooms');
      }
    } catch (error) {
      console.error('Load rooms error:', error);
      message.error('Failed to load rooms');
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
      loadRooms(selectedTenant);
    }
  }, [selectedTenant]);

  // Handle create/edit
  const handleSubmit = async (values: RoomCreate) => {
    if (!selectedTenant) {
      message.error('Please select a tenant first');
      return;
    }

    try {
      const roomData = {
        ...values,
        tenant_id: selectedTenant
      };

      if (editingRoom) {
        await roomApi.update(editingRoom.id, roomData, selectedTenant);
        message.success('Room updated successfully');
      } else {
        await roomApi.create(roomData, selectedTenant);
        message.success('Room created successfully');
      }
      
      setModalVisible(false);
      setEditingRoom(null);
      form.resetFields();
      loadRooms();
    } catch (error) {
      console.error('Save room error:', error);
      message.error('Failed to save room');
    }
  };

  // Handle delete
  const handleDelete = async (room: RoomRead) => {
    Modal.confirm({
      title: 'Delete Room',
      content: `Are you sure you want to delete room "${room.room_name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await roomApi.delete(room.id, selectedTenant!);
          message.success('Room deleted successfully');
          loadRooms();
        } catch (error) {
          console.error('Delete room error:', error);
          message.error('Failed to delete room');
        }
      },
    });
  };

  // Handle edit
  const handleEdit = (room: RoomRead) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setModalVisible(true);
  };

  // Handle create new
  const handleCreate = () => {
    if (!selectedTenant) {
      message.error('Please select a tenant first');
      return;
    }
    setEditingRoom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const getRoomTypeColor = (type: string) => {
    const colors: {[key: string]: string} = {
      'single': 'blue',
      'double': 'green',
      'suite': 'purple',
      'deluxe': 'gold',
      'presidential': 'red'
    };
    return colors[type] || 'default';
  };

  return (
    <Card>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <h2>Room Management</h2>
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
            Add New Room
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={rooms}
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
          title="Room Name"
          dataIndex="room_name"
          key="room_name"
          render={(text: string) => <strong>{text}</strong>}
        />
        
        <Column
          title="Price"
          dataIndex="price"
          key="price"
          render={(price: number) => `$${price?.toLocaleString() || 0}`}
        />
        
        <Column
          title="Capacity"
          key="capacity"
          render={(record: RoomRead) => `${record.capacity_adults || 0} adults${record.capacity_children ? ` + ${record.capacity_children} children` : ''}`}
        />
        
        <Column
          title="Status"
          dataIndex="status"
          key="status"
          render={(status: string) => {
            const color = status === 'available' ? 'green' : 
                         status === 'occupied' ? 'red' : 
                         status === 'maintenance' ? 'orange' : 'default';
            return <Tag color={color}>{status?.toUpperCase()}</Tag>;
          }}
        />
        
        <Column
          title="Actions"
          key="actions"
          width={150}
          render={(_, record: RoomRead) => (
            <Space>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => {
                  Modal.info({
                    title: `Room ${record.room_name}`,
                    width: 600,
                    content: (
                      <div>
                        <p><strong>Name:</strong> {record.room_name}</p>
                        <p><strong>Type:</strong> {record.room_type}</p>
                        <p><strong>Price:</strong> ${record.price}</p>
                        <p><strong>Capacity:</strong> {record.capacity_adults} adults {record.capacity_children ? `+ ${record.capacity_children} children` : ''}</p>
                        <p><strong>Description:</strong> {record.description}</p>
                      </div>
                    ),
                  });
                }}
              >
                View
              </Button>
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
        title={editingRoom ? 'Edit Room' : 'Create New Room'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRoom(null);
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="room_name"
                label="Room Name"
                rules={[{ required: true, message: 'Please enter room name' }]}
              >
                <Input placeholder="Deluxe Ocean View" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="room_type"
                label="Room Type"
                rules={[{ required: true, message: 'Please select room type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="single">Single</Option>
                  <Option value="double">Double</Option>
                  <Option value="suite">Suite</Option>
                  <Option value="deluxe">Deluxe</Option>
                  <Option value="presidential">Presidential</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price per Night ($)"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="capacity_adults"
                label="Adult Capacity"
                rules={[{ required: true, message: 'Please enter adult capacity' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity_children"
                label="Children Capacity"
                initialValue={0}
              >
                <InputNumber min={0} max={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="size_m2"
                label="Size (m²)"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              rows={3} 
              placeholder="Room description, amenities, etc." 
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoomManagement;
